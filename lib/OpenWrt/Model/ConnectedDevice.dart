class ConnectedDevice {
  final String hostname;
  final String ipAddress;
  final String macAddress;
  final String expire;

  ConnectedDevice({
    required this.hostname,
    required this.ipAddress,
    required this.macAddress,
    required this.expire,
  });

  factory ConnectedDevice.fromList(List<dynamic> list) {
    return ConnectedDevice(
      hostname: list.length > 3 ? list[3].toString() : "Unknown",
      ipAddress: list.length > 2 ? list[2].toString() : "0.0.0.0",
      macAddress: list.length > 1 ? list[1].toString() : "00:00:00:00:00:00",
      expire: list.length > 0 ? list[0].toString() : "0",
    );
  }
}
