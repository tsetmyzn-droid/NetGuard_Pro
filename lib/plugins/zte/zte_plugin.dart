import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/OpenWrt/Model/ConnectedDevice.dart';
import 'package:netguard_pro/OpenWrt/Model/InterfaceStatus.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';

class ZTEPlugin extends RouterPlugin {
  ZTEPlugin(String ip) : super(ip: ip, modelName: "ZTE ZXHN Series");

  @override
  bool canHandle(String identity) => identity.toLowerCase().contains("zte");

  @override
  Future<bool> login(String username, String password) async {
    NetGuardLogger().info("ZTE Engine: Authenticating at $ip");
    return true; 
  }

  @override
  Future<List<InterfaceStatus>> getTrafficStats() async {
    return [
      InterfaceStatus(name: "wan", up: true, rxBytes: 0, txBytes: 0)
    ];
  }

  @override
  Future<List<ConnectedDevice>> getConnectedDevices() async {
    return [];
  }

  @override
  Future<bool> setBlockState(String mac, bool block) async {
    return false;
  }

  @override
  Future<bool> updateWifiSettings(String ssid, String password) async {
    return false;
  }

  @override
  Future<void> logout() async {}
}
