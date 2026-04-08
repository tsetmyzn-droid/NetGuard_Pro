import flet as ft
import asyncio
import sqlite3
import socket
import json
import os
import hashlib
import gc
import httpx
from datetime import datetime
from cryptography.fernet import Fernet

# --- Data Layer (Encrypted SQLite) ---
class DataLayer:
    def __init__(self, db_name="netguard_pro.db"):
        self.db_name = db_name
        self.key = self._get_or_create_key()
        self.cipher = Fernet(self.key)
        self._init_db()

    def _get_or_create_key(self):
        key_path = "secret.key"
        if os.path.exists(key_path):
            with open(key_path, "rb") as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(key_path, "wb") as f:
                f.write(key)
            return key

    def _init_db(self):
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
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                )
            ''')
            conn.commit()

    def encrypt(self, data: str) -> str:
        return self.cipher.encrypt(data.encode()).decode()

    def decrypt(self, token: str) -> str:
        return self.cipher.decrypt(token.encode()).decode()

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

# --- Logic Layer (Router & Security) ---
class LogicLayer:
    def __init__(self):
        self.is_connected = False
        self.brand = "Unknown"
        self.last_gateway_mac = None

    async def connect_router(self, ip, user, password):
        # Memory Management: Ensure clean start
        gc.collect()
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                # Simulated Router API Call
                await asyncio.sleep(1.5) 
                # In real scenario: response = await client.post(f"http://{ip}/login", data={"user": user, "pass": password})
                self.brand = await self.auto_detect_brand()
                self.is_connected = True
                return True, f"Connected to {self.brand}"
            except Exception as e:
                return False, f"Connection Failed: {str(e)}"
            finally:
                # Explicitly close/cleanup if needed
                pass

    async def auto_detect_brand(self):
        # Simulated OUI lookup
        return "Huawei (OptiXstar)"

    async def run_security_scan(self):
        threats = []
        await asyncio.sleep(2) # Simulate deep scan
        
        # 1. ARP Spoofing Check
        current_mac = "BC:3F:8F:A1:B2:C3" # Placeholder
        if self.last_gateway_mac and current_mac != self.last_gateway_mac:
            threats.append("MITM Detected: Gateway MAC changed!")
        self.last_gateway_mac = current_mac

        # 2. DNS Hijacking Check
        try:
            socket.gethostbyname("google.com")
        except:
            threats.append("DNS Hijacking suspected!")

        # 3. Brute Force Check (Simulated)
        # In a real app, this would track failed login attempts in the database
        if os.path.exists("failed_logins.log"):
            threats.append("Brute Force: Multiple failed login attempts detected!")

        # 4. Evil Twin Check (Simulated)
        # This would scan for SSIDs with the same name but different security
        return threats

    async def perform_speed_test(self):
        # Simulate speed test without freezing UI
        await asyncio.sleep(3)
        return {"download": 48.5, "upload": 15.2}

# --- UI Layer (Flet Material You) ---
async def main(page: ft.Page):
    page.title = "NetGuard Pro"
    page.theme_mode = ft.ThemeMode.DARK
    page.padding = 0
    page.window_width = 420
    page.window_height = 850
    
    # Material You Styling
    page.theme = ft.Theme(
        color_scheme_seed=ft.colors.BLUE_ACCENT,
        use_material3=True,
        visual_density=ft.VisualDensity.COMFORTABLE
    )

    data = DataLayer()
    logic = LogicLayer()

    # --- UI State ---
    stats_text = ft.Text("0.00 GB", size=36, weight=ft.FontWeight.BOLD)
    speed_info = ft.Text("↓ 0.0 Mbps  ↑ 0.0 Mbps", size=14, color=ft.colors.ON_SURFACE_VARIANT)
    scan_status = ft.Text("System Secure", color=ft.colors.GREEN_400)

    async def handle_login(e):
        login_btn.disabled = True
        login_btn.content = ft.ProgressRing(width=20, height=20, stroke_width=2)
        page.update()

        success, msg = await logic.connect_router(ip_field.value, user_field.value, pass_field.value)
        
        if success:
            await show_dashboard()
        else:
            page.snack_bar = ft.SnackBar(ft.Text(msg), bgcolor=ft.colors.ERROR)
            page.snack_bar.open = True
            login_btn.disabled = False
            login_btn.content = ft.Text("Login")
            page.update()

    async def handle_scan(e):
        scan_btn.disabled = True
        scan_btn.text = "Scanning..."
        page.update()

        threats = await logic.run_security_scan()
        if threats:
            scan_status.value = f"Alert: {threats[0]}"
            scan_status.color = ft.colors.RED_400
        else:
            scan_status.value = "System Secure"
            scan_status.color = ft.colors.GREEN_400
        
        scan_btn.disabled = False
        scan_btn.text = "Deep Scan"
        page.update()

    async def handle_speed_test(e):
        speed_btn.disabled = True
        speed_btn.content = ft.ProgressRing(width=20, height=20)
        page.update()

        results = await logic.perform_speed_test()
        speed_info.value = f"↓ {results['download']} Mbps  ↑ {results['upload']} Mbps"
        await data.save_usage(0.05, 0.02) # Log usage
        
        speed_btn.disabled = False
        speed_btn.content = ft.Row([ft.Icon(ft.icons.SPEED), ft.Text("Test Speed")], alignment=ft.MainAxisAlignment.CENTER)
        page.update()

    # --- Views ---
    async def show_login():
        page.views.clear()
        page.views.append(
            ft.View(
                "/login",
                [
                    ft.AppBar(title=ft.Text("NetGuard Pro Login"), center_title=True),
                    ft.Column([
                        ft.Container(
                            content=ft.Icon(ft.icons.SHIELD_LOCK_ROUNDED, size=100, color=ft.colors.PRIMARY),
                            margin=ft.margin.only(top=40, bottom=20)
                        ),
                        ip_field := ft.TextField(label="Router IP", value="192.168.1.1", border=ft.InputBorder.UNDERLINE),
                        user_field := ft.TextField(label="Username", value="admin", border=ft.InputBorder.UNDERLINE),
                        pass_field := ft.TextField(label="Password", password=True, can_reveal_password=True, border=ft.InputBorder.UNDERLINE),
                        ft.Container(height=20),
                        login_btn := ft.FilledButton(
                            content=ft.Text("Login"),
                            width=300,
                            on_click=handle_login
                        )
                    ], horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=15)
                ],
                padding=30
            )
        )
        page.update()

    async def show_dashboard():
        page.views.clear()
        page.views.append(
            ft.View(
                "/dashboard",
                [
                    ft.AppBar(
                        title=ft.Text("NetGuard Pro"),
                        actions=[ft.IconButton(ft.icons.SETTINGS, on_click=lambda _: None)]
                    ),
                    ft.Column([
                        # Usage Card
                        ft.Card(
                            content=ft.Container(
                                content=ft.Column([
                                    ft.Text("Data Consumption", size=16),
                                    stats_text,
                                    speed_info,
                                    ft.ProgressBar(value=0.3, color=ft.colors.PRIMARY)
                                ], spacing=10),
                                padding=25
                            )
                        ),
                        # Security Section
                        ft.ListTile(
                            leading=ft.Icon(ft.icons.SECURITY, color=ft.colors.PRIMARY),
                            title=ft.Text("Security Shield"),
                            subtitle=scan_status,
                            trailing=scan_btn := ft.OutlinedButton("Deep Scan", on_click=handle_scan)
                        ),
                        ft.Divider(),
                        # Tools
                        ft.Row([
                            speed_btn := ft.ElevatedButton(
                                content=ft.Row([ft.Icon(ft.icons.SPEED), ft.Text("Test Speed")], alignment=ft.MainAxisAlignment.CENTER),
                                on_click=handle_speed_test,
                                expand=True
                            ),
                        ]),
                        ft.Container(height=20),
                        ft.Text(f"Connected to: {logic.brand}", size=12, color=ft.colors.ON_SURFACE_VARIANT)
                    ], spacing=20, scroll=ft.ScrollMode.ADAPTIVE)
                ],
                padding=20
            )
        )
        page.update()

    await show_login()

if __name__ == "__main__":
    ft.app(target=main)
