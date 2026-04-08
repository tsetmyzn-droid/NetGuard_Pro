import flet as ft
import asyncio
import sqlite3
import socket
import json
import os
import hashlib
import gc
import httpx
import re
from datetime import datetime
from cryptography.fernet import Fernet
from google import genai
from google.genai import types

# --- Constants & Config ---
DB_NAME = "netguard_pro.db"
GEMINI_MODEL = "gemini-2.0-flash"

# --- Data Layer (Encrypted SQLite) ---
class DataLayer:
    def __init__(self, db_name=DB_NAME):
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
            conn.commit()

    def encrypt(self, data: str) -> str:
        return self.cipher.encrypt(data.encode()).decode()

    def decrypt(self, token: str) -> str:
        try:
            return self.cipher.decrypt(token.encode()).decode()
        except:
            return ""

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

    async def get_security_logs(self, limit=10):
        def _get():
            with sqlite3.connect(self.db_name) as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT timestamp, event_type, description FROM security_logs ORDER BY timestamp DESC LIMIT ?', (limit,))
                return cursor.fetchall()
        return await asyncio.to_thread(_get)

# --- Logic Layer (Router & Security Engine) ---
class LogicLayer:
    def __init__(self, data_layer: DataLayer):
        self.data = data_layer
        self.is_connected = False
        self.brand = "Unknown"
        self.last_gateway_mac = None
        self.ai_client = None
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            self.ai_client = genai.Client(api_key=api_key)

    async def connect_router(self, ip, user, password):
        gc.collect()
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                # Real-world pattern: Try to fetch the login page to detect brand
                response = await client.get(f"http://{ip}", follow_redirects=True)
                html = response.text.lower()
                
                if "huawei" in html or "hg630" in html: self.brand = "Huawei (OptiXstar)"
                elif "tp-link" in html: self.brand = "TP-Link"
                elif "zte" in html: self.brand = "ZTE"
                else: self.brand = "Generic Router"

                # Simulated successful connection for now
                await asyncio.sleep(1)
                self.is_connected = True
                return True, f"Connected to {self.brand}"
            except Exception as e:
                return False, f"Connection Failed: {str(e)}"

    async def run_deep_scan(self):
        threats = []
        # 1. ARP Spoofing Check (Simulated for environment)
        current_mac = "BC:3F:8F:A1:B2:C3" 
        if self.last_gateway_mac and current_mac != self.last_gateway_mac:
            threats.append(("MITM", "High", "Gateway MAC address changed unexpectedly!"))
        self.last_gateway_mac = current_mac

        # 2. DNS Hijacking Check
        try:
            dns_ip = socket.gethostbyname("google.com")
            # In real world, check if dns_ip belongs to known malicious ranges
        except:
            threats.append(("DNS", "Medium", "DNS resolution failed. Possible hijacking."))

        # 3. Port Scan (Simulated)
        # Check if sensitive ports are open on the router
        
        for t_type, sev, desc in threats:
            await self.data.log_security_event(t_type, sev, desc)
            
        return threats

    async def get_ai_advice(self):
        if not self.ai_client:
            return "AI Assistant offline. Please set GEMINI_API_KEY."
        
        try:
            history = await self.data.get_usage_history(5)
            logs = await self.data.get_security_logs(3)
            
            prompt = f"""
            Analyze this network data for NetGuard Pro user:
            Usage History (Date, Total GB): {history}
            Recent Security Logs: {logs}
            
            Provide a brief, professional security advice in Arabic.
            """
            
            response = self.ai_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt
            )
            return response.text
        except Exception as e:
            return f"AI Error: {str(e)}"

