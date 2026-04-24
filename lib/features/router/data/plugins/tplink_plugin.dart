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
    return TrafficSample(
      ts: DateTime.now(),
      rxBytes: 3800000, 
      txBytes: 1100000,
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
  Future<List<SystemLog>> fetchLogs() async => [];
}
