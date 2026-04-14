import flet as ft
import asyncio
import psutil
from core.database import DataLayer
from core.engine import LogicLayer
from core.translations import TRANSLATIONS

async def main(page: ft.Page):
    page.title = "NetGuard Pro"
    page.theme_mode = ft.ThemeMode.DARK
    page.padding = 0
    page.window_width = 450
    page.window_height = 850
    
    page.theme = ft.Theme(
        color_scheme_seed=ft.colors.CYAN_ACCENT,
        use_material3=True,
        visual_density=ft.VisualDensity.COMFORTABLE,
        font_family="Inter",
    )

    data = DataLayer()
    logic = LogicLayer(data)

    def t(key):
        lang = page.client_storage.get("lang") or "ar"
        return TRANSLATIONS[lang].get(key, key)

    # --- UI Components ---
    stats_text = ft.Text("0.00 GB", size=36, weight=ft.FontWeight.BOLD, font_family="monospace")
    speed_info = ft.Text("↓ 0.0 Mbps", size=14, color=ft.colors.CYAN_400, font_family="monospace")
    scan_status = ft.Text(t("secure"), color=ft.colors.GREEN_400, weight=ft.FontWeight.BOLD)
    
    # --- UI Handlers ---
    async def toggle_lang(e):
        current = page.client_storage.get("lang") or "ar"
        new_lang = "en" if current == "ar" else "ar"
        page.client_storage.set("lang", new_lang)
        page.rtl = (new_lang == "ar")
        await show_dashboard()

    async def handle_login(e):
        login_btn.disabled = True
        login_btn.content = ft.ProgressRing(width=20, height=20, stroke_width=2)
        page.update()
        try:
            success, msg = await logic.connect_router(ip_field.value, user_field.value, pass_field.value)
            if success:
                page.snack_bar = ft.SnackBar(ft.Text(msg), bgcolor=ft.colors.GREEN_700)
                page.snack_bar.open = True
                page.update()
                await asyncio.sleep(1.5)
                await show_dashboard()
            elif "TIMEOUT" in msg:
                def enter_offline(e):
                    page.dialog.open = False
                    logic.brand = "Offline Mode"
                    asyncio.create_task(show_dashboard())
                    page.update()
                page.dialog = ft.AlertDialog(
                    title=ft.Text("فشل الاتصال"),
                    content=ft.Text(msg),
                    actions=[
                        ft.TextButton("محاولة أخرى", on_click=lambda _: setattr(page.dialog, "open", False)),
                        ft.TextButton("الوضع الافتراضي (Offline)", on_click=enter_offline),
                    ],
                )
                page.dialog.open = True
            else: raise Exception(msg)
        except Exception as ex:
            page.snack_bar = ft.SnackBar(ft.Text(f"خطأ: {str(ex)}"), bgcolor=ft.colors.ERROR)
            page.snack_bar.open = True
        login_btn.disabled = False
        login_btn.content = ft.Text(t("login"))
        page.update()

    async def handle_optimize(e):
        page.snack_bar = ft.SnackBar(ft.Text("جاري تحسين الاتصال..."))
        page.snack_bar.open = True
        page.update()
        msg = await logic.optimize_connection()
        page.snack_bar = ft.SnackBar(ft.Text(msg), bgcolor=ft.colors.GREEN_400)
        page.snack_bar.open = True
        page.update()

    async def handle_encrypt(e):
        test_file = "netguard_secure_data.txt"
        with open(test_file, "w") as f: f.write("Sensitive data protected by NetGuard Pro.")
        success, msg = await logic.encrypt_file(test_file, "user_pass_123")
        page.snack_bar = ft.SnackBar(ft.Text(msg), bgcolor=ft.colors.GREEN_400 if success else ft.colors.RED_400)
        page.snack_bar.open = True
        page.update()

    async def show_devices(e):
        page.views.append(ft.View("/devices", [ft.AppBar(title=ft.Text(t("devices")), center_title=True), ft.Column([ft.Container(height=20), devices_list := ft.Column(spacing=10)], scroll=ft.ScrollMode.AUTO)]))
        page.go("/devices")
        devices = await logic.get_device_consumption()
        devices_list.controls.clear()
        for dev in devices:
            is_trusted = await data.is_device_trusted(dev['ip'])
            devices_list.controls.append(ft.ListTile(leading=ft.Icon(ft.icons.SMARTPHONE if "Device" in dev['name'] else ft.icons.LAPTOP, color=ft.colors.GREEN_400 if is_trusted else None), title=ft.Text(dev['name']), subtitle=ft.Text(f"IP: {dev['ip']} | {dev['type']}"), trailing=ft.IconButton(ft.icons.VERIFIED_USER if is_trusted else ft.icons.NEW_RELEASES, icon_color=ft.colors.GREEN_400 if is_trusted else ft.colors.AMBER_400, on_click=lambda e, d=dev: handle_trust_device(d))))
        page.update()

    async def handle_trust_device(device):
        await data.add_trusted_device(device['ip'], device['name'])
        page.snack_bar = ft.SnackBar(ft.Text(f"تمت إضافة {device['name']} كجهاز موثوق"), bgcolor=ft.colors.GREEN_700)
        page.snack_bar.open = True
        await show_devices(None)

    async def show_security_logs(e):
        page.views.append(ft.View("/security_logs", [ft.AppBar(title=ft.Text("سجل الأمان"), center_title=True), ft.Column([ft.Container(height=20), logs_list := ft.Column(spacing=10)], scroll=ft.ScrollMode.AUTO)]))
        page.go("/security_logs")
        logs = await data.get_security_logs(50)
        logs_list.controls.clear()
        for log in logs:
            logs_list.controls.append(ft.ListTile(leading=ft.Icon(ft.icons.REPORT_PROBLEM, color=ft.colors.RED_400 if "High" in log[2] else ft.colors.AMBER_400), title=ft.Text(f"{log[1]} - {log[0]}"), subtitle=ft.Text(log[2]), is_three_line=True))
        page.update()

    async def handle_scan(e):
        scan_btn.disabled = True
        scan_btn.text = "..."
        page.update()
        router_ip = await data.get_setting("router_ip") or "192.168.1.1"
        threats = await logic.run_deep_scan(router_ip)
        if threats:
            scan_status.value = f"{t('threats')} ({len(threats)})"
            scan_status.color = ft.colors.RED_400
        else:
            scan_status.value = t("secure")
            scan_status.color = ft.colors.GREEN_400
        scan_btn.disabled = False
        scan_btn.text = t("scan")
        page.update()

    async def handle_speed_test(e):
        speed_btn.disabled = True
        speed_btn.content = ft.ProgressRing(width=20, height=20)
        page.update()
        results = await logic.perform_speed_test()
        speed_info.value = f"↓ {results['download']} Mbps | ↑ {results['upload']} Mbps | Ping: {results['ping']}ms"
        await data.save_usage(0.01, 0.005)
        speed_btn.disabled = False
        speed_btn.content = ft.Row([ft.Icon(ft.icons.SPEED), ft.Text(t("speed"))], alignment=ft.MainAxisAlignment.CENTER)
        page.update()

    async def handle_logout(e):
        await data.set_setting("router_ip", "")
        await data.set_setting("router_user", "")
        await data.set_setting("router_pass", "")
        await show_login()

    async def show_mobile_login(e):
        page.views.append(ft.View("/mobile_login", [ft.AppBar(title=ft.Text(t("mobile_data")), center_title=True), ft.Column([ft.Container(height=40), ft.Icon(ft.icons.PHONELINK_SETUP, size=80, color=ft.colors.GREEN_ACCENT), ft.Text("تسجيل دخول بيانات الجوال", size=24, weight="bold"), ft.Container(height=20), phone_field := ft.TextField(label="رقم الجوال", border_radius=15, prefix_icon=ft.icons.PHONE), mobile_pass_field := ft.TextField(label="كلمة المرور", password=True, can_reveal_password=True, border_radius=15, prefix_icon=ft.icons.LOCK), ft.Container(height=20), ft.FilledButton("تسجيل الدخول", width=350, height=50, on_click=lambda _: handle_mobile_data_auth(phone_field.value, mobile_pass_field.value)), ft.TextButton("العودة للوحة التحكم", on_click=lambda _: page.go("/dashboard"))], horizontal_alignment=ft.CrossAxisAlignment.CENTER)], padding=30))
        page.go("/mobile_login")

    async def handle_mobile_data_auth(phone, password):
        usage_data = await logic.get_mobile_data_usage(phone, password)
        await show_mobile_dashboard(usage_data)

    async def show_mobile_dashboard(data):
        page.views.append(ft.View("/mobile_dashboard", [ft.AppBar(title=ft.Text("استهلاك الجوال"), center_title=True), ft.Column([ft.Card(content=ft.Container(content=ft.Column([ft.Text(f"الباقة: {data['plan']}", size=18, weight="bold"), ft.Text(f"الإجمالي المستهلك: {data['usage']}", size=24, color=ft.colors.CYAN_ACCENT), ft.Text(f"المتبقي: {data['remaining']}", size=14)]), padding=20)), ft.Text("أكثر التطبيقات استهلاكاً", size=16, weight="bold"), ft.Column([ft.ListTile(leading=ft.Icon(ft.icons.PLAY_CIRCLE_FILL), title=ft.Text(app['name']), trailing=ft.Text(app['usage'], weight="bold")) for app in data['apps']])], scroll=ft.ScrollMode.ADAPTIVE)]))
        page.go("/mobile_dashboard")

    async def update_real_time_stats():
        last_io = psutil.net_io_counters()
        while True:
            await asyncio.sleep(1)
            new_io = psutil.net_io_counters()
            download_speed = (new_io.bytes_recv - last_io.bytes_recv) * 8 / 1024 / 1024
            upload_speed = (new_io.bytes_sent - last_io.bytes_sent) * 8 / 1024 / 1024
            total_gb = (new_io.bytes_recv + new_io.bytes_sent) / (1024**3)
            stats_text.value = f"{total_gb:.2f} GB"
            speed_info.value = f"↓ {download_speed:.2f} Mbps | ↑ {upload_speed:.2f} Mbps"
            last_io = new_io
            try: page.update()
            except: break

    async def show_login():
        page.views.clear()
        page.rtl = (page.client_storage.get("lang") or "ar") == "ar"
        page.views.append(ft.View("/login", [ft.AppBar(title=ft.Text(t("title")), center_title=True, actions=[ft.TextButton(t("lang"), on_click=toggle_lang)]), ft.Column([ft.Container(content=ft.Image(src="/logo1.svg", width=150, height=150, fit=ft.ImageFit.CONTAIN), margin=ft.margin.only(top=40, bottom=20)), ft.Text(t("title"), size=32, weight=ft.FontWeight.BOLD), ft.Text("حقك ان تعرف", size=16, color=ft.colors.CYAN_ACCENT, italic=True), ft.Container(height=20), ip_field := ft.TextField(label=t("router_ip"), value="192.168.1.1", border=ft.InputBorder.OUTLINE, border_radius=15), user_field := ft.TextField(label=t("username"), value="admin", border=ft.InputBorder.OUTLINE, border_radius=15), pass_field := ft.TextField(label=t("password"), password=True, can_reveal_password=True, border=ft.InputBorder.OUTLINE, border_radius=15), ft.Container(height=20), login_btn := ft.FilledButton(content=ft.Text(t("login")), width=350, height=50, on_click=handle_login), ft.TextButton(text=t("mobile_data"), icon=ft.icons.PHONELINK_SETUP, on_click=show_mobile_login)], horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=10)], padding=30))
        page.update()

    async def show_dashboard():
        page.views.clear()
        page.rtl = (page.client_storage.get("lang") or "ar") == "ar"
        page.views.append(ft.View("/dashboard", [ft.AppBar(title=ft.Text(t("title")), actions=[ft.IconButton(ft.icons.LANGUAGE, on_click=toggle_lang), ft.IconButton(ft.icons.LOGOUT_ROUNDED, tooltip=t("logout"), on_click=handle_logout)]), ft.Column([ft.Container(content=ft.Column([ft.Row([ft.Text(t("status"), size=12, weight=ft.FontWeight.BOLD, color=ft.colors.CYAN_400), ft.Spacer(), ft.Text("ONLINE", size=10, weight=ft.FontWeight.BOLD, color=ft.colors.GREEN_400)]), ft.Divider(height=1, color=ft.colors.with_opacity(0.2, ft.colors.ON_SURFACE)), ft.Row([ft.Text(f"{t('latency')}:", size=11, color=ft.colors.ON_SURFACE_VARIANT), ft.Text("24ms", size=11, font_family="monospace"), ft.VerticalDivider(), ft.Text(f"{t('uptime')}:", size=11, color=ft.colors.ON_SURFACE_VARIANT), ft.Text("12h 4m", size=11, font_family="monospace")])], spacing=8), padding=15, border=ft.border.all(1, ft.colors.with_opacity(0.1, ft.colors.ON_SURFACE)), border_radius=10), ft.Card(content=ft.Container(content=ft.Column([ft.Text(t("consumption"), size=14, weight=ft.FontWeight.W_500, color=ft.colors.ON_SURFACE_VARIANT), stats_text, speed_info, ft.ProgressBar(value=0.35, color=ft.colors.CYAN_ACCENT, bgcolor=ft.colors.CYAN_900)], spacing=10), padding=25), elevation=0, color=ft.colors.SURFACE_VARIANT), ft.Row([ft.Container(content=ft.Column([ft.Icon(ft.icons.DEVICES, color=ft.colors.BLUE_400), ft.Text(t("devices"), size=10, weight=ft.FontWeight.BOLD)], horizontal_alignment=ft.CrossAxisAlignment.CENTER), padding=15, border_radius=15, bgcolor=ft.colors.with_opacity(0.1, ft.colors.BLUE_400), expand=True, on_click=show_devices), ft.Container(content=ft.Column([ft.Icon(ft.icons.ZAP, color=ft.colors.AMBER_400), ft.Text(t("optimize"), size=10, weight=ft.FontWeight.BOLD)], horizontal_alignment=ft.CrossAxisAlignment.CENTER), padding=15, border_radius=15, bgcolor=ft.colors.with_opacity(0.1, ft.colors.AMBER_400), expand=True, on_click=handle_optimize)], spacing=10), ft.Row([ft.Container(content=ft.Column([ft.Icon(ft.icons.LOCK_PERSON, color=ft.colors.CYAN_400), ft.Text(t("encrypt"), size=10, weight=ft.FontWeight.BOLD)], horizontal_alignment=ft.CrossAxisAlignment.CENTER), padding=15, border_radius=15, bgcolor=ft.colors.with_opacity(0.1, ft.colors.CYAN_400), expand=True, on_click=handle_encrypt), ft.Container(content=ft.Column([ft.Icon(ft.icons.SIGNAL_CELLULAR_ALT, color=ft.colors.GREEN_400), ft.Text(t("mobile_data"), size=10, weight=ft.FontWeight.BOLD)], horizontal_alignment=ft.CrossAxisAlignment.CENTER), padding=15, border_radius=15, bgcolor=ft.colors.with_opacity(0.1, ft.colors.GREEN_400), expand=True, on_click=show_mobile_login)], spacing=10), ft.Container(content=ft.Column([ft.Row([ft.Icon(ft.icons.SECURITY, color=ft.colors.CYAN_ACCENT), ft.Text(t("security"), weight=ft.FontWeight.BOLD), ft.Spacer(), ft.IconButton(ft.icons.HISTORY, on_click=show_security_logs), scan_btn := ft.TextButton(t("scan"), on_click=handle_scan)]), scan_status]), padding=15, border_radius=15, bgcolor=ft.colors.with_opacity(0.05, ft.colors.CYAN_ACCENT)), ft.Row([speed_btn := ft.ElevatedButton(content=ft.Row([ft.Icon(ft.icons.SPEED), ft.Text(t("speed"))], alignment=ft.MainAxisAlignment.CENTER), on_click=handle_speed_test, expand=True, height=50, style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=12))), ft.ElevatedButton(content=ft.Row([ft.Icon(ft.icons.PHONELINK_SETUP), ft.Text(t("mobile_data"))], alignment=ft.MainAxisAlignment.CENTER), on_click=show_mobile_login, expand=True, height=50, style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=12), bgcolor=ft.colors.GREEN_900))]), ft.Text(f"{t('connected_to')}{logic.brand}", size=10, color=ft.colors.ON_SURFACE_VARIANT, font_family="monospace")], spacing=15, scroll=ft.ScrollMode.ADAPTIVE)], padding=20))
        page.update()

    asyncio.create_task(update_real_time_stats())
    await show_dashboard()

if __name__ == "__main__":
    ft.app(target=main)
