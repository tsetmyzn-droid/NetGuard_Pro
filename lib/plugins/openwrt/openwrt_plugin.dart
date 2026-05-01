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
  Future<List<InterfaceStatus>> getTrafficStats() async {
    return await _client.getInterfacesStatus();
  }

  @override
  Future<List<ConnectedDevice>> getConnectedDevices() async {
    return await _client.getDevices();
  }

  @override
  Future<void> logout() async {
    await _client.logout();
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
