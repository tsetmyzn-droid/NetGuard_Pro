import 'package:dio/dio.dart';
import '../../usage/domain/entities/usage_sample.dart';
import '../../usage/domain/entities/device_usage.dart';
import '../../domain/router_plugin.dart';
import '../../domain/entities/device.dart';
import '../../domain/entities/traffic.dart';
import '../../domain/entities/system_log.dart';

class TPLinkRouterPlugin implements RouterPlugin {
  final Dio _dio = Dio(BaseOptions(
    validateStatus: (status) => true,
    connectTimeout: const Duration(seconds: 10),
  ));
  
  String? _token;
  String? _targetIp;

  @override
  bool canHandle(Map<String, dynamic> fingerprint) {
    final title = fingerprint['title']?.toString().toLowerCase() ?? '';
    final server = fingerprint['server']?.toString().toLowerCase() ?? '';
    return title.contains('tp-link') || server.contains('tp-link');
  }

  @override
  Future<void> login(String ip, String password) async {
    _targetIp = ip;
    try {
      final response = await _dio.post(
        'http://$ip/cgi-bin/luci/;stok=/login',
        data: {
          'method': 'login',
          'params': {'username': 'admin', 'password': password},
        },
      );

      if (response.statusCode == 200 && response.data['result'] != null) {
        _token = response.data['result']['stok'];
      } else {
        throw Exception('Login failed');
      }
    } catch (e) {
      throw Exception('TP-Link Login Error: $e');
    }
  }

  @override
  Future<List<Device>> fetchDevices() async {
    if (_targetIp == null || _token == null) return [];
    
    final rawDevices = [
      {'name': 'Samsung QLED TV', 'mac': 'TP:LK:01:02:03', 'ip': '192.168.0.50', 'status': 'online'},
      {'name': 'iPad Pro', 'mac': 'TP:LK:FF:EE:DD', 'ip': '192.168.0.51', 'status': 'online'},
    ];
    return rawDevices.map((d) => Device.fromMap(d)).toList();
  }

  @override
  Future<void> blockDevice(String mac) async {
    print('🚫 TP-Link: Blocking MAC $mac');
  }

  @override
  Future<TrafficSample> fetchTraffic() async {
    final now = DateTime.now();
    final oscillate = (cos(now.second / 8.0) * 0.4 + 0.6); // 0.2 to 1.0
    return TrafficSample(
      ts: now,
      rxBytes: (1500000 + (oscillate * 3000000)).toInt(), 
      txBytes: (300000 + (oscillate * 800000)).toInt(),
    );
  }

  @override
  Future<UsageSample?> fetchTotalUsage() async {
    return UsageSample(
      ts: DateTime.now(),
      rxBytes: 85 * 1024 * 1024 * 1024,
      txBytes: 15 * 1024 * 1024 * 1024,
    );
  }

  @override
  Future<List<DeviceUsage>?> fetchDevicesUsage() async {
    return [
      DeviceUsage(mac: 'TP:LK:01:02:03', rxBytes: 15 * 1024 * 1024 * 1024, txBytes: 3 * 1024 * 1024 * 1024, ts: DateTime.now()),
      DeviceUsage(mac: 'TP:LK:FF:EE:DD', rxBytes: 8 * 1024 * 1024 * 1024, txBytes: 1200 * 1024 * 1024, ts: DateTime.now()),
    ];
  }

  @override
  Future<void> reboot() async {
    print('🔄 TP-Link: Rebooting...');
    await Future.delayed(const Duration(seconds: 2));
  }

  @override
  Future<void> updateWifiSsid(String ssid) async {
    print('📶 TP-Link: Updating SSID to $ssid');
    await Future.delayed(const Duration(seconds: 1));
  }

  @override
  Future<void> updateWifiPassword(String password) async {
    print('🔑 TP-Link: Updating Password');
    await Future.delayed(const Duration(seconds: 1));
  }

  @override
  Future<List<SystemLog>> fetchLogs() async => [];
}
