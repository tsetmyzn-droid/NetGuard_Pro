enum RouterType { zte, huawei, tplink, generic }

class RouterInfo {
  final String ip;
  final RouterType type;
  final String model;
  final String firmwareVersion;

  RouterInfo({
    required this.ip,
    required this.type,
    required this.model,
    required this.firmwareVersion,
  });
}
