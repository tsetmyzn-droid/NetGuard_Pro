import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'openwrt_client.dart';
import 'package:netguard_pro/core/plugins/model/interface_status.dart';
import 'package:netguard_pro/core/plugins/model/connected_device.dart';
import 'package:netguard_pro/core/network/agent_client.dart';
import 'openwrt_agent_client.dart';

class OpenWrtPlugin extends RouterPlugin {
  final OpenWrtClient _client = OpenWrtClient();
  AgentClient? _agent;

  OpenWrtPlugin(String ip, {String? agentKey}) : super(ip: ip, modelName: "OpenWrt (LuCI)") {
    if (agentKey != null) {
      _agent = OpenWrtAgentClient(ip: ip, sharedKey: agentKey);
    }
  }

  @override
  bool get hasAgentSupport => _agent != null;

  @override
  AgentClient? get agent => _agent;

  @override
  bool get supportsWifiManagement => true;

  @override
  bool get supportsDeviceBlocking => true;

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
