import sqlite3
import os
from src.logger_config import logger

class DBManager:
    def __init__(self):
        self.db_path = os.path.join('data', 'netguard_db.sqlite')
        self._init_db()

    def _init_db(self):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Table for traffic logs
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS traffic_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    download_mb REAL,
                    upload_mb REAL,
                    device_count INTEGER
                )
            ''')
            
            # Table for detected routers
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS router_configs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ip TEXT UNIQUE,
                    model TEXT,
                    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Database initialized successfully.")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")

    def log_traffic(self, download, upload, device_count):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('INSERT INTO traffic_history (download_mb, upload_mb, device_count) VALUES (?, ?, ?)',
                           (download, upload, device_count))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to log traffic to DB: {e}")

    def get_total_consumption(self):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('SELECT SUM(download_mb), SUM(upload_mb) FROM traffic_history')
            result = cursor.fetchone()
            conn.close()
            return result if result[0] is not None else (0, 0)
        except Exception as e:
            logger.error(f"Failed to fetch total consumption: {e}")
            return (0, 0)

    def check_usage_cap(self, limit_gb):
        """Checks if current usage exceeds a specified limit."""
        dl, ul = self.get_total_consumption()
        total_gb = (dl + ul) / 1024
        if total_gb > limit_gb:
            logger.warning(f"USAGE CRITICAL: Total consumption ({total_gb:.2f} GB) exceeds limit ({limit_gb} GB).")
            return True
        return False

db_manager = DBManager()
