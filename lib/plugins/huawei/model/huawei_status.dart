class HuaweiStatus {
  final double downloadSpeed;
  final double uploadSpeed;
  final int totalDownloaded;
  final int totalUploaded;
  final String status;
  final String model;

  HuaweiStatus({
    required this.downloadSpeed,
    required this.uploadSpeed,
    required this.totalDownloaded,
    required this.totalUploaded,
    required this.status,
    required this.model,
  });
}

class HuaweiDevice {
  final String ip;
  final String mac;
  final String name;
  final bool isOnline;

  HuaweiDevice({
    required this.ip,
    required this.mac,
    required this.name,
    required this.isOnline,
  });
}
