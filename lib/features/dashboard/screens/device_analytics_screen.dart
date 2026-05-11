import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:netguard_pro/core/plugins/model/agent_traffic_stats.dart';
import 'package:netguard_pro/features/dashboard/repositories/agent_stats_repository.dart';
import 'package:intl/intl.dart';

class DeviceAnalyticsScreen extends StatefulWidget {
  final String mac;
  final String hostname;

  const DeviceAnalyticsScreen({super.key, required this.mac, required this.hostname});

  @override
  State<DeviceAnalyticsScreen> createState() => _DeviceAnalyticsScreenState();
}

class _DeviceAnalyticsScreenState extends State<DeviceAnalyticsScreen> {
  final _repository = AgentStatsRepository();
  List<AgentTrafficStats> _history = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final data = await _repository.getHistory(widget.mac);
    setState(() {
      _history = data;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("ANALYTICS: ${widget.hostname.toUpperCase()}"),
        centerTitle: true,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSummaryCards(),
                const SizedBox(height: 32),
                const Text("CONSUMPTION HISTORY (MB)", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white24)),
                const SizedBox(height: 24),
                _buildChart(),
                const SizedBox(height: 48),
                _buildDetailsList(),
              ],
            ),
          ),
    );
  }

  Widget _buildSummaryCards() {
    int totalDl = 0;
    int totalUl = 0;
    if (_history.isNotEmpty) {
       // Since nlbw is cumulative, we take the last snapshot? 
       // For a simple view we take the latest
       totalDl = _history.last.bytesDownloaded;
       totalUl = _history.last.bytesUploaded;
    }

    return Row(
      children: [
        Expanded(child: _buildSimpleStatCard("DOWNLOAD", "${(totalDl / (1024 * 1024)).toStringAsFixed(2)} MB", Colors.greenAccent)),
        const SizedBox(width: 16),
        Expanded(child: _buildSimpleStatCard("UPLOAD", "${(totalUl / (1024 * 1024)).toStringAsFixed(2)} MB", const Color(0xFF38BDF8))),
      ],
    );
  }

  Widget _buildSimpleStatCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.white24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Widget _buildChart() {
    if (_history.isEmpty) return const Center(child: Text("NO SUFFICIENT DATA"));

    // Prepare spots
    final List<FlSpot> spots = [];
    for (int i = 0; i < _history.length; i++) {
        final mb = (_history[i].bytesDownloaded + _history[i].bytesUploaded) / (1024 * 1024);
        spots.add(FlSpot(i.toDouble(), mb));
    }

    return SizedBox(
      height: 250,
      child: LineChart(
        LineChartData(
          gridData: FlGridData(show: true, drawVerticalLine: false, getDrawingHorizontalLine: (v) => FlLine(color: Colors.white10, strokeWidth: 1)),
          titlesData: const FlTitlesData(show: false),
          borderData: FlBorderData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              color: const Color(0xFF38BDF8),
              barWidth: 3,
              isStrokeCapRound: true,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                color: const Color(0xFF38BDF8).withOpacity(0.1),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailsList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("RAW SNAPSHOTS", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white24)),
        const SizedBox(height: 16),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _history.length > 10 ? 10 : _history.length,
          itemBuilder: (context, index) {
            final item = _history[_history.length - 1 - index];
            final date = DateTime.fromMillisecondsSinceEpoch(item.timestamp * 1000);
            return ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(DateFormat('HH:mm:ss').format(date), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              subtitle: Text(DateFormat('yyyy-MM-dd').format(date), style: const TextStyle(fontSize: 10, color: Colors.white24)),
              trailing: Text("${((item.bytesDownloaded + item.bytesUploaded) / (1024 * 1024)).toStringAsFixed(2)} MB", style: const TextStyle(fontFamily: 'monospace')),
            );
          },
        ),
      ],
    );
  }
}
