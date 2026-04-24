import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../domain/entities/app_usage.dart';
import '../../domain/entities/device_usage.dart';
import '../providers/usage_provider.dart';

class DeviceUsageDetailScreen extends ConsumerStatefulWidget {
  final String mac;
  final String deviceName;

  const DeviceUsageDetailScreen({
    super.key,
    required this.mac,
    required this.deviceName,
  });

  @override
  ConsumerState<DeviceUsageDetailScreen> createState() => _DeviceUsageDetailScreenState();
}

class _DeviceUsageDetailScreenState extends ConsumerState<DeviceUsageDetailScreen> {
  List<DeviceUsage>? _history;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    final history = await ref.read(usageProvider.notifier).getDeviceHistory(widget.mac);
    if (mounted) {
      setState(() {
        _history = history;
        _isLoading = false;
      });
    }
  }

  String _formatBytes(int bytes) {
    if (bytes < 1024) return "$bytes B";
    if (bytes < 1024 * 1024) return "${(bytes / 1024).toStringAsFixed(1)} KB";
    if (bytes < 1024 * 1024 * 1024) return "${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB";
    return "${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB";
  }

  Widget _buildAppUsageList(List<AppUsage> apps) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: apps.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final app = apps[index];
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.02),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              _getCategoryIcon(app.category),
              const SizedBox(width: 12),
              Expanded(
                child: Text(app.appName, style: const TextStyle(color: Colors.white70, fontSize: 13)),
              ),
              Text(
                _formatBytes(app.bytes),
                style: const TextStyle(color: Colors.cyan, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'JetBrains Mono'),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _getCategoryIcon(AppCategory category, {double size = 18}) {
    IconData icon;
    switch (category) {
      case AppCategory.social: icon = LucideIcons.share2; break;
      case AppCategory.streaming: icon = LucideIcons.playCircle; break;
      case AppCategory.gaming: icon = LucideIcons.gamepad2; break;
      case AppCategory.productivity: icon = LucideIcons.briefcase; break;
      case AppCategory.system: icon = LucideIcons.cpu; break;
      default: icon = LucideIcons.helpCircle;
    }
    return Icon(icon, color: _getCategoryColor(category), size: size);
  }

  Color _getCategoryColor(AppCategory category) {
    switch (category) {
      case AppCategory.social: return Colors.blue;
      case AppCategory.streaming: return Colors.purple;
      case AppCategory.gaming: return Colors.yellow;
      case AppCategory.productivity: return Colors.green;
      case AppCategory.system: return Colors.grey;
      default: return Colors.white54;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050A0F),
      appBar: AppBar(
        title: Text(widget.deviceName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.cyan))
          : SingleChildScrollView(
              child: Column(
                children: [
                  _buildHeaderV2(),
                  const SizedBox(height: 20),
                  if (_history != null && _history!.isNotEmpty) ...[
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: _buildAppUsageListV2(_history!.last.appUsage),
                    ),
                  ],
                  const SizedBox(height: 40),
                ],
              ),
            ),
    );
  }

  Widget _buildHeaderV2() {
    final last = _history?.lastOrNull;
    if (last == null) return const SizedBox.shrink();

    return Column(
      children: [
        const SizedBox(height: 20),
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 140,
              height: 140,
              child: CircularProgressIndicator(
                value: 0.6,
                strokeWidth: 10,
                backgroundColor: Colors.white10,
                color: Colors.cyan,
              ),
            ),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(LucideIcons.laptop, color: Colors.white38, size: 30),
                const SizedBox(height: 8),
                Text(
                  _formatBytes(last.rxBytes + last.txBytes),
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold, fontFamily: 'JetBrains Mono'),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 30),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _statItemItem(LucideIcons.arrowDown, _formatBytes(last.rxBytes), 'Download', Colors.blue),
            _statItemItem(LucideIcons.arrowUp, _formatBytes(last.txBytes), 'Upload', Colors.purple),
          ],
        ),
        const SizedBox(height: 20),
        const Divider(color: Colors.white10),
      ],
    );
  }

  Widget _statItemItem(IconData icon, String value, String label, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 8),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'JetBrains Mono')),
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10)),
      ],
    );
  }

  Widget _buildAppUsageListV2(List<AppUsage> apps) {
    if (apps.isEmpty) return const SizedBox.shrink();
    final sortedApps = List<AppUsage>.from(apps)..sort((a, b) => b.bytes.compareTo(a.bytes));
    final maxBytes = sortedApps.first.bytes;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('استهلاك التطبيقات', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 20),
        ...sortedApps.map((app) {
          final progress = app.bytes / maxBytes;
          return Padding(
            padding: const EdgeInsets.only(bottom: 24),
            child: Column(
              children: [
                Row(
                  children: [
                    _getAppIcon(app.appName),
                    const SizedBox(width: 16),
                    Expanded(child: Text(app.appName, style: const TextStyle(color: Colors.white, fontSize: 15))),
                    Text(_formatBytes(app.bytes), style: const TextStyle(color: Colors.white70, fontSize: 12, fontFamily: 'JetBrains Mono')),
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
                          color: Colors.cyan,
                          minHeight: 3,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
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

  Widget _buildHeader() {
    final totalRx = _history?.fold<int>(0, (prev, element) => prev + element.rxBytes) ?? 0;
    final totalTx = _history?.fold<int>(0, (prev, element) => prev + element.txBytes) ?? 0;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1218),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.cyan.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: Colors.cyan.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(LucideIcons.laptop, color: Colors.cyan, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.mac, style: const TextStyle(color: Colors.white60, fontSize: 12, fontFamily: 'JetBrains Mono')),
                    const Text('مراقب بواسطة NetGuard Pro', style: TextStyle(color: Colors.cyan, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _summaryItem('إجمالي التحميل', _formatBytes(totalRx), Colors.cyan),
              _summaryItem('إجمالي الرفع', _formatBytes(totalTx), Colors.purple),
            ],
          ),
        ],
      ),
    );
  }

  Widget _summaryItem(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white30, fontSize: 11)),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            fontFamily: 'JetBrains Mono',
          ),
        ),
      ],
    );
  }

  Widget _buildHistoryList() {
    if (_history == null || _history!.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.only(top: 40),
          child: Text('لا توجد بيانات تاريخية متاحة لهذا الجهاز', style: TextStyle(color: Colors.white24)),
        ),
      );
    }

    final sortedHistory = List<DeviceUsage>.from(_history!)..sort((a, b) => b.ts.compareTo(a.ts));

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: sortedHistory.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final sample = sortedHistory[index];
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.02),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Text(
                "${sample.ts.hour}:${sample.ts.minute.toString().padLeft(2, '0')}",
                style: const TextStyle(color: Colors.white24, fontSize: 12, fontFamily: 'JetBrains Mono'),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    _miniStat(LucideIcons.arrowDown, _formatBytes(sample.rxBytes), Colors.cyan),
                    const SizedBox(width: 12),
                    _miniStat(LucideIcons.arrowUp, _formatBytes(sample.txBytes), Colors.purple),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _miniStat(IconData icon, String value, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: color.withOpacity(0.5), size: 10),
        const SizedBox(width: 4),
        Text(value, style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'JetBrains Mono')),
      ],
    );
  }
}
