import flet as ft
import asyncio
import psutil
import random
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
        page_transitions=ft.PageTransitionsTheme(
            android=ft.PageTransitionTheme.FADE_THROUGH,
            ios=ft.PageTransitionTheme.CUPERTINO,
            macos=ft.PageTransitionTheme.ZOOM,
            windows=ft.PageTransitionTheme.FADE_IN_OUT,
        ),
    )

    data = DataLayer()
    logic = LogicLayer(data)
    
    # Load initial settings
    logic.brand = await data.get_setting("router_brand") or "Unknown"
    logic.model = await data.get_setting("router_model") or "Standard Route"

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
        page.views.append(ft.View("/devices", [
            ft.AppBar(title=ft.Text(t("devices"), weight="bold"), center_title=True),
            ft.Column([
                ft.Container(height=10),
                ft.Text(f"إجمالي الأجهزة المكتشفة: {len(await logic.get_device_consumption())}", size=12, color=ft.colors.ON_SURFACE_VARIANT, text_align=ft.TextAlign.CENTER),
                devices_list := ft.Column(spacing=15)
            ], scroll=ft.ScrollMode.AUTO, expand=True)
        ], padding=20))
        page.go("/devices")
        
        devices = await logic.get_device_consumption()
        devices_list.controls.clear()
        
        for dev in devices:
            is_trusted = await data.is_device_trusted(dev['ip'])
            
            devices_list.controls.append(
                ft.Container(
                    content=ft.Column([
                        ft.Row([
                            ft.Container(
                                content=ft.Icon(
                                    ft.icons.SMARTPHONE if dev['type'] == 'mobile' else ft.icons.LAPTOP if dev['type'] == 'pc' else ft.icons.TV if dev['type'] == 'media' else ft.icons.ROUTER,
                                    color=ft.colors.CYAN_ACCENT if is_trusted else ft.colors.AMBER_400,
                                    size=30
                                ),
                                padding=10,
                                bgcolor=ft.colors.with_opacity(0.1, ft.colors.ON_SURFACE),
                                border_radius=10
                            ),
                            ft.Column([
                                ft.Text(dev['name'], size=16, weight="bold"),
                                ft.Text(f"IP: {dev['ip']}", size=12, color=ft.colors.CYAN_ACCENT, font_family="monospace"),
                            ], spacing=2, expand=True),
                            ft.IconButton(
                                ft.icons.VERIFIED_USER if is_trusted else ft.icons.GPP_MAYBE,
                                icon_color=ft.colors.GREEN_400 if is_trusted else ft.colors.AMBER_400,
                                tooltip="موثوق" if is_trusted else "غير موثوق - اضغط للتوثيق",
                                on_click=lambda e, d=dev: handle_trust_device(d)
                            )
                        ]),
                        ft.Divider(height=1, color=ft.colors.with_opacity(0.05, ft.colors.ON_SURFACE)),
                        ft.Row([
                            ft.Column([
                                ft.Text(t("os"), size=10, color=ft.colors.ON_SURFACE_VARIANT),
                                ft.Text(dev.get('os', 'Unknown'), size=11, weight="bold"),
                            ], expand=True),
                            ft.Column([
                                ft.Text(t("mac"), size=10, color=ft.colors.ON_SURFACE_VARIANT),
                                ft.Text(dev['mac'], size=11, font_family="monospace"),
                            ], expand=True),
                        ]),
                        ft.Row([
                            ft.Text(t("consumption"), size=10, color=ft.colors.ON_SURFACE_VARIANT),
                            ft.Spacer(),
                            ft.Text(dev['usage'], size=12, weight="bold", color=ft.colors.CYAN_ACCENT),
                        ]),
                        ft.ProgressBar(value=random.random(), color=ft.colors.CYAN_ACCENT, bgcolor=ft.colors.with_opacity(0.1, ft.colors.CYAN_ACCENT))
                    ], spacing=12),
                    padding=20,
                    bgcolor=ft.colors.with_opacity(0.05, ft.colors.ON_SURFACE),
                    border_radius=20,
                    border=ft.border.all(1, ft.colors.with_opacity(0.1, ft.colors.ON_SURFACE))
                )
            )
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
        page.views.append(ft.View("/mobile_dashboard", [
            ft.AppBar(title=ft.Text(t("mobile_data"), weight="bold"), center_title=True),
            ft.Column([
                ft.Container(
                    content=ft.Column([
                        ft.Text(f"الباقة: {data['plan']}", size=14, color=ft.colors.ON_SURFACE_VARIANT),
                        ft.Text(data['usage'], size=36, weight="bold", color=ft.colors.CYAN_ACCENT),
                        ft.Text(f"المتبقي: {data['remaining']}", size=12, color=ft.colors.AMBER_400),
                        ft.ProgressBar(value=0.6, color=ft.colors.CYAN_ACCENT, bgcolor=ft.colors.with_opacity(0.1, ft.colors.CYAN_ACCENT))
                    ], spacing=10),
                    padding=25,
                    bgcolor=ft.colors.with_opacity(0.05, ft.colors.ON_SURFACE),
                    border_radius=25,
                ),
                ft.Text(t("top_apps"), size=16, weight="bold"),
                ft.Column([
                    ft.Container(
                        content=ft.Row([
                            ft.Icon(ft.icons.PLAY_CIRCLE_FILL if "YouTube" in app['name'] else ft.icons.APPS, color=ft.colors.CYAN_ACCENT),
                            ft.Text(app['name'], size=14, weight="bold", expand=True),
                            ft.Text(app['usage'], size=14, weight="bold", color=ft.colors.AMBER_400)
                        ]),
                        padding=15,
                        bgcolor=ft.colors.with_opacity(0.03, ft.colors.ON_SURFACE),
                        border_radius=15
                    ) for app in data['apps']
                ], spacing=10)
            ], scroll=ft.ScrollMode.ADAPTIVE, spacing=20)
        ], padding=20))
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

        ip_field = ft.TextField(
            label=t("router_ip"), 
            value="192.168.1.1", 
            border_radius=15,
            prefix_icon=ft.icons.ROUTER,
            focused_border_color=ft.colors.CYAN_ACCENT
        )

        async def handle_auto_detect(e):
            detect_btn.text = t("detecting")
            detect_btn.disabled = True
            page.update()
            
            info = await logic.auto_detect_router()
            if info["brand"] != "Unknown":
                ip_field.value = info["ip"]
                page.snack_bar = ft.SnackBar(
                    ft.Text(t("detection_success").format(brand=info["brand"], model=info["model"])),
                    bgcolor=ft.colors.GREEN_700
                )
            else:
                page.snack_bar = ft.SnackBar(
                    ft.Text(t("detection_failed")),
                    bgcolor=ft.colors.RED_700
                )
            
            detect_btn.text = t("auto_detect")
            detect_btn.disabled = False
            page.snack_bar.open = True
            page.update()

        detect_btn = ft.OutlinedButton(
            text=t("auto_detect"),
            icon=ft.icons.SEARCH,
            on_click=handle_auto_detect,
            width=350,
            height=55,
            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=15))
        )
        
        login_view = ft.View("/login", [
            ft.AppBar(
                title=ft.Text(t("title"), weight="bold"),
                center_title=True,
                actions=[ft.TextButton(t("lang"), on_click=toggle_lang)],
                bgcolor=ft.colors.TRANSPARENT
            ),
            ft.Column([
                ft.Container(height=40),
                ft.Container(
                    content=ft.Image(src="/logo1.svg", width=120, height=120, fit=ft.ImageFit.CONTAIN),
                    alignment=ft.alignment.center,
                ),
                ft.Column([
                    ft.Text(t("title"), size=32, weight=ft.FontWeight.BOLD),
                    ft.Text("حقك ان تعرف", size=14, color=ft.colors.CYAN_ACCENT, italic=True, weight=ft.FontWeight.W_300),
                ], horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=0),
                
                ft.Container(height=30),
                
                ft.Container(
                    content=ft.Column([
                        ip_field,
                        detect_btn,
                        user_field := ft.TextField(
                            label=t("username"), 
                            value="admin", 
                            border_radius=15,
                            prefix_icon=ft.icons.PERSON,
                            focused_border_color=ft.colors.CYAN_ACCENT
                        ),
                        pass_field := ft.TextField(
                            label=t("password"), 
                            password=True, 
                            can_reveal_password=True, 
                            border_radius=15,
                            prefix_icon=ft.icons.LOCK,
                            focused_border_color=ft.colors.CYAN_ACCENT
                        ),
                        ft.Container(height=10),
                        login_btn := ft.FilledButton(
                            content=ft.Text(t("login"), size=16, weight="bold"),
                            width=350,
                            height=55,
                            on_click=handle_login,
                            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=15))
                        ),
                    ], spacing=15),
                    padding=30,
                    bgcolor=ft.colors.with_opacity(0.05, ft.colors.ON_SURFACE),
                    border_radius=25,
                    border=ft.border.all(1, ft.colors.with_opacity(0.1, ft.colors.ON_SURFACE))
                ),
                
                ft.Container(height=20),
                ft.TextButton(
                    text=t("mobile_data"), 
                    icon=ft.icons.PHONELINK_SETUP, 
                    on_click=show_mobile_login,
                    style=ft.ButtonStyle(color=ft.colors.CYAN_ACCENT)
                )
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=10, scroll=ft.ScrollMode.ADAPTIVE)
        ], padding=30)
        
        page.views.append(login_view)
        page.update()

    async def show_dashboard():
        page.views.clear()
        page.rtl = (page.client_storage.get("lang") or "ar") == "ar"
        
        # Fetch detailed data
        devices = await logic.get_device_consumption()
        traffic = await logic.get_traffic_analysis()
        estimate = await logic.calculate_estimated_consumption(12.5) # Example current usage
        
        def create_stat_card(title, value, subtitle, icon, color):
            return ft.Container(
                content=ft.Column([
                    ft.Row([ft.Icon(icon, color=color, size=20), ft.Text(title, size=12, color=ft.colors.ON_SURFACE_VARIANT)], spacing=10),
                    ft.Text(value, size=24, weight="bold"),
                    ft.Text(subtitle, size=10, color=ft.colors.with_opacity(0.5, ft.colors.ON_SURFACE))
                ], spacing=5),
                padding=15,
                bgcolor=ft.colors.with_opacity(0.05, color),
                border_radius=15,
                border=ft.border.all(1, ft.colors.with_opacity(0.1, color)),
                expand=True
            )

        # Traffic Chart
        chart_sections = []
        for cat in traffic['categories']:
            chart_sections.append(ft.PieChartSection(cat['value'], color=cat['color'], radius=30, title=f"{cat['value']}%", title_style=ft.TextStyle(size=10, weight="bold")))

        dashboard_view = ft.View("/dashboard", [
            ft.AppBar(
                title=ft.Text(t("title"), weight="bold"),
                actions=[
                    ft.IconButton(ft.icons.LANGUAGE, on_click=toggle_lang),
                    ft.IconButton(ft.icons.LOGOUT_ROUNDED, on_click=handle_logout)
                ],
                bgcolor=ft.colors.SURFACE,
            ),
            ft.Column([
                # Network Status Header
                ft.Container(
                    content=ft.Column([
                        ft.Row([
                            ft.Column([
                                ft.Text(f"{t('connected_to')}{logic.brand}", size=18, weight="bold", color=ft.colors.WHITE),
                                ft.Text(logic.model, size=12, color=ft.colors.CYAN_ACCENT, font_family="monospace"),
                            ]),
                            ft.Spacer(),
                            ft.Container(
                                content=ft.Row([
                                    pulse_dot := ft.Container(width=10, height=10, bgcolor=ft.colors.GREEN_400, border_radius=5),
                                    ft.Text("SECURE", size=10, weight="bold", color=ft.colors.GREEN_400)
                                ], spacing=8),
                                padding=ft.padding.symmetric(horizontal=12, vertical=8),
                                bgcolor=ft.colors.with_opacity(0.1, ft.colors.GREEN_400),
                                border_radius=20,
                                border=ft.border.all(1, ft.colors.with_opacity(0.2, ft.colors.GREEN_400))
                            )
                        ]),
                        ft.Divider(height=1, color=ft.colors.with_opacity(0.1, ft.colors.ON_SURFACE)),
                        ft.Row([
                            ft.Row([ft.Icon(ft.icons.TIMER, size=14, color=ft.colors.ON_SURFACE_VARIANT), ft.Text(f"{t('uptime')}: 12h 4m", size=11, color=ft.colors.ON_SURFACE_VARIANT)], spacing=5),
                            ft.VerticalDivider(),
                            ft.Row([ft.Icon(ft.icons.SPEED, size=14, color=ft.colors.ON_SURFACE_VARIANT), ft.Text(f"{t('latency')}: 24ms", size=11, color=ft.colors.ON_SURFACE_VARIANT)], spacing=5),
                        ], alignment=ft.MainAxisAlignment.CENTER)
                    ], spacing=15),
                    padding=25,
                    bgcolor=ft.colors.with_opacity(0.05, ft.colors.SURFACE_VARIANT),
                    border_radius=25,
                    border=ft.border.all(1, ft.colors.with_opacity(0.1, ft.colors.ON_SURFACE))
                ),

                # Real-time Consumption
                ft.Row([
                    create_stat_card(t("consumption"), stats_text.value, "Total this session", ft.icons.DATA_USAGE, ft.colors.CYAN_ACCENT),
                    create_stat_card(t("speed"), "12.4 Mbps", "Current speed", ft.icons.SPEED, ft.colors.AMBER_400),
                ], spacing=10),

                # Traffic Analysis Section
                ft.Container(
                    content=ft.Column([
                        ft.Text(t("traffic_analysis"), size=14, weight="bold"),
                        ft.Row([
                            ft.Container(
                                content=ft.PieChart(sections=chart_sections, sections_space=2, center_space_radius=30),
                                width=120, height=120
                            ),
                            ft.Column([
                                ft.Row([ft.Container(width=10, height=10, bgcolor=cat['color'], border_radius=2), ft.Text(t(cat['name'].split(' ')[0].lower()), size=10)]) for cat in traffic['categories']
                            ], spacing=5, expand=True)
                        ], spacing=20),
                        ft.Divider(height=1, color=ft.colors.with_opacity(0.1, ft.colors.ON_SURFACE)),
                        ft.Text(t("top_apps"), size=12, weight="bold"),
                        ft.Column([
                            ft.Row([
                                ft.Icon(ft.icons.PLAY_CIRCLE if "YouTube" in app['name'] else ft.icons.APPS, size=16),
                                ft.Text(app['name'], size=12, expand=True),
                                ft.Text(app['usage'], size=12, weight="bold", color=ft.colors.CYAN_ACCENT)
                            ]) for app in traffic['top_apps']
                        ], spacing=8)
                    ], spacing=15),
                    padding=20,
                    bgcolor=ft.colors.with_opacity(0.03, ft.colors.ON_SURFACE),
                    border_radius=20,
                    border=ft.border.all(1, ft.colors.with_opacity(0.05, ft.colors.ON_SURFACE))
                ),

                # Monthly Estimate
                ft.Container(
                    content=ft.Column([
                        ft.Row([ft.Icon(ft.icons.CALENDAR_MONTH, size=16), ft.Text(t("monthly_estimate"), size=14, weight="bold")]),
                        ft.Row([
                            ft.Column([ft.Text(t("daily_avg"), size=10), ft.Text(f"{estimate['daily_avg']} GB", size=18, weight="bold")], expand=True),
                            ft.Column([ft.Text(t("est_total"), size=10), ft.Text(f"{estimate['estimated_total']} GB", size=18, weight="bold", color=ft.colors.AMBER_400)], expand=True),
                            ft.Column([ft.Text(t("days_left"), size=10), ft.Text(f"{estimate['days_remaining']}", size=18, weight="bold")], expand=True),
                        ])
                    ], spacing=10),
                    padding=20,
                    bgcolor=ft.colors.with_opacity(0.1, ft.colors.AMBER_400),
                    border_radius=20,
                ),

                # Connected Devices Summary
                ft.Container(
                    content=ft.Column([
                        ft.Row([
                            ft.Text(t("devices"), size=14, weight="bold"),
                            ft.Spacer(),
                            ft.TextButton(f"{len(devices)} ACTIVE", on_click=show_devices)
                        ]),
                        ft.Column([
                            ft.Container(
                                content=ft.Row([
                                    ft.Icon(ft.icons.SMARTPHONE if dev['type'] == 'mobile' else ft.icons.LAPTOP if dev['type'] == 'pc' else ft.icons.TV, size=20, color=ft.colors.CYAN_ACCENT),
                                    ft.Column([
                                        ft.Text(dev['name'], size=12, weight="bold"),
                                        ft.Text(dev['ip'], size=10, color=ft.colors.ON_SURFACE_VARIANT),
                                    ], spacing=2, expand=True),
                                    ft.Column([
                                        ft.Text(dev['usage'], size=12, weight="bold", text_align=ft.TextAlign.RIGHT),
                                        ft.ProgressBar(value=random.random(), color=ft.colors.CYAN_ACCENT, width=60)
                                    ], horizontal_alignment=ft.CrossAxisAlignment.END)
                                ]),
                                padding=10,
                                bgcolor=ft.colors.with_opacity(0.05, ft.colors.ON_SURFACE),
                                border_radius=10
                            ) for dev in devices[:3] # Show top 3
                        ], spacing=8)
                    ], spacing=10),
                    padding=20,
                    bgcolor=ft.colors.with_opacity(0.03, ft.colors.ON_SURFACE),
                    border_radius=20,
                ),

                # Quick Actions Grid
                ft.Row([
                    ft.Container(content=ft.Column([ft.Icon(ft.icons.ZAP, color=ft.colors.AMBER_400), ft.Text(t("optimize"), size=10, weight="bold")], horizontal_alignment=ft.CrossAxisAlignment.CENTER), padding=15, border_radius=15, bgcolor=ft.colors.with_opacity(0.1, ft.colors.AMBER_400), expand=True, on_click=handle_optimize),
                    ft.Container(content=ft.Column([ft.Icon(ft.icons.LOCK_PERSON, color=ft.colors.CYAN_400), ft.Text(t("encrypt"), size=10, weight="bold")], horizontal_alignment=ft.CrossAxisAlignment.CENTER), padding=15, border_radius=15, bgcolor=ft.colors.with_opacity(0.1, ft.colors.CYAN_400), expand=True, on_click=handle_encrypt),
                    ft.Container(content=ft.Column([ft.Icon(ft.icons.SECURITY, color=ft.colors.RED_400), ft.Text(t("scan"), size=10, weight="bold")], horizontal_alignment=ft.CrossAxisAlignment.CENTER), padding=15, border_radius=15, bgcolor=ft.colors.with_opacity(0.1, ft.colors.RED_400), expand=True, on_click=handle_scan),
                ], spacing=10),

                ft.Container(height=20) # Bottom spacer
            ], spacing=20, scroll=ft.ScrollMode.ADAPTIVE)
        ], padding=20)
        
        page.views.append(dashboard_view)
        page.update()

    asyncio.create_task(update_real_time_stats())
    await show_dashboard()

if __name__ == "__main__":
    ft.app(target=main, view=ft.AppView.WEB_BROWSER, port=3000, host="0.0.0.0")
