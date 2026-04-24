import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../domain/entities/system_log.dart';
import '../providers/router_provider.dart';
import '../../../../widgets/app_drawer.dart';

class SystemLogsScreen extends ConsumerWidget {
  const SystemLogsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Note: We need to add a logs provider or fetch from router provider
    // For now, I'll use dummy logs if not available in state
    final logs = [
      SystemLog(ts: DateTime.now().subtract(const Duration(minutes: 5)), message: 'تم حظر محاولة دخول مشبوهة من IP: 192.168.1.45', level: LogLevel.security),
      SystemLog(ts: DateTime.now().subtract(const Duration(minutes: 12)), message: 'تم تحديث إعدادات جدار الحماية بنجاح', level: LogLevel.info),
      SystemLog(ts: DateTime.now().subtract(const Duration(minutes: 25)), message: 'تجاوز استهلاك البيانات للحد المسموح به للجهاز: MacBook-Pro', level: LogLevel.warning),
      SystemLog(ts: DateTime.now().subtract(const Duration(hours: 1)), message: 'إعادة تشغيل النظام تلقائياً', level: LogLevel.info),
      SystemLog(ts: DateTime.now().subtract(const Duration(hours: 2)), message: 'فشل في الاتصال بخادم DNS الثانوي', level: LogLevel.error),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF050A0F),
      drawer: const AppDrawer(currentRoute: '/logs'),
      appBar: AppBar(
        title: const Text('سجلات النظام', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(LucideIcons.menu, size: 24),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: logs.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final log = logs[index];
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.03),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: _getLevelColor(log.level).withOpacity(0.1)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _getLevelIcon(log.level),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _getLevelBadge(log.level),
                          Text(
                            DateFormat('HH:mm').format(log.ts),
                            style: const TextStyle(color: Colors.white24, fontSize: 11, fontFamily: 'JetBrains Mono'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        log.message,
                        style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.5),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _getLevelBadge(LogLevel level) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: _getLevelColor(level).withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        level.name.toUpperCase(),
        style: TextStyle(color: _getLevelColor(level), fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _getLevelIcon(LogLevel level) {
    IconData icon;
    Color color = _getLevelColor(level);
    
    switch (level) {
      case LogLevel.info: icon = LucideIcons.info; break;
      case LogLevel.warning: icon = LucideIcons.alertTriangle; break;
      case LogLevel.error: icon = LucideIcons.xCircle; break;
      case LogLevel.security: icon = LucideIcons.shieldAlert; break;
    }
    
    return Icon(icon, color: color, size: 20);
  }

  Color _getLevelColor(LogLevel level) {
    switch (level) {
      case LogLevel.info: return Colors.cyan;
      case LogLevel.warning: return Colors.orange;
      case LogLevel.error: return Colors.red;
      case LogLevel.security: return Colors.purple;
    }
  }
}
