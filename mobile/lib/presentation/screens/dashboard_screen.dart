import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/auth_provider.dart';
import '../providers/device_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final deviceState = ref.watch(deviceProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF050505),
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(context, ref),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // ⚡ Live Monitoring
                  _buildLiveStatus(deviceState)
                      .animate()
                      .fadeIn(duration: 600.ms)
                      .slideY(begin: 0.2, end: 0),
                  
                  const SizedBox(height: 24),

                  // 🛡️ Quick Actions
                  _buildQuickActions(context)
                      .animate()
                      .fadeIn(delay: 200.ms)
                      .shimmer(duration: 2.seconds, color: Colors.cyan.withOpacity(0.1)),
                  
                  const SizedBox(height: 32),

                  // 📶 Gateway Details
                  _buildGatewaySection(authState.router?.ip ?? 'N/A', authState.router?.type.name ?? 'GENERIC')
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
                  _buildSystemLogsSection()
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

  Widget _buildSliverAppBar(BuildContext context, WidgetRef ref) {
    return SliverAppBar(
      expandedHeight: 120,
      floating: false,
      pinned: true,
      backgroundColor: const Color(0xFF050505),
      flexibleSpace: FlexibleSpaceBar(
        centerTitle: false,
        titlePadding: const EdgeInsets.only(right: 16, bottom: 16),
        title: Row(
          children: [
            const Icon(LucideIcons.shieldCheck, color: Colors.cyan, size: 22),
            const SizedBox(width: 8),
            const Text(
              'NETGUARD PRO',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 16,
                letterSpacing: 1.2,
              ),
            ),
            const Spacer(),
            IconButton(
              icon: const Icon(LucideIcons.logOut, color: Colors.redAccent, size: 18),
              onPressed: () => ref.read(authProvider.notifier).logout(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLiveStatus(DeviceState state) {
    return Row(
      children: [
        Expanded(
          child: _statusCard(
            'DOWNLOAD',
            state.traffic['download'] ?? '0.0 Mb/s',
            LucideIcons.downloadCloud,
            Colors.cyanAccent,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _statusCard(
            'UPLOAD',
            state.traffic['upload'] ?? '0.0 Mb/s',
            LucideIcons.uploadCloud,
            Colors.purpleAccent,
          ),
        ),
      ],
    );
  }

  Widget _statusCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F0F0F),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: color.withOpacity(0.05)),
        boxShadow: [
          BoxShadow(color: color.withOpacity(0.02), blurRadius: 20, spreadRadius: -5),
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
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _quickActionBtn(LucideIcons.zap, 'فحص سريع', Colors.yellowAccent),
        _quickActionBtn(LucideIcons.shieldAlert, 'تأمين الشبكة', Colors.redAccent),
        _quickActionBtn(LucideIcons.history, 'السجلات', Colors.blueAccent),
        _quickActionBtn(LucideIcons.settings, 'الإعدادات', Colors.grey),
      ],
    );
  }

  Widget _quickActionBtn(IconData icon, String label, Color color) {
    return Column(
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
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.white54)),
      ],
    );
  }

  Widget _buildGatewaySection(String ip, String brand) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F0F0F),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
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
              Text('STATUS', style: TextStyle(color: Colors.white24, fontSize: 8)),
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
          decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(8)),
          child: Text('$count', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildModernDeviceTile(BuildContext context, WidgetRef ref, dynamic device) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F0F0F),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: device.isOnline ? Colors.white.withOpacity(0.03) : Colors.redAccent.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(14)),
            child: Icon(_getDeviceIcon(device.deviceType), color: device.isOnline ? Colors.white70 : Colors.redAccent, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(device.name, style: TextStyle(color: device.isOnline ? Colors.white : Colors.white38, fontWeight: FontWeight.bold)),
                Text(device.mac, style: const TextStyle(color: Colors.white24, fontSize: 10, fontFamily: 'monospace')),
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
          backgroundColor: const Color(0xFF111111),
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

  Widget _buildSystemLogsSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.02)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(LucideIcons.scrollText, color: Colors.grey, size: 16),
              SizedBox(width: 8),
              Text('سجلات الأمان (Audit Trail)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white70)),
            ],
          ),
          const SizedBox(height: 16),
          _logEntry('20:10:05', 'دخول ناجح للمسؤول (Admin Login)'),
          _logEntry('20:12:30', 'اكتشاف جهاز جديد: iPhone 15'),
          _logEntry('20:15:00', 'تحديث سياسة الحظر لـ MAC_7A:1B', isWarning: true),
        ],
      ),
    );
  }

  Widget _logEntry(String time, String msg, {bool isWarning = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          Text(time, style: const TextStyle(fontSize: 9, color: Colors.white24, fontFamily: 'monospace')),
          const SizedBox(width: 12),
          Expanded(
            child: Text(msg, style: TextStyle(fontSize: 11, color: isWarning ? Colors.orangeAccent.withOpacity(0.7) : Colors.white54)),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return const Center(child: Padding(padding: EdgeInsets.all(40), child: Text('لا يوجد أجهزة مكتشفة', style: TextStyle(color: Colors.white10))));
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
