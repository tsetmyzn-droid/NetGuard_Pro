import sqlite3
import os
import asyncio
from datetime import datetime
from cryptography.fernet import Fernet
from .constants import DB_NAME, SECRET_KEY_PATH

class DataLayer:
    def __init__(self, db_name=DB_NAME):
        self.db_name = db_name
        self.key = self._get_or_create_key()
        self.cipher = Fernet(self.key)
        self._init_db()

    def _get_or_create_key(self):
        if os.path.exists(SECRET_KEY_PATH):
            with open(SECRET_KEY_PATH, "rb") as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(SECRET_KEY_PATH, "wb") as f:
                f.write(key)
            return key

    def _init_db(self):
        try:
            with sqlite3.connect(self.db_name) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS usage_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        date TEXT UNIQUE,
                        download REAL,
                        upload REAL,
                        total REAL
                    )
                ''')
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS security_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        event_type TEXT,
                        severity TEXT,
                        description TEXT
                    )
                ''')
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS settings (
                        key TEXT PRIMARY KEY,
                        value TEXT
                    )
                ''')
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS trusted_devices (
                        mac_address TEXT PRIMARY KEY,
                        name TEXT
                    )
                ''')
                conn.commit()
        except Exception as e:
            print(f"Database initialization error: {e}")

    def encrypt(self, data: str) -> str:
        if not data: return ""
        return self.cipher.encrypt(data.encode()).decode()

    def decrypt(self, token: str) -> str:
        if not token: return ""
        try:
            return self.cipher.decrypt(token.encode()).decode()
        except:
            return ""

    async def set_setting(self, key, value, encrypt=True):
        val = self.encrypt(value) if encrypt else value
        def _set():
            with sqlite3.connect(self.db_name) as conn:
                cursor = conn.cursor()
                cursor.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', (key, val))
                conn.commit()
        await asyncio.to_thread(_set)

    async def get_setting(self, key, decrypt=True):
        def _get():
            with sqlite3.connect(self.db_name) as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT value FROM settings WHERE key = ?', (key,))
                row = cursor.fetchone()
                return row[0] if row else None
        val = await asyncio.to_thread(_get)
        if not val: return None
        return self.decrypt(val) if decrypt else val

    async def save_usage(self, download, upload):
        today = datetime.now().strftime("%Y-%m-%d")
        def _save():
            with sqlite3.connect(self.db_name) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO usage_history (date, download, upload, total)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(date) DO UPDATE SET
                    download = download + excluded.download,
                    upload = upload + excluded.upload,
                    total = total + excluded.total
                ''', (today, download, upload, download + upload))
                conn.commit()
        await asyncio.to_thread(_save)

    async def get_usage_history(self, limit=7):
        def _get():
            with sqlite3.connect(self.db_name) as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT date, total FROM usage_history ORDER BY date DESC LIMIT ?', (limit,))
                return cursor.fetchall()
        return await asyncio.to_thread(_get)

    async def log_security_event(self, event_type, severity, description):
        def _log():
            with sqlite3.connect(self.db_name) as conn:
                cursor = conn.cursor()
                cursor.execute('INSERT INTO security_logs (event_type, severity, description) VALUES (?, ?, ?)',
                             (event_type, severity, description))
                conn.commit()
        await asyncio.to_thread(_log)

    async def add_trusted_device(self, mac, name):
        def _add():
            with sqlite3.connect(self.db_name) as conn:
                cursor = conn.cursor()
                cursor.execute('INSERT OR REPLACE INTO trusted_devices (mac_address, name) VALUES (?, ?)', (mac, name))
                conn.commit()
        await asyncio.to_thread(_add)

    async def is_device_trusted(self, mac):
        def _check():
            with sqlite3.connect(self.db_name) as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT 1 FROM trusted_devices WHERE mac_address = ?', (mac,))
                return cursor.fetchone() is not None
        return await asyncio.to_thread(_check)

    async def get_security_logs(self, limit=10):
        def _get():
            with sqlite3.connect(self.db_name) as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT timestamp, event_type, description FROM security_logs ORDER BY timestamp DESC LIMIT ?', (limit,))
                return cursor.fetchall()
        return await asyncio.to_thread(_get)
