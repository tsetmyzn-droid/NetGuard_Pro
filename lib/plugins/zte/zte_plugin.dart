import 'dart:math';
import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/core/utils/app_logger.dart';

class ZTEPlugin extends RouterPlugin {
  ZTEPlugin(String ip) : super(ip: ip, modelName: "ZTE ZXHN Series");

  @override
  bool canHandle(String identity) => identity.toLowerCase().contains("zte");

  @override
  Future<bool> login(String username, String password) async {
    AppLogger.log("ZTE Engine: Authenticating at $ip");
    await Future.delayed(const Duration(milliseconds: 1200));
    return true; // محاكاة نجاح الدخول
  }

  @override
  Future<Map<String, double>> fetchTraffic() async {
    final random = Random();
    return {
      "download": double.parse((random.nextDouble() * 15.0).toStringAsFixed(2)),
      "upload": double.parse((random.nextDouble() * 2.0).toStringAsFixed(2)),
    };
  }
}
