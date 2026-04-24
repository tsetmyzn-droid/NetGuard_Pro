class Device {
  final String name;
  final String mac;
  final String ip;
  final String status;
  final String type;

  Device({
    required this.name,
    required this.mac,
    required this.ip,
    required this.status,
    this.type = 'other',
  });

  factory Device.fromMap(Map<String, dynamic> map) {
    return Device(
      name: map['name'] ?? 'Unknown Device',
      mac: map['mac'] ?? '',
      ip: map['ip'] ?? '',
      status: map['status'] ?? 'offline',
      type: map['type'] ?? 'other',
    );
  }
}
