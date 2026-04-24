class SpeedResult {
  final DateTime ts;
  final double downloadMbps;
  final double uploadMbps;
  final int pingMs;

  SpeedResult({
    required this.ts,
    required this.downloadMbps,
    required this.uploadMbps,
    required this.pingMs,
  });
}
