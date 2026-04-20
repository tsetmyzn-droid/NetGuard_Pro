class DeviceModel {
  final String name;
  final String ip;
  final String mac;
  final bool isOnline;
  final String? deviceType; // e.g., 'phone', 'laptop', 'tv'

  DeviceModel({
    required this.name,
    required this.ip,
    required this.mac,
    required this.isOnline,
    this.deviceType,
  });

  factory DeviceModel.fromMap(Map<String, dynamic> map) {
    return DeviceModel(
      name: map['name'] ?? map['hostname'] ?? 'جهاز غير معروف',
      ip: map['ip'] ?? '0.0.0.0',
      mac: map['mac'] ?? map['macAddress'] ?? '--:--',
      isOnline: map['status'] == 'online' || map['active'] == true,
      deviceType: _inferType(map['name'] ?? ''),
    );
  }

  static String _inferType(String name) {
    name = name.toLowerCase();
    if (name.contains('iphone') || name.contains('android') || name.contains('phone')) return 'phone';
    if (name.contains('pc') || name.contains('laptop') || name.contains('desktop')) return 'laptop';
    if (name.contains('tv') || name.contains('smart')) return 'tv';
    return 'generic';
  }
}
