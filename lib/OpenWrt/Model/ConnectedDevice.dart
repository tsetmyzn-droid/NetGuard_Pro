class ConnectedDevice {
  final String hostname;
  final String ipAddress;
  final String macAddress;
  final String expire;
  final String connectionType; // "wired", "wireless", "unknown"
  final int? signalStrength; // dBm

  ConnectedDevice({
    required this.hostname,
    required this.ipAddress,
    required this.macAddress,
    this.expire = "0",
    this.connectionType = "unknown",
    this.signalStrength,
  });

  ConnectedDevice copyWith({
    String? connectionType,
    int? signalStrength,
  }) {
    return ConnectedDevice(
      hostname: hostname,
      ipAddress: ipAddress,
      macAddress: macAddress,
      expire: expire,
      connectionType: connectionType ?? this.connectionType,
      signalStrength: signalStrength ?? this.signalStrength,
    );
  }

  factory ConnectedDevice.fromList(List<dynamic> list) {
    return ConnectedDevice(
      hostname: list.length > 3 ? list[3].toString() : "Unknown",
      ipAddress: list.length > 2 ? list[2].toString() : "0.0.0.0",
      macAddress: list.length > 1 ? list[1].toString() : "00:00:00:00:00:00",
      expire: list.length > 0 ? list[0].toString() : "0",
    );
  }
}
