import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/traffic_provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../widgets/app_drawer.dart';

class TrafficScreen extends ConsumerWidget {
  const TrafficScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logsAsync = ref.watch(securityLogsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      drawer: const AppDrawer(currentRoute: '/traffic'),
      appBar: AppBar(
        title: const Text(
          'سجل الأمان والتدقيق',
          style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: -0.5),
        ),
        centerTitle: true,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(LucideIcons.menu, size: 24),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 20),
            onPressed: () => ref.read(securityLogsProvider.notifier).fetchLogs(),
          ),
        ],
      ),
      body: logsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: Colors.cyanAccent)),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.alertTriangle, size: 48, color: Colors.amber),
              const SizedBox(height: 16),
              Text('فشل تحميل السجلات: $err', textAlign: TextAlign.center),
            ],
          ),
        ),
        data: (logs) {
          if (logs.isEmpty) {
            return const Center(child: Text('لا توجد سجلات حالياً'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: logs.length,
            itemBuilder: (context, index) {
              final log = logs[index];
              return _LogTile(log: log, index: index);
            },
          );
        },
      ),
    );
  }
}

class _LogTile extends StatelessWidget {
  final SecurityLog log;
  final int index;

  const _LogTile({required this.log, required this.index});

  @override
  Widget build(BuildContext context) {
    final isCritical = log.level.contains('CRITICAL') || log.level.contains('ERROR');
    final isWarning = log.level.contains('WARNING');
    
    Color accentColor = Colors.cyanAccent;
    if (isCritical) accentColor = Colors.redAccent;
    if (isWarning) accentColor = Colors.amberAccent;

    return Container(
      margin: const EdgeInsets.bottom(12),
      decoration: BoxDecoration(
        color: accentColor.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: accentColor.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Material(
          color: Colors.transparent,
          child: ExpansionTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: accentColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                isCritical ? LucideIcons.shieldAlert : isWarning ? LucideIcons.shieldQuestion : LucideIcons.shieldInfo,
                color: accentColor,
                size: 20,
              ),
            ),
            title: Text(
              log.message,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
            subtitle: Text(
              log.timestamp,
              style: TextStyle(
                fontSize: 11,
                fontFamily: 'monospace',
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
              ),
            ),
            childrenPadding: const EdgeInsets.all(16),
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'المستوى: ${log.level}\nالتوقيت: ${log.timestamp}\nالتفاصيل كاملة: ${log.message}',
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                    height: 1.5,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ).animate(delay: Duration(milliseconds: 50 * index)).fadeIn().slideX(begin: 0.1);
  }
}
