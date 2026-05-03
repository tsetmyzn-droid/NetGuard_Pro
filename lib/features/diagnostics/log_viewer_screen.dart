import 'package:flutter/material.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';

class LogViewerScreen extends StatefulWidget {
  const LogViewerScreen({super.key});

  @override
  State<LogViewerScreen> createState() => _LogViewerScreenState();
}

class _LogViewerScreenState extends State<LogViewerScreen> {
  List<LogEntry> _logs = [];

  @override
  void initState() {
    super.initState();
    _refreshLogs();
  }

  void _refreshLogs() {
    if (mounted) {
      setState(() {
        _logs = NetGuardLogger().getEntries().reversed.toList();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text("ENGINE LOGS", style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _refreshLogs,
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: const BoxDecoration(
              color: Colors.white10,
              border: Border(bottom: BorderSide(color: Colors.white12)),
            ),
            child: Row(
              children: [
                _buildLegend("INFO", Colors.greenAccent),
                const SizedBox(width: 16),
                _buildLegend("WARN", Colors.amberAccent),
                const SizedBox(width: 16),
                _buildLegend("ERROR", Colors.redAccent),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: _logs.length,
              itemBuilder: (context, index) {
                final entry = _logs[index];
                return _buildLogItem(entry);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegend(String label, Color color) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 10)),
      ],
    );
  }

  Widget _buildLogItem(LogEntry entry) {
    Color color = Colors.white70;
    if (entry.level == LogLevel.warn) color = Colors.amberAccent;
    if (entry.level == LogLevel.error) color = Colors.redAccent;

    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                entry.timestamp.toString().substring(11, 23),
                style: const TextStyle(color: Colors.white24, fontSize: 10, fontFamily: 'monospace'),
              ),
              Text(
                entry.level.name.toUpperCase(),
                style: TextStyle(color: color.withOpacity(0.5), fontSize: 9, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            entry.message,
            style: TextStyle(color: color, fontSize: 12, fontFamily: 'monospace'),
          ),
        ],
      ),
    );
  }
}
