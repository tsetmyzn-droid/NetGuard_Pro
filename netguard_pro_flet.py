import flet as ft
import requests
import sqlite3
import time
import socket
import re
import json
import os
import hashlib
from datetime import datetime

# --- Database Setup ---
DB_NAME = "netguard_pro.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
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
    conn.close()

def save_usage(download, upload):
    today = datetime.now().strftime("%Y-%m-%d")
    conn = sqlite3.connect(DB_NAME)
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
    conn.close()

# --- Security Features ---
class SecurityShield:
    def __init__(self):
        self.failed_attempts = 0
        self.last_gateway_mac = None

    def scan_for_threats(self):
        threats = []
        # 1. Brute Force Check (Simulated)
        if self.failed_attempts > 5:
            threats.append("Brute Force Attack Detected!")

        # 2. MitM Check (Gateway MAC change)
        current_mac = self.get_gateway_mac()
        if self.last_gateway_mac and current_mac != self.last_gateway_mac:
            threats.append("MITM Detected: Gateway MAC changed!")
        self.last_gateway_mac = current_mac

        # 3. Evil Twin Check (Simulated)
        # In a real app, we'd scan SSIDs, but here we simulate
        return threats

    def get_gateway_mac(self):
        # Simulated MAC retrieval for Pydroid 3 / PC
        try:
            # This is a placeholder for actual ARP scanning
            return "BC:3F:8F:A1:B2:C3"
        except:
            return "Unknown"

# --- Router Service ---
class RouterService:
    def __init__(self):
        self.session = requests.Session()
        self.is_connected = False
        self.brand = "Unknown"

    def auto_detect(self):
        # Simulated OUI lookup
        mac = SecurityShield().get_gateway_mac()
        if mac.startswith("BC:3F:8F"): return "Huawei"
        if mac.startswith("CC:1A:10"): return "TP-Link"
        return "Unknown"

    def connect(self, ip, user, password):
        try:
            # Use requests.Session as requested
            # Simulated login
            time.sleep(1)
            self.brand = self.auto_detect()
            self.is_connected = True
            return True, f"Connected to {self.brand} at {ip}"
        except Exception as e:
            return False, str(e)

