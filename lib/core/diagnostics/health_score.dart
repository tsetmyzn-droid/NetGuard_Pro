import 'dart:math';
import 'package:netguard_pro/core/diagnostics/performance_monitor.dart';

class HealthScoreCalculator {
  static double calculate(PerformanceSnapshot snapshot) {
    double score = 100.0;

    // 1. Penalty for Errors (High Impact)
    // Each error in the last minute takes away 10 points
    score -= (snapshot.errorsPerMinute * 10.0);

    // 2. Penalty for Latency (Moderate Impact)
    // Healthy latency is < 500ms for LuCI RPC. 
    // Anything above starts degrading the score.
    if (snapshot.avgPollMs > 500) {
      double latencyPenalty = (snapshot.avgPollMs - 500) / 20.0;
      score -= latencyPenalty;
    }

    // Clamp between 0 and 100
    return max(0.0, min(100.0, score));
  }
}
