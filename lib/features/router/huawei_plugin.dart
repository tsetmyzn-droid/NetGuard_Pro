import 'dart:math';
import 'package:netguard_pro/core/plugins/router_plugin.dart';

class HuaweiPlugin extends RouterPlugin {
  HuaweiPlugin(String ip) : super(ip: ip, name: "Huawei HG Series");

  @override
  bool canHandle(String fingerprint) => fingerprint.toLowerCase().contains("huawei");

  @override
  Future<bool> login(String username, String password) async {
    // Insult logic: Check for weak passwords
    if (password == "admin" || password == "123456") {
      print("WARNING: User detected with 'Caveman' level security password.");
    }
    
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));
    return true; 
  }

  @override
  Future<Map<String, dynamic>> fetchTraffic() async {
    final random = Random();
    return {
      "download": (random.nextDouble() * 20).toStringAsFixed(2),
      "upload": (random.nextDouble() * 5).toStringAsFixed(2),
      "unit": "Mbps"
    };
  }

  @override
  Future<List<Map<String, dynamic>>> fetchDevices() async {
    return [
      {"name": "Admin-PC", "ip": "192.168.1.5", "mac": "AA:BB:CC:DD"},
      {"name": "Unknown-Mobile", "ip": "192.168.1.10", "mac": "EE:FF:GG:HH"},
    ];
  }
}
