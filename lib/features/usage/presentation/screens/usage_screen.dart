import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/usage_provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../domain/entities/app_usage.dart';
import '../../domain/entities/usage_sample.dart';
import '../../../../widgets/app_drawer.dart';

class UsageScreen extends ConsumerStatefulWidget {
  const UsageScreen({super.key});

  @override
  ConsumerState<UsageScreen> createState() => _UsageScreenState();
}

class _UsageScreenState extends ConsumerState<UsageScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(usageProvider.notifier).fetchUsage());
  }

  String _formatBytes(int bytes) {
    if (bytes >= 1024 * 1024 * 1024) {
      return "${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(2)} GB";
    }
    return "${(bytes / (1024 * 1024)).toStringAsFixed(2)} MB";
  }

  Widget _buildGlassWireDashboard(UsageSample? total) {
    if (total == null) return const SizedBox.shrink();

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildStatItem(
              icon: LucideIcons.arrowDown,
              value: _formatBytes(total.rxBytes),
              label: 'تحميل',
              color: Colors.blue,
            ),
            _buildCenterGauge(total),
            _buildStatItem(
              icon: LucideIcons.arrowUp,
              value: _formatBytes(total.txBytes),
              label: 'رفع',
              color: Colors.cyan,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatItem({required IconData icon, required String value, required String label, required Color color}) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 8),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'JetBrains Mono')),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 12)),
      ],
    );
  }

  Widget _buildCenterGauge(UsageSample total) {
    double totalGB = (total.rxBytes + total.txBytes) / (1024 * 1024 * 1024);
    return Stack(
      alignment: Alignment.center,
      children: [
        SizedBox(
          width: 120,
          height: 120,
          child: CircularProgressIndicator(
            value: 0.75,
            strokeWidth: 8,
            backgroundColor: Colors.white10,
            color: Colors.blueAccent,
          ),
        ),
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              totalGB.toStringAsFixed(2),
              style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const Text('GB', style: TextStyle(color: Colors.white54, fontSize: 14)),
          ],
        ),
      ],
    );
  }

  Widget _buildBarChart(List<UsageSample> history) {
    if (history.isEmpty) return const SizedBox(height: 200, child: Center(child: Text('Loading History...', style: TextStyle(color: Colors.white24))));

    return Container(
      height: 200,
      width: double.infinity,
      color: Colors.black,
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceAround,
          maxY: 60,
          barTouchData: BarTouchData(enabled: false),
          titlesData: const FlTitlesData(show: false),
          gridData: const FlGridData(show: false),
          borderData: FlBorderData(show: false),
          barGroups: history.asMap().entries.map((e) {
            double val = (e.value.rxBytes / (1024 * 1024 * 1024)).toDouble();
            return BarChartGroupData(
              x: e.key,
              barRods: [
                BarChartRodData(
                  toY: val + 5,
                  color: Colors.blue.withOpacity(0.8),
                  width: 14,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                  backDrawRodData: BackgroundBarChartRodData(
                    show: true,
                    toY: 60,
                    color: Colors.white.withOpacity(0.05),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildAppUsageList(List<AppUsage> apps) {
    if (apps.isEmpty) return const Center(child: Text('No App Usage Data', style: TextStyle(color: Colors.white24)));
    
    final sortedApps = List<AppUsage>.from(apps)..sort((a, b) => b.bytes.compareTo(a.bytes));
    final maxBytes = sortedApps.first.bytes;

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: sortedApps.length,
      separatorBuilder: (_, __) => const SizedBox(height: 24),
      itemBuilder: (context, index) {
        final app = sortedApps[index];
        final progress = (app.bytes / maxBytes);

        return Column(
          children: [
            Row(
              children: [
                _getAppIcon(app.appName),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(app.appName, style: const TextStyle(color: Colors.white, fontSize: 16)),
                ),
                Text(
                  _formatBytes(app.bytes),
                  style: const TextStyle(color: Colors.white70, fontSize: 14, fontFamily: 'JetBrains Mono'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const SizedBox(width: 56), 
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: LinearProgressIndicator(
                      value: progress,
                      backgroundColor: Colors.white10,
                      color: Colors.blueAccent,
                      minHeight: 4,
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _getAppIcon(String name) {
    IconData icon;
    Color color;
    switch (name.toLowerCase()) {
      case 'youtube': icon = LucideIcons.youtube; color = Colors.red; break;
      case 'facebook': icon = LucideIcons.facebook; color = Colors.blue; break;
      case 'tiktok': icon = LucideIcons.video; color = Colors.white; break;
      case 'netflix': icon = LucideIcons.play; color = Colors.redAccent; break;
      case 'whatsapp': icon = LucideIcons.messageCircle; color = Colors.green; break;
      default: icon = LucideIcons.appWindow; color = Colors.cyan;
    }
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Icon(icon, color: color, size: 20),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(usageProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF050A0F),
      drawer: const AppDrawer(currentRoute: '/usage'),
      appBar: AppBar(
        title: const Text('إحصائيات الاستهلاك', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(LucideIcons.menu, size: 24),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(LucideIcons.search, size: 20)),
          IconButton(onPressed: () {}, icon: const Icon(LucideIcons.filter, size: 20)),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 10),
            _buildBarChart(state.history),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.all(20),
              child: _buildGlassWireDashboard(state.currentTotal),
            ),
            const Divider(color: Colors.white10),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: state.currentTotal != null 
                ? _buildAppUsageList(state.currentTotal!.appUsage)
                : const Center(child: CircularProgressIndicator(color: Colors.cyan)),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
