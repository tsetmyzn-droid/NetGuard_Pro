class InterfaceStatus {
  final String name;
  final bool up;
  final int rxBytes;
  final int txBytes;

  InterfaceStatus({
    required this.name,
    required this.up,
    required this.rxBytes,
    required this.txBytes,
  });

  factory InterfaceStatus.fromJson(String name, Map<String, dynamic> json) {
    final stats = json['statistics'] ?? {};
    return InterfaceStatus(
      name: name,
      up: json['up'] ?? false,
      rxBytes: stats['rx_bytes'] ?? 0,
      txBytes: stats['tx_bytes'] ?? 0,
    );
  }
}
