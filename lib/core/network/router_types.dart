enum RouterType { openwrt, huawei, unknown }

class DiscoveryResult {
  final RouterType type;
  final String ip;
  final String? model;

  DiscoveryResult({required this.type, required this.ip, this.model});
}
