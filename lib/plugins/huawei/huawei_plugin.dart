import 'dart:math';
import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/core/utils/app_logger.dart';

class HuaweiPlugin extends RouterPlugin {
  HuaweiPlugin(String ip) : super(ip: ip, modelName: "Huawei HG Series");

  @override
  bool canHandle(String identity) => identity.toLowerCase().contains("huawei");

  @override
  Future<bool> login(String username, String password) async {
    AppLogger.log("Attempting login to Huawei at $ip");
    // محاكاة تأخير الشبكة
    await Future.delayed(const Duration(milliseconds: 800));
    return true; // نجاح افتراضي للمحاكاة
  }

  @override
  Future<Map<String, double>> fetchTraffic() async {
    final random = Random();
    return {
      "download": double.parse((random.nextDouble() * 25.0).toStringAsFixed(2)),
      "upload": double.parse((random.nextDouble() * 5.0).toStringAsFixed(2)),
    };
  }
}