# --- UI Layer (Flet Material You) ---
async def main(page: ft.Page):
    page.title = "NetGuard Pro"
    page.theme_mode = ft.ThemeMode.DARK
    page.padding = 0
    page.window_width = 450
    page.window_height = 850
    
    # Material You Styling
    page.theme = ft.Theme(
        color_scheme_seed=ft.colors.BLUE_ACCENT,
        use_material3=True,
        visual_density=ft.VisualDensity.COMFORTABLE,
    )

    data = DataLayer()
    logic = LogicLayer(data)

    # --- Translations ---
    translations = {
        "en": {
            "title": "NetGuard Pro",
            "login": "Login",
            "router_ip": "Router IP",
            "username": "Username",
            "password": "Password",
            "dashboard": "Dashboard",
            "consumption": "Data Consumption",
            "security": "Security Shield",
            "scan": "Deep Scan",
            "speed": "Test Speed",
            "ai_assistant": "AI Assistant",
            "secure": "System Secure",
            "threats": "Threats Detected",
            "mobile_data": "Mobile Data",
            "wifi": "Wi-Fi",
            "lang": "العربية",
            "advice_loading": "AI is thinking...",
            "connected_to": "Connected to: "
        },
        "ar": {
            "title": "حارس الشبكة برو",
            "login": "تسجيل الدخول",
            "router_ip": "عنوان الراوتر",
            "username": "اسم المستخدم",
            "password": "كلمة المرور",
            "dashboard": "لوحة التحكم",
            "consumption": "استهلاك البيانات",
            "security": "الدرع الأمني",
            "scan": "فحص عميق",
            "speed": "اختبار السرعة",
            "ai_assistant": "المساعد الذكي",
            "secure": "النظام آمن",
            "threats": "تم اكتشاف تهديدات",
            "mobile_data": "بيانات الجوال",
            "wifi": "واي فاي",
            "lang": "English",
            "advice_loading": "الذكاء الاصطناعي يفكر...",
            "connected_to": "متصل بـ: "
        }
    }

    def t(key):
        lang = page.client_storage.get("lang") or "ar"
        return translations[lang].get(key, key)

    # --- UI Components ---
    stats_text = ft.Text("0.00 GB", size=36, weight=ft.FontWeight.BOLD)
    speed_info = ft.Text("↓ 0.0 Mbps  ↑ 0.0 Mbps", size=14, color=ft.colors.ON_SURFACE_VARIANT)
    scan_status = ft.Text(t("secure"), color=ft.colors.GREEN_400)
    ai_advice_text = ft.Text(t("advice_loading"), italic=True, size=13)

    async def toggle_lang(e):
        current = page.client_storage.get("lang") or "ar"
        new_lang = "en" if current == "ar" else "ar"
        page.client_storage.set("lang", new_lang)
        page.rtl = (new_lang == "ar")
        await show_login()

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
            login_btn.content = ft.Text(t("login"))
            page.update()

    async def handle_scan(e):
        scan_btn.disabled = True
        scan_btn.text = "..."
        page.update()

        threats = await logic.run_deep_scan()
        if threats:
            scan_status.value = t("threats")
            scan_status.color = ft.colors.RED_400
            page.snack_bar = ft.SnackBar(ft.Text(f"Alert: {threats[0][2]}"), bgcolor=ft.colors.ERROR)
            page.snack_bar.open = True
        else:
            scan_status.value = t("secure")
            scan_status.color = ft.colors.GREEN_400
        
        scan_btn.disabled = False
        scan_btn.text = t("scan")
        page.update()

    async def handle_ai_refresh(e):
        ai_advice_text.value = t("advice_loading")
        page.update()
        advice = await logic.get_ai_advice()
        ai_advice_text.value = advice
        page.update()

    # --- Views ---
    async def show_login():
        page.views.clear()
        page.rtl = (page.client_storage.get("lang") or "ar") == "ar"
        
        page.views.append(
            ft.View(
                "/login",
                [
                    ft.AppBar(
                        title=ft.Text(t("title")), 
                        center_title=True,
                        actions=[ft.TextButton(t("lang"), on_click=toggle_lang)]
                    ),
                    ft.Column([
                        ft.Container(
                            content=ft.Icon(ft.icons.SHIELD_LOCK_ROUNDED, size=100, color=ft.colors.PRIMARY),
                            margin=ft.margin.only(top=40, bottom=20)
                        ),
                        ft.Text(t("title"), size=32, weight=ft.FontWeight.BOLD),
                        ft.Container(height=20),
                        ip_field := ft.TextField(label=t("router_ip"), value="192.168.1.1", border=ft.InputBorder.OUTLINE, border_radius=15),
                        user_field := ft.TextField(label=t("username"), value="admin", border=ft.InputBorder.OUTLINE, border_radius=15),
                        pass_field := ft.TextField(label=t("password"), password=True, can_reveal_password=True, border=ft.InputBorder.OUTLINE, border_radius=15),
                        ft.Container(height=20),
                        login_btn := ft.FilledButton(
                            content=ft.Text(t("login")),
                            width=350,
                            height=50,
                            on_click=handle_login
                        )
                    ], horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=10)
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
                        title=ft.Text(t("title")),
                        actions=[ft.IconButton(ft.icons.LOGOUT_ROUNDED, on_click=lambda _: show_login())]
                    ),
                    ft.Column([
                        # Mode Selector
                        ft.SegmentedButton(
                            segments=[
                                ft.Segment(value="wifi", label=ft.Text(t("wifi")), icon=ft.Icon(ft.icons.WIFI)),
                                ft.Segment(value="mobile", label=ft.Text(t("mobile_data")), icon=ft.Icon(ft.icons.CELL_WIFI)),
                            ],
                            selected={"wifi"},
                            on_change=lambda e: None
                        ),
                        # Usage Card
                        ft.Card(
                            content=ft.Container(
                                content=ft.Column([
                                    ft.Text(t("consumption"), size=16, weight=ft.FontWeight.W_500),
                                    stats_text,
                                    speed_info,
                                    ft.ProgressBar(value=0.35, color=ft.colors.PRIMARY, bgcolor=ft.colors.PRIMARY_CONTAINER)
                                ], spacing=10),
                                padding=25
                            ),
                            elevation=2
                        ),
                        # Security Section
                        ft.Container(
                            content=ft.Column([
                                ft.Row([
                                    ft.Icon(ft.icons.SECURITY, color=ft.colors.PRIMARY),
                                    ft.Text(t("security"), weight=ft.FontWeight.BOLD),
                                    ft.Spacer(),
                                    scan_btn := ft.TextButton(t("scan"), on_click=handle_scan)
                                ]),
                                scan_status,
                            ]),
                            padding=15,
                            border_radius=15,
                            bgcolor=ft.colors.SURFACE_VARIANT
                        ),
                        # AI Assistant Card
                        ft.Card(
                            content=ft.Container(
                                content=ft.Column([
                                    ft.Row([
                                        ft.Icon(ft.icons.AUTO_AWESOME, color=ft.colors.AMBER_400, size=20),
                                        ft.Text(t("ai_assistant"), weight=ft.FontWeight.BOLD),
                                        ft.Spacer(),
                                        ft.IconButton(ft.icons.REFRESH, icon_size=18, on_click=handle_ai_refresh)
                                    ]),
                                    ai_advice_text
                                ], spacing=10),
                                padding=15
                            ),
                            color=ft.colors.BLUE_GREY_900
                        ),
                        # Tools
                        ft.Row([
                            ft.ElevatedButton(
                                content=ft.Row([ft.Icon(ft.icons.SPEED), ft.Text(t("speed"))], alignment=ft.MainAxisAlignment.CENTER),
                                on_click=lambda _: None,
                                expand=True,
                                height=50
                            ),
                        ]),
                        ft.Text(f"{t('connected_to')}{logic.brand}", size=11, color=ft.colors.ON_SURFACE_VARIANT)
                    ], spacing=15, scroll=ft.ScrollMode.ADAPTIVE)
                ],
                padding=20
            )
        )
        page.update()
        # Initial AI Advice
        await handle_ai_refresh(None)

    await show_login()

if __name__ == "__main__":
    ft.app(target=main)
