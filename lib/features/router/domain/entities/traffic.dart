class TrafficSample {
  final DateTime ts;
  final int rxBytes;
  final int txBytes;

  TrafficSample({
    required this.ts,
    required this.rxBytes,
    required this.txBytes,
  });

  double get rxMbps => (rxBytes * 8) / (1024 * 1024);
  double get txMbps => (txBytes * 8) / (1024 * 1024);
}
