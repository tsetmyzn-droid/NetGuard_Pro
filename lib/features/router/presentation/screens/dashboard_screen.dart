import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/router_provider.dart';
import '../providers/device_provider.dart';
import '../../../../core/utils/theme_provider.dart';
import '../providers/traffic_provider.dart';
import 'traffic_screen.dart';
import '../../usage/presentation/screens/usage_screen.dart';
import '../../speed/presentation/screens/speed_screen.dart';
import 'system_logs_screen.dart';

import '../../../../widgets/app_drawer.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(routerProvider);
    final deviceState = ref.watch(deviceProvider);
    final themeMode = ref.watch(themeProvider);
    final logsState = ref.watch(securityLogsProvider);
    final trafficState = ref.watch(trafficProvider);
    final isDark = themeMode == ThemeMode.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      drawer: const AppDrawer(currentRoute: '/dashboard'),
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(context, ref, isDark),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // ⚡ Live Monitoring
                  _buildLiveStatus(trafficState)
                      .animate()
                      .fadeIn(duration: 600.ms)
                      .slideY(begin: 0.2, end: 0),
                  
                  const SizedBox(height: 24),

                  // 🛡️ Quick Actions
                  _buildQuickActions(context, logsState)
                      .animate()
                      .fadeIn(delay: 200.ms)
                      .shimmer(duration: 2.seconds, color: Colors.cyan.withOpacity(0.1)),
                  
                  const SizedBox(height: 32),

                  // 📶 Gateway Details
                  _buildGatewaySection(context, authState.router?.ip ?? 'N/A', authState.router?.type.name ?? 'GENERIC')
                      .animate()
                      .fadeIn(delay: 400.ms),

                  const SizedBox(height: 32),

                  // 📱 Modern Device List
                  _buildDeviceHeader(deviceState.devices.length),
                  const SizedBox(height: 16),
                  
                  if (deviceState.devices.isEmpty)
                    _buildEmptyState()
                  else
                    ...deviceState.devices.map((device) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _buildModernDeviceTile(context, ref, device)
                          .animate()
                          .fadeIn(delay: 600.ms)
                          .slideX(begin: -0.05, end: 0),
                    )),
                  
                  const SizedBox(height: 40),
                  
                  // 📜 System Logs (Feature Showcase)
                  _buildSystemLogsSection(context, logsState)
                      .animate()
                      .fadeIn(delay: 800.ms),
                  
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(BuildContext context, WidgetRef ref, bool isDark) {
    return SliverAppBar(
      expandedHeight: 120,
      floating: false,
      pinned: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      leading: Builder(
        builder: (context) => IconButton(
          icon: const Icon(LucideIcons.menu, color: Colors.cyan),
          onPressed: () => Scaffold.of(context).openDrawer(),
        ),
      ),
      flexibleSpace: FlexibleSpaceBar(
        centerTitle: false,
        titlePadding: const EdgeInsets.only(right: 64, bottom: 16),
        title: Row(
          children: [
            const Icon(LucideIcons.shieldCheck, color: Colors.cyan, size: 22),
            const SizedBox(width: 8),
            const Text(
              'NETGUARD PRO',
              style: TextStyle(
                color: null, // Respect theme
                fontWeight: FontWeight.w900,
                fontSize: 16,
                letterSpacing: 1.2,
              ),
            ),
            const Spacer(),
            IconButton(
              icon: Icon(isDark ? LucideIcons.sun : LucideIcons.moon, color: Colors.cyan, size: 18),
              onPressed: () => ref.read(themeProvider.notifier).toggleTheme(),
            ),
            IconButton(
              icon: const Icon(LucideIcons.logOut, color: Colors.redAccent, size: 18),
              onPressed: () => ref.read(routerProvider.notifier).logout(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLiveStatus(TrafficState state) {
    String download = '0.0 Mb/s';
    String upload = '0.0 Mb/s';
    
    if (state.history.isNotEmpty) {
      download = state.history.last.toDisplayMap()['download'] ?? '0.0';
      upload = state.history.last.toDisplayMap()['upload'] ?? '0.0';
    }

    return Row(
      children: [
        Expanded(
          child: _statusCard(
            'DOWNLOAD',
            download,
            LucideIcons.downloadCloud,
            Colors.cyanAccent,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _statusCard(
            'UPLOAD',
            upload,
            LucideIcons.uploadCloud,
            Colors.purpleAccent,
          ),
        ),
      ],
    );
  }

  Widget _statusCard(String label, String value, IconData icon, Color color) {
    return Builder(builder: (context) {
      final isDark = Theme.of(context).brightness == Brightness.dark;
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F0F0F) : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: color.withOpacity(0.1)),
          boxShadow: [
            BoxShadow(
              color: isDark ? color.withOpacity(0.02) : Colors.black.withOpacity(0.05), 
              blurRadius: 20, 
              spreadRadius: -5
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label, style: TextStyle(color: color.withOpacity(0.6), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
                Icon(icon, color: color, size: 16),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, fontFamily: 'monospace'),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildQuickActions(BuildContext context, AsyncValue<List<SecurityLog>> logsState) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _quickActionBtn(
          LucideIcons.zap, 
          'فحص سريع', 
          Colors.yellowAccent,
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SpeedScreen())),
        ),
        _quickActionBtn(
          LucideIcons.barChart3, 
          'الاستهلاك', 
          Colors.cyanAccent,
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const UsageScreen())),
        ),
        _quickActionBtn(
          LucideIcons.history, 
          'السجلات', 
          Colors.blueAccent,
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TrafficScreen())),
          badge: logsState.when(
            data: (logs) => logs.length.toString(),
            loading: () => null,
            error: (_, __) => '!',
          ),
        ),
        _quickActionBtn(LucideIcons.settings, 'الإعدادات', Colors.grey),
      ],
    );
  }

  Widget _quickActionBtn(IconData icon, String label, Color color, {VoidCallback? onTap, String? badge}) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: color.withOpacity(0.2)),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              if (badge != null)
                Positioned(
                  top: -5,
                  right: -5,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.redAccent,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(badge, style: const TextStyle(fontSize: 8, color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildGatewaySection(BuildContext context, String ip, String brand) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F0F0F) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.cyan.withOpacity(0.1)),
        boxShadow: isDark ? [] : [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.cyan.withOpacity(0.1), shape: BoxShape.circle),
            child: const Icon(LucideIcons.database, color: Colors.cyan, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(brand.toUpperCase(), style: const TextStyle(color: Colors.cyan, fontSize: 10, fontWeight: FontWeight.bold)),
                Text(ip, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('STATUS', style: TextStyle(color: Colors.grey, fontSize: 8)),
              Text('ONLINE', style: TextStyle(color: Colors.greenAccent, fontSize: 10, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceHeader(int count) {
    return Row(
      children: [
        const Text('الأجهزة المكتشفة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(width: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(color: Colors.cyan.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
          child: Text('$count', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.cyan)),
        ),
      ],
    );
  }

  Widget _buildModernDeviceTile(BuildContext context, WidgetRef ref, dynamic device) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final onlineColor = isDark ? Colors.white : Colors.black87;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F0F0F) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: device.isOnline ? Colors.cyan.withOpacity(0.05) : Colors.redAccent.withOpacity(0.2)),
        boxShadow: isDark ? [] : [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 5)],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(color: Colors.cyan.withOpacity(0.05), borderRadius: BorderRadius.circular(14)),
            child: Icon(_getDeviceIcon(device.deviceType), color: device.isOnline ? Colors.cyan : Colors.redAccent, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(device.name, style: TextStyle(color: device.isOnline ? onlineColor : Colors.grey, fontWeight: FontWeight.bold)),
                Text(device.mac, style: const TextStyle(color: Colors.grey, fontSize: 10, fontFamily: 'monospace')),
              ],
            ),
          ),
          IconButton(
            icon: Icon(device.isOnline ? LucideIcons.unlock : LucideIcons.lock, 
                 color: device.isOnline ? Colors.greenAccent.withOpacity(0.5) : Colors.redAccent, 
                 size: 18),
            onPressed: () => _handleBlockToggle(context, ref, device),
          ),
        ],
      ),
    );
  }

  Future<void> _handleBlockToggle(BuildContext context, WidgetRef ref, dynamic device) async {
    if (device.isOnline) {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('تأكيد الحظر'),
          content: Text('هل تريد حظر جهاز ${device.name} من الوصول للإنترنت؟'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
              onPressed: () => Navigator.pop(ctx, true), 
              child: const Text('حظر الجهاز')
            ),
          ],
        ),
      );
      if (confirm == true) {
        await ref.read(deviceProvider.notifier).blockDevice(device.mac);
      }
    }
  }

  Widget _buildSystemLogsSection(BuildContext context, AsyncValue<List<SecurityLog>> logsState) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111111) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(LucideIcons.scrollText, color: Colors.grey, size: 16),
              SizedBox(width: 8),
              Text('سجلات الأمان (Audit Trail)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey)),
            ],
          ),
          const SizedBox(height: 16),
          logsState.when(
            data: (logs) {
              if (logs.isEmpty) return const Text('لا توجد سجلات حالياً', style: TextStyle(fontSize: 10, color: Colors.grey));
              return Column(
                children: logs.take(5).map((l) => _logEntry(
                  '${l.ts.hour}:${l.ts.minute}:${l.ts.second}', 
                  l.message, 
                  isWarning: l.level == 'WARNING' || l.level == 'ERROR'
                )).toList(),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator(strokeWidth: 2)),
            error: (e, _) => Text('Error loading logs: $e'),
          ),
        ],
      ),
    );
  }

  Widget _logEntry(String time, String msg, {bool isWarning = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          Text(time, style: const TextStyle(fontSize: 9, color: Colors.grey, fontFamily: 'monospace')),
          const SizedBox(width: 12),
          Expanded(
            child: Text(msg, style: TextStyle(fontSize: 11, color: isWarning ? Colors.orangeAccent : Colors.grey)),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return const Center(child: Padding(padding: EdgeInsets.all(40), child: Text('لا يوجد أجهزة مكتشفة', style: TextStyle(color: Colors.grey))));
  }

  IconData _getDeviceIcon(String? type) {
    switch (type) {
      case 'phone': return LucideIcons.smartphone;
      case 'laptop': return LucideIcons.laptop;
      case 'tv': return LucideIcons.tv;
      default: return LucideIcons.deviceUnknown;
    }
  }
}
