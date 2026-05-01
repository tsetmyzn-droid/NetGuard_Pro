class SpeedTestResult {
  final double downloadSpeedMbps;
  final double uploadSpeedMbps;
  final int pingMs;
  final String server;
  final DateTime timestamp;

  SpeedTestResult({
    required this.downloadSpeedMbps,
    required this.uploadSpeedMbps,
    required this.pingMs,
    required this.server,
    required this.timestamp,
  });
}
