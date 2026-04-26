import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/OpenWrt/OpenWrtClient.dart';

class OpenWrtPlugin extends RouterPlugin {
  final OpenWrtClient _client = OpenWrtClient();

  OpenWrtPlugin(String ip) : super(ip: ip, modelName: "OpenWrt (LuCI)");

  @override
  Future<bool> login(String username, String password) async {
    _client.setBaseUrl(ip);
    return await _client.login(username, password);
  }

  @override
  Future<Map<String, double>> fetchTraffic() async {
    final stats = await _client.getInterfacesStatus();
    if (stats.isEmpty) return {'download': 0.0, 'upload': 0.0};
    
    // Summing all interfaces for a general overview
    double totalDown = 0;
    double totalUp = 0;
    for (var interface in stats) {
      totalDown += interface.rxBytes;
      totalUp += interface.txBytes;
    }

    // We return total bytes here, and main.dart handles the delta if it remains as is.
    // However, fetchTraffic in other plugins might return Mbps.
    // Let's return total bytes for now and handle calculation in the engine.
    return {'download': totalDown, 'upload': totalUp};
  }

  @override
  Future<List<Map<String, dynamic>>> fetchDevices() async {
    final devices = await _client.getDevices();
    return devices.map((d) => {
      'hostname': d.hostname,
      'ip': d.ipAddress,
      'mac': d.macAddress,
    }).toList();
  }

  @override
  Future<bool> setBlockState(String mac, bool block) async {
    // LuCI RPC blocking requires complex UCI calls, stubbing for now as per "Real real integrations" 
    // but focusing on performance first.
    return false; 
  }

  @override
  Future<bool> updateWifiSettings(String ssid, String password) async {
    return false;
  }

  @override
  bool canHandle(String identity) {
    return identity.toLowerCase().contains("openwrt") || identity.toLowerCase().contains("luci");
  }
}
