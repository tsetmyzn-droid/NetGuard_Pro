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
  Future<Map<String, dynamic>> getCapabilities() async {
    if (_agent != null) {
      return await _agent!.getCapabilities();
    }
    return {};
  }

  @override
  Future<bool> applyConfig(String scope) async {
    return await _agent?.applyConfig(scope) ?? false;
  }

  @override
  Future<bool> commitConfig(String scope) async {
    return await _agent?.commitConfig(scope) ?? false;
  }

  @override
  Future<bool> rollbackConfig(String scope) async {
    return await _agent?.rollbackConfig(scope) ?? false;
  }

  @override
  Future<List<Map<String, dynamic>>> getForensicManifest() async {
    return await _agent?.getForensicManifest() ?? [];
  }

  @override
  Future<String?> pullForensicChunk(String id) async {
    return await _agent?.pullForensicChunk(id);
  }

  @override
  Future<bool> acknowledgeForensicChunk(String id) async {
    return await _agent?.acknowledgeForensicChunk(id) ?? false;
  }

  @override
  Future<List<ConnectedDevice>> getConnectedDevices() async {
    return await _client.getDevices();
  }

  @override
  Future<bool> blockDevice(String mac, {String? hostname}) async {
    if (_agent == null) return false;
    // Transactional flow: Apply -> Commit
    final ok = await _agent!.applyConfig('firewall');
    if (!ok) return false;
    
    final result = await _agent!.blockDevice(mac, hostname: hostname);
    if (!result) {
      await _agent!.rollbackConfig('firewall');
      return false;
    }
    
    return await _agent!.commitConfig('firewall');
  }

  @override
  Future<bool> unblockDevice(String mac) async {
    if (_agent == null) return false;
    final ok = await _agent!.applyConfig('firewall');
    if (!ok) return false;
    
    final result = await _agent!.unblockDevice(mac);
    if (!result) {
      await _agent!.rollbackConfig('firewall');
      return false;
    }
    
    return await _agent!.commitConfig('firewall');
  }

  @override
  Future<bool> updateWifi(String ssid, {String? password}) async {
    if (_agent == null) return false;
    final ok = await _agent!.applyConfig('wireless');
    if (!ok) return false;
    
    final result = await _agent!.updateWifi(ssid, password: password);
    if (!result) {
      await _agent!.rollbackConfig('wireless');
      return false;
    }
    
    return await _agent!.commitConfig('wireless');
  }

  @override
  Future<Map<String, dynamic>> getRouterHealth() async {
    return await _agent?.getRouterHealth() ?? {};
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
