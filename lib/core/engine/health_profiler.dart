import 'dart:async';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';

/// NetGuard Pro: Performance Profiler & Health Monitor
/// This system monitors the app's own performance and the router's responsiveness.
class HealthProfiler {
  static final HealthProfiler _instance = HealthProfiler._internal();
  factory HealthProfiler() => _instance;
  HealthProfiler._internal();

  final _logger = NetGuardLogger();
  final List<double> _latencyHistory = [];
  final int _maxHistory = 50;

  /// تسجيل وقت الاستجابة (Latency)
  void recordLatency(Duration duration) {
    _latencyHistory.add(duration.inMilliseconds.toDouble());
    if (_latencyHistory.length > _maxHistory) {
      _latencyHistory.removeAt(0);
    }
    
    // اكتشاف التدهور (Degradation Detection)
    if (_latencyHistory.length > 5) {
      final avg = _latencyHistory.reduce((a, b) => a + b) / _latencyHistory.length;
      if (duration.inMilliseconds > avg * 3) {
        _logger.warning("Performance Degradation Detected: Latency spiked to ${duration.inMilliseconds}ms (Avg: ${avg.toStringAsFixed(2)}ms)");
      }
    }
  }

  /// الحصول على ملخص الأداء
  Map<String, dynamic> getPerformanceSummary() {
    if (_latencyHistory.isEmpty) return {'status': 'no_data'};
    
    final avg = _latencyHistory.reduce((a, b) => a + b) / _latencyHistory.length;
    final max = _latencyHistory.reduce((a, b) => a > b ? a : b);
    
    return {
      'avg_latency': avg,
      'max_latency': max,
      'samples': _latencyHistory.length,
      'status': avg < 200 ? 'excellent' : (avg < 500 ? 'stable' : 'degraded'),
    };
  }

  void reset() {
    _latencyHistory.clear();
  }
}
