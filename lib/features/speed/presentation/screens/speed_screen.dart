import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/speed_provider.dart';
import '../../domain/entities/speed_result.dart';
import '../../../../widgets/app_drawer.dart';

class SpeedScreen extends ConsumerWidget {
  const SpeedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final speedState = ref.watch(speedProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF060606) : const Color(0xFFF8F9FA),
      drawer: const AppDrawer(currentRoute: '/speed'),
      appBar: AppBar(
        title: const Text('اختبار سرعة الإنترنت', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(LucideIcons.menu, size: 24),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // --- Gauge / Progress Area ---
            _buildGauge(context, speedState),
            
            const SizedBox(height: 40),

            // --- Stats Row ---
            _buildStatRow(speedState),

            const SizedBox(height: 40),

            // --- Start Button ---
            SizedBox(
              width: double.infinity,
              height: 60,
              child: FilledButton.icon(
                onPressed: speedState.isTesting ? null : () => ref.read(speedProvider.notifier).runTest(),
                style: FilledButton.styleFrom(
                  backgroundColor: Colors.cyan,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                icon: speedState.isTesting 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                  : const Icon(LucideIcons.zap),
                label: Text(
                  speedState.isTesting ? 'جاري الفحص...' : 'بدء الاختبار الآن',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ),

            const SizedBox(height: 48),

            // --- History List ---
            _buildHistory(context, speedState.history),
          ],
        ),
      ),
    );
  }

  Widget _buildGauge(BuildContext context, SpeedState state) {
    return Center(
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 220,
            height: 220,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.cyan.withOpacity(0.1), width: 15),
            ),
          ).animate(target: state.isTesting ? 1 : 0)
           .shimmer(duration: 2.seconds, color: Colors.cyan.withOpacity(0.2)),
          
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                state.currentDownload.toStringAsFixed(1),
                style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900, fontFamily: 'monospace'),
              ),
              const Text('Mbps', style: TextStyle(color: Colors.cyan, fontWeight: FontWeight.bold, letterSpacing: 2)),
              const SizedBox(height: 8),
              const Text('DOWNLOAD SPEED', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow(SpeedState state) {
    return Row(
      children: [
        _miniStatCard('UPLOAD', '${state.currentUpload.toStringAsFixed(1)} Mb/s', LucideIcons.uploadCloud, Colors.purpleAccent),
        const SizedBox(width: 16),
        _miniStatCard('LATENCY', '${state.currentPing} ms', LucideIcons.timer, Colors.orangeAccent),
      ],
    );
  }

  Widget _miniStatCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Builder(builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF111111) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: color.withOpacity(0.1)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(height: 12),
              Text(label, style: const TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildHistory(BuildContext context, List<SpeedResult> history) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('تاريخ الاختبارات', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        if (history.isEmpty)
          const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('لا توجد اختبارات سابقة', style: TextStyle(color: Colors.grey))))
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: history.length,
            itemBuilder: (context, index) {
              final result = history[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF0F0F0F) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.cyan.withOpacity(0.05)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.cyan.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                      child: const Icon(LucideIcons.activity, color: Colors.cyan, size: 18),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${result.downloadMbps.toStringAsFixed(1)} Mbps Down / ${result.uploadMbps.toStringAsFixed(1)} Mbps Up', 
                               style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Text(_formatDate(result.ts), style: const TextStyle(color: Colors.grey, fontSize: 10)),
                        ],
                      ),
                    ),
                    Text('${result.pingMs}ms', style: const TextStyle(color: Colors.orangeAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                ),
              ).animate(delay: Duration(milliseconds: 100 * index)).fadeIn().slideX(begin: 0.1);
            },
          ),
      ],
    );
  }

  String _formatDate(DateTime ts) {
    return '${ts.year}-${ts.month.toString().padLeft(2, '0')}-${ts.day.toString().padLeft(2, '0')} ${ts.hour.toString().padLeft(2, '0')}:${ts.minute.toString().padLeft(2, '0')}';
  }
}
