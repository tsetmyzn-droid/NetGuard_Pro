import 'dart:io';
import 'package:dio/dio.dart';
import '../../usage/domain/entities/usage_sample.dart';
import '../../usage/domain/entities/device_usage.dart';
import '../../domain/router_plugin.dart';
import '../../domain/entities/device.dart';
import '../../domain/entities/traffic.dart';

import '../../domain/entities/system_log.dart';

class ZteRouterPlugin implements RouterPlugin {
  final Dio _dio = Dio(BaseOptions(
    validateStatus: (status) => true,
    connectTimeout: const Duration(seconds: 10),
  ));
  
  String? _sessionCookie;
  String? _targetIp;

  @override
  bool canHandle(Map<String, dynamic> fingerprint) {
    final title = fingerprint['title']?.toString().toLowerCase() ?? '';
    final server = fingerprint['server']?.toString().toLowerCase() ?? '';
    return title.contains('zte') || server.contains('zte');
  }

  @override
  Future<void> login(String ip, String password) async {
    _targetIp = ip;
    try {
      final response = await _dio.post(
        'http://$ip/login.cgi',
        data: {
          'Username': 'admin',
          'Password': password,
          'Action': 'login',
        },
        options: Options(
          contentType: 'application/x-www-form-urlencoded',
          followRedirects: false,
        ),
      );

      if (response.statusCode == 302 || response.statusCode == 200) {
        final cookies = response.headers[HttpHeaders.setCookieHeader];
        if (cookies != null && cookies.isNotEmpty) {
          _sessionCookie = cookies.first.split(';').first;
        }
      } else {
        throw Exception('Login failed with status ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('ZTE Login Error: $e');
    }
  }

  @override
  Future<List<Device>> fetchDevices() async {
    if (_targetIp == null) return [];
    
    // Simulate finding devices with new rich data
    return [
      Device(
        name: 'MacBook Pro',
        mac: 'CC:BB:AA:00:11:22',
        ip: '192.168.1.5',
        status: 'online',
        type: 'laptop',
        connectionType: '5G',
        signalStrength: 92,
      ),
      Device(
        name: 'iPhone 15 Pro',
        mac: 'DD:EE:FF:33:44:55',
        ip: '192.168.1.12',
        status: 'online',
        type: 'mobile',
        connectionType: '5G',
        signalStrength: 85,
      ),
      Device(
        name: 'Smart TV',
        mac: 'AA:11:22:33:44:55',
        ip: '192.168.1.20',
        status: 'online',
        type: 'tv',
        connectionType: 'Ethernet',
        signalStrength: 100,
      ),
      Device(
        name: 'Guest Phone',
        mac: 'BB:22:33:44:55:66',
        ip: '192.168.1.100',
        status: 'online',
        type: 'mobile',
        connectionType: '2.4G',
        signalStrength: 45,
      ),
    ];
  }

  @override
  Future<void> blockDevice(String mac) async {
    print('🚫 ZTE: Blocking MAC $mac');
  }

  @override
  Future<void> reboot() async {
    print('🔄 ZTE: Rebooting...');
    await Future.delayed(const Duration(seconds: 2));
  }

  @override
  Future<void> updateWifiSsid(String ssid) async {
    print('📶 ZTE: Updating SSID to $ssid');
    await Future.delayed(const Duration(seconds: 1));
  }

  @override
  Future<void> updateWifiPassword(String password) async {
    print('🔑 ZTE: Updating Password');
    await Future.delayed(const Duration(seconds: 1));
  }

  @override
  Future<TrafficSample> fetchTraffic() async {
    final now = DateTime.now();
    final oscillate = (sin(now.second / 12.0) * 0.5 + 0.5);
    return TrafficSample(
      ts: now,
      rxBytes: (800000 + (oscillate * 2200000)).toInt(), 
      txBytes: (200000 + (oscillate * 600000)).toInt(),
    );
  }

  @override
  Future<UsageSample?> fetchTotalUsage() async {
    return UsageSample(
      ts: DateTime.now(),
      rxBytes: 120 * 1024 * 1024 * 1024,
      txBytes: 45 * 1024 * 1024 * 1024,
    );
  }

  @override
  Future<List<SystemLog>> fetchLogs() async => [];
}
