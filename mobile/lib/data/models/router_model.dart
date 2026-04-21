enum RouterType { huawei, zte, tplink, python, unknown }

class RouterModel {
  final String ip;
  final String password;
  final RouterType type;
  final bool isConnected;

  RouterModel({
    required this.ip,
    required this.password,
    required this.type,
    this.isConnected = false,
  });

  factory RouterModel.fromJson(Map<String, dynamic> json) {
    return RouterModel(
      ip: json['ip'] ?? '',
      password: json['password'] ?? '',
      type: _parseType(json['type']),
      isConnected: json['isConnected'] ?? false,
    );
  }

  static RouterType _parseType(String? type) {
    switch (type?.toLowerCase()) {
      case 'huawei': return RouterType.huawei;
      case 'zte': return RouterType.zte;
      case 'tp-link': return RouterType.tplink;
      default: return RouterType.unknown;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'ip': ip,
      'password': password,
      'type': type.toString().split('.').last,
      'isConnected': isConnected,
    };
  }
}
