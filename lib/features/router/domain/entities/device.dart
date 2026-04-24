class Device {
  final String name;
  final String mac;
  final String ip;
  final String status;
  final String type;
  final String connectionType; // '2.4G', '5G', 'Ethernet'
  final bool isBlocked;
  final int? signalStrength; // 0-100

  Device({
    required this.name,
    required this.mac,
    required this.ip,
    required this.status,
    this.type = 'other',
    this.connectionType = 'Unknown',
    this.isBlocked = false,
    this.signalStrength,
  });

  factory Device.fromMap(Map<String, dynamic> map) {
    return Device(
      name: map['name'] ?? 'Unknown Device',
      mac: map['mac'] ?? '',
      ip: map['ip'] ?? '',
      status: map['status'] ?? 'offline',
      type: map['type'] ?? 'other',
      connectionType: map['connectionType'] ?? 'Unknown',
      isBlocked: map['isBlocked'] ?? false,
      signalStrength: map['signalStrength'],
    );
  }
}
