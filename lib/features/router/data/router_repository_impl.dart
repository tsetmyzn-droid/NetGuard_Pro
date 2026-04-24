import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/router_plugin.dart';
import '../../domain/entities/device.dart';
import '../../domain/entities/traffic.dart';
import '../../domain/entities/system_log.dart';
import '../../usage/domain/entities/usage_sample.dart';
import '../../usage/domain/entities/device_usage.dart';
import '../plugins/zte_plugin.dart';
import '../plugins/huawei_plugin.dart';
import '../plugins/tplink_plugin.dart';

class RouterRepositoryImpl {
  final List<RouterPlugin> _plugins = [
    ZteRouterPlugin(),
    HuaweiRouterPlugin(),
    TPLinkRouterPlugin(),
  ];

  RouterPlugin? _activePlugin;
  RouterPlugin? get activePlugin => _activePlugin;

  Future<void> login(String ip, String username, String password) async {
    _activePlugin = null;
    
    for (final plugin in _plugins) {
      try {
        await plugin.login(ip, password);
        _activePlugin = plugin;
        return; 
      } catch (e) {
        continue;
      }
    }
    
    throw Exception('لا يمكن الاتصال بالراوتر. تأكد من صحة IP وكلمة المرور ونوع الجهاز.');
  }

  Future<List<Device>> getDevices() async {
    if (_activePlugin == null) return [];
    return _activePlugin!.fetchDevices();
  }

  Future<TrafficSample> getTraffic() async {
    if (_activePlugin == null) throw Exception('No active plugin');
    return _activePlugin!.fetchTraffic();
  }

  Future<UsageSample?> getTotalUsage() async {
    if (_activePlugin == null) return null;
    return _activePlugin!.fetchTotalUsage();
  }

  Future<List<DeviceUsage>?> getDevicesUsage() async {
    if (_activePlugin == null) return null;
    return _activePlugin!.fetchDevicesUsage();
  }

  Future<List<SystemLog>> getLogs() async {
    if (_activePlugin == null) return [];
    return _activePlugin!.fetchLogs();
  }

  Future<void> blockDevice(String mac) async {
    if (_activePlugin == null) return;
    return _activePlugin!.blockDevice(mac);
  }

  Future<void> reboot() async {
    if (_activePlugin == null) return;
    return _activePlugin!.reboot();
  }

  Future<void> updateWifiSsid(String ssid) async {
    if (_activePlugin == null) return;
    return _activePlugin!.updateWifiSsid(ssid);
  }

  Future<void> updateWifiPassword(String password) async {
    if (_activePlugin == null) return;
    return _activePlugin!.updateWifiPassword(password);
  }

  Future<void> logout() async {
    _activePlugin = null;
  }
}

final routerRepositoryProvider = Provider((ref) => RouterRepositoryImpl());
