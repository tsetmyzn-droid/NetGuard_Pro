import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import 'package:dio/dio.dart';

// --- Entities ---
class SecurityLog {
  final String timestamp;
  final String level; // INFO, WARNING, CRITICAL
  final String message;

  SecurityLog({required this.timestamp, required this.level, required this.message});

  factory SecurityLog.fromJson(String raw) {
    // Example format: [2026-04-20 20:10:05] INFO: Server initialized
    final regex = RegExp(r'\[(.*?)\] (.*?): (.*)');
    final match = regex.firstMatch(raw);
    if (match != null) {
      return SecurityLog(
        timestamp: match.group(1) ?? '',
        level: match.group(2) ?? 'INFO',
        message: match.group(3) ?? raw,
      );
    }
    return SecurityLog(timestamp: '', level: 'INFO', message: raw);
  }
}

// --- Provider ---
class SecurityLogNotifier extends StateNotifier<AsyncValue<List<SecurityLog>>> {
  final Dio _dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'));
  Timer? _timer;

  SecurityLogNotifier() : super(const AsyncValue.loading()) {
    fetchLogs();
    // Auto-update every 10 seconds
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => fetchLogs());
  }

  Future<void> fetchLogs() async {
    try {
      final response = await _dio.get('/api/system/logs');
      if (response.statusCode == 200) {
        final List<String> rawLogs = (response.data as String).split('\n');
        final logs = rawLogs
            .where((line) => line.isNotEmpty)
            .map((line) => SecurityLog.fromJson(line))
            .toList()
            .reversed
            .toList(); // Newest first
        state = AsyncValue.data(logs);
      }
    } catch (e, st) {
      // Don't overwrite state if we already have data but a fetch failed (silent error)
      if (state is! AsyncData) {
        state = AsyncValue.error(e, st);
      }
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

final securityLogsProvider = StateNotifierProvider<SecurityLogNotifier, AsyncValue<List<SecurityLog>>>((ref) {
  return SecurityLogNotifier();
});
