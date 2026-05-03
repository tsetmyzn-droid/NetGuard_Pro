import 'dart:collection';

class PerformanceSnapshot {
  final double avgPollMs;
  final int errorsPerMinute;
  final DateTime timestamp;

  PerformanceSnapshot({
    required this.avgPollMs,
    required this.errorsPerMinute,
    required this.timestamp,
  });

  @override
  String toString() => 'AvgPoll: ${avgPollMs.toStringAsFixed(1)}ms, Errors/min: $errorsPerMinute';
}

class PerformanceMonitor {
  static final PerformanceMonitor _instance = PerformanceMonitor._internal();
  factory PerformanceMonitor() => _instance;
  PerformanceMonitor._internal();

  final List<int> _pollDurations = [];
  final List<DateTime> _errorTimestamps = [];
  static const int _maxWindowSize = 60; // آخر 60 دورة

  void recordPollDuration(Duration duration) {
    _pollDurations.add(duration.inMilliseconds);
    if (_pollDurations.length > _maxWindowSize) {
      _pollDurations.removeAt(0);
    }
  }

  void recordError() {
    _errorTimestamps.add(DateTime.now());
    _cleanupOldErrors();
  }

  void _cleanupOldErrors() {
    final oneMinuteAgo = DateTime.now().subtract(const Duration(minutes: 1));
    _errorTimestamps.removeWhere((t) => t.isBefore(oneMinuteAgo));
  }

  PerformanceSnapshot getSnapshot() {
    _cleanupOldErrors();
    
    double avgPoll = 0;
    if (_pollDurations.isNotEmpty) {
      avgPoll = _pollDurations.reduce((a, b) => a + b) / _pollDurations.length;
    }

    return PerformanceSnapshot(
      avgPollMs: avgPoll,
      errorsPerMinute: _errorTimestamps.length,
      timestamp: DateTime.now(),
    );
  }

  void reset() {
    _pollDurations.clear();
    _errorTimestamps.clear();
  }
}