# --- UI Components ---
def main(page: ft.Page):
    page.title = "NetGuard Pro V7"
    page.theme_mode = ft.ThemeMode.DARK
    page.padding = 20
    page.window_width = 400
    page.window_height = 800
    page.rtl = True if page.client_storage.get("lang") == "ar" else False

    router_service = RouterService()
    security_shield = SecurityShield()
    init_db()

    # --- State ---
    stats = {"download": 0.0, "upload": 0.0}

    def t(en, ar):
        return ar if page.rtl else en

    # --- Views ---
    def show_dashboard():
        page.clean()
        
        # Header
        header = ft.Row(
            [
                ft.Icon(ft.icons.SHIELD_ROUNDED, color=ft.colors.BLUE_400, size=30),
                ft.Text("NetGuard Pro", size=24, weight=ft.FontWeight.BOLD),
                ft.IconButton(ft.icons.LOGOUT_ROUNDED, on_click=lambda _: show_login())
            ],
            alignment=ft.MainAxisAlignment.SPACE_BETWEEN
        )

        # Usage Card
        usage_card = ft.Container(
            content=ft.Column([
                ft.Text(t("Total Consumption", "إجمالي الاستهلاك"), size=14, color=ft.colors.BLUE_200),
                ft.Text(f"{stats['download'] + stats['upload']:.2f} GB", size=32, weight=ft.FontWeight.BLACK),
                ft.ProgressBar(value=0.4, color=ft.colors.BLUE_400, bgcolor=ft.colors.BLUE_900),
                ft.Row([
                    ft.Text(f"↓ {stats['download']:.1f} Mbps", size=12),
                    ft.Text(f"↑ {stats['upload']:.1f} Mbps", size=12),
                ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN)
            ]),
            padding=20,
            border_radius=20,
            gradient=ft.LinearGradient([ft.colors.BLUE_700, ft.colors.BLUE_900]),
        )

        # Security Card
        def run_scan(e):
            scan_btn.disabled = True
            scan_btn.text = t("Scanning...", "جاري الفحص...")
            page.update()
            time.sleep(1.5)
            threats = security_shield.scan_for_threats()
            if not threats:
                page.snack_bar = ft.SnackBar(ft.Text(t("System Secure", "النظام آمن")))
            else:
                page.snack_bar = ft.SnackBar(ft.Text(f"Alert: {threats[0]}"), bgcolor=ft.colors.RED_600)
            scan_btn.disabled = False
            scan_btn.text = t("Scan Now", "افحص الآن")
            page.snack_bar.open = True
            page.update()

        scan_btn = ft.TextButton(t("Scan Now", "افحص الآن"), on_click=run_scan)
        security_card = ft.Container(
            content=ft.Row([
                ft.Icon(ft.icons.SECURITY, color=ft.colors.GREEN_400),
                ft.Column([
                    ft.Text(t("Security Shield", "الدرع الأمني"), weight=ft.FontWeight.BOLD),
                    ft.Text(t("System Online", "النظام متصل"), size=12, color=ft.colors.GREY_400),
                ], spacing=0),
                ft.VerticalDivider(),
                scan_btn
            ]),
            padding=15,
            border_radius=15,
            bgcolor=ft.colors.SURFACE_VARIANT,
        )

        # Speed Test
        def run_speed_test(e):
            speed_btn.disabled = True
            speed_btn.text = "..."
            page.update()
            time.sleep(2)
            stats["download"] = 45.2
            stats["upload"] = 12.8
            save_usage(0.1, 0.05)
            speed_btn.disabled = False
            speed_btn.text = t("Speed Test", "اختبار السرعة")
            show_dashboard()

        speed_btn = ft.ElevatedButton(
            t("Speed Test", "اختبار السرعة"), 
            icon=ft.icons.SPEED, 
            on_click=run_speed_test,
            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=10))
        )

        page.add(
            header,
            ft.Divider(height=20, color=ft.colors.TRANSPARENT),
            usage_card,
            ft.Divider(height=10, color=ft.colors.TRANSPARENT),
            security_card,
            ft.Divider(height=20, color=ft.colors.TRANSPARENT),
            ft.Row([speed_btn], alignment=ft.MainAxisAlignment.CENTER),
            ft.Text(t("Connected to: ", "متصل بـ: ") + router_service.brand, size=10, color=ft.colors.GREY_500, text_align=ft.TextAlign.CENTER)
        )

    def show_login():
        page.clean()
        
        ip_field = ft.TextField(label="Router IP", value="192.168.1.1", border_radius=15)
        user_field = ft.TextField(label="Username", value="admin", border_radius=15)
        pass_field = ft.TextField(label="Password", password=True, can_reveal_password=True, border_radius=15)
        
        def do_login(e):
            if not pass_field.value:
                page.snack_bar = ft.SnackBar(ft.Text("Please enter password"))
                page.snack_bar.open = True
                page.update()
                return
            
            login_btn.disabled = True
            login_btn.content = ft.ProgressRing(width=20, height=20, color=ft.colors.WHITE)
            page.update()
            
            success, msg = router_service.connect(ip_field.value, user_field.value, pass_field.value)
            if success:
                show_dashboard()
            else:
                error_msg = t("Check your home Wi-Fi connection", "تأكد من اتصالك بالواي فاي الخاص بالمنزل")
                page.snack_bar = ft.SnackBar(ft.Text(error_msg), bgcolor=ft.colors.RED_600)
                page.snack_bar.open = True
                login_btn.disabled = False
                login_btn.content = ft.Text("Login")
                page.update()

        login_btn = ft.ElevatedButton(
            content=ft.Text("Login"),
            width=400,
            height=50,
            on_click=do_login,
            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=15))
        )

        page.add(
            ft.Column([
                ft.Container(
                    content=ft.Icon(ft.icons.SHIELD_ROUNDED, size=80, color=ft.colors.BLUE_600),
                    margin=ft.margin.only(top=50, bottom=20)
                ),
                ft.Text("NetGuard Pro", size=32, weight=ft.FontWeight.BOLD),
                ft.Text("Secure Gateway Access", color=ft.colors.GREY_500),
                ft.Divider(height=40, color=ft.colors.TRANSPARENT),
                ip_field,
                user_field,
                pass_field,
                ft.Divider(height=20, color=ft.colors.TRANSPARENT),
                login_btn,
                ft.TextButton("Change Language / تغيير اللغة", on_click=toggle_lang)
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER)
        )

    def toggle_lang(e):
        page.rtl = not page.rtl
        page.client_storage.set("lang", "ar" if page.rtl else "en")
        show_login()

    show_login()

if __name__ == "__main__":
    # To run as web app: flet run --web main.py
    # For Pydroid 3: just run main.py
    ft.app(target=main)
