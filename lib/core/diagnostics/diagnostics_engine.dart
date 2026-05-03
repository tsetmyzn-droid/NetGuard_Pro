import 'package:netguard_pro/core/diagnostics/performance_monitor.dart';
import 'package:netguard_pro/core/engine/netguard_engine.dart';

enum DiagnosticSeverity { healthy, warning, critical }

class DiagnosticResult {
  final String message;
  final DiagnosticSeverity severity;

  DiagnosticResult({required this.message, required this.severity});
}

class DiagnosticsEngine {
  static final DiagnosticsEngine _instance = DiagnosticsEngine._internal();
  factory DiagnosticsEngine() => _instance;
  DiagnosticsEngine._internal();

  DiagnosticResult analyze(PerformanceSnapshot snapshot, NetGuardSystemState state) {
    // 1. Extreme Criticality (Errors)
    if (snapshot.errorsPerMinute >= 10) {
      return DiagnosticResult(
        message: "Network Down: Multiple connection failures detected.",
        severity: DiagnosticSeverity.critical,
      );
    }

    // 2. State-based errors (Engine reported)
    if (state.error != null) {
      if (state.error!.contains("status code 401")) {
        return DiagnosticResult(
          message: "Auth Failed: Please check your router credentials.",
          severity: DiagnosticSeverity.critical,
        );
      }
      return DiagnosticResult(
        message: "Connectivity Issue: ${state.error}",
        severity: DiagnosticSeverity.warning,
      );
    }

    // 3. Performance Degradation (Latency)
    if (snapshot.avgPollMs > 1800) {
       return DiagnosticResult(
        message: "Laggy Connection: Router is responding slowly.",
        severity: DiagnosticSeverity.warning,
      );
    }

    // 4. Stability Check
    if (snapshot.errorsPerMinute > 0) {
       return DiagnosticResult(
        message: "Unstable: Intermittent request failures occurred.",
        severity: DiagnosticSeverity.warning,
      );
    }

    // Default: Healthy
    return DiagnosticResult(
      message: "System Healthy",
      severity: DiagnosticSeverity.healthy,
    );
  }
}
