import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../features/router/presentation/screens/dashboard_screen.dart';
import '../features/usage/presentation/screens/usage_screen.dart';
import '../features/router/presentation/screens/system_logs_screen.dart';
import '../features/speed/presentation/screens/speed_screen.dart';

class AppDrawer extends StatelessWidget {
  final String currentRoute;

  const AppDrawer({super.key, required this.currentRoute});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: const Color(0xFF050A0F),
      child: Column(
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Colors.white10)),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(LucideIcons.shieldCheck, color: Colors.cyan, size: 40),
                const SizedBox(height: 12),
                const Text(
                  'NetGuard Pro',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          _drawerItem(context, 'الرئيسية', LucideIcons.home, '/dashboard'),
          _drawerItem(context, 'الاستهلاك', LucideIcons.barChart3, '/usage'),
          _drawerItem(context, 'اختبار السرعة', LucideIcons.zap, '/speed'),
          _drawerItem(context, 'سجلات النظام', LucideIcons.history, '/logs'),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Text(
              'v2.4.0 Platinum',
              style: TextStyle(color: Colors.white.withOpacity(0.2), fontSize: 10, fontFamily: 'JetBrains Mono'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _drawerItem(BuildContext context, String title, IconData icon, String route) {
    bool isActive = currentRoute == route;
    return ListTile(
      leading: Icon(icon, color: isActive ? Colors.cyan : Colors.white38),
      title: Text(
        title,
        style: TextStyle(color: isActive ? Colors.white : Colors.white60, fontWeight: isActive ? FontWeight.bold : FontWeight.normal),
      ),
      onTap: () {
        if (isActive) {
          Navigator.pop(context);
          return;
        }
        // Navigation Logic
        Widget screen;
        switch (route) {
          case '/usage': screen = const UsageScreen(); break;
          case '/logs': screen = const SystemLogsScreen(); break;
          case '/speed': screen = const SpeedScreen(); break;
          default: screen = const DashboardScreen();
        }
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => screen));
      },
    );
  }
}
