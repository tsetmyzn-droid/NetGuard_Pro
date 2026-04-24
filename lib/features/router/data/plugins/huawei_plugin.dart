import 'dart:io';
import 'package:dio/dio.dart';
import '../../usage/domain/entities/usage_sample.dart';
import '../../usage/domain/entities/device_usage.dart';
import '../../domain/router_plugin.dart';
import '../../domain/entities/device.dart';
import '../../domain/entities/traffic.dart';

import '../../usage/domain/entities/app_usage.dart';
import '../../domain/entities/system_log.dart';

class HuaweiRouterPlugin implements RouterPlugin {
  final Dio _dio = Dio(BaseOptions(
    validateStatus: (status) => true,
    connectTimeout: const Duration(seconds: 10),
  ));
  
  String? _sessionCookie;
  String? _csrfToken;
  String? _targetIp;

  @override
  bool canHandle(Map<String, dynamic> fingerprint) {
    final title = fingerprint['title']?.toString().toLowerCase() ?? '';
    return title.contains('huawei') || title.contains('mobile wifi');
  }

  @override
  Future<void> login(String ip, String password) async {
    _targetIp = ip;
    try {
      final initResponse = await _dio.get('http://$ip/api/webserver/SesTokInfo');
      if (initResponse.statusCode != 200) {
        throw Exception('Failed to get session info from Huawei');
      }
      
      _csrfToken = "extracted_token_simulated"; 

      final response = await _dio.post(
        'http://$ip/api/user/login',
        data: '<?xml version="1.0" encoding="UTF-8"?><request><Username>admin</Username><Password>$password</Password></request>',
        options: Options(
          headers: {
            '__RequestVerificationToken': _csrfToken,
            'Content-Type': 'application/xml',
          },
        ),
      );

      if (response.statusCode != 200) {
        throw Exception('Login failed');
      }
      _sessionCookie = response.headers[HttpHeaders.setCookieHeader]?.first;
    } catch (e) {
      throw Exception('Huawei Login Error: $e');
    }
  }

  @override
  Future<List<Device>> fetchDevices() async {
    if (_targetIp == null) return [];
    
    // محاكاة جلب أجهزة هواوي
    final rawDevices = [
      {'name': 'Huawei Mate 40', 'mac': 'HH:WW:AA:EE:01', 'ip': '192.168.8.100', 'status': 'online'},
      {'name': 'Unknown Android', 'mac': 'ZZ:XX:CC:VV:02', 'ip': '192.168.8.105', 'status': 'online'},
    ];

    return rawDevices.map((d) => Device.fromMap(d)).toList();
  }

  @override
  Future<void> blockDevice(String mac) async {
    print('🚫 Huawei: Blocking MAC $mac');
  }

  @override
  Future<TrafficSample> fetchTraffic() async {
    return TrafficSample(
      ts: DateTime.now(),
      rxBytes: 1200000, 
      txBytes: 300000,
    );
  }

  @override
  Future<UsageSample?> fetchTotalUsage() async {
    return UsageSample(
      ts: DateTime.now(),
      rxBytes: 50 * 1024 * 1024 * 1024,
      txBytes: 12 * 1024 * 1024 * 1024,
      appUsage: const [
        AppUsage(appName: 'YouTube', category: AppCategory.streaming, bytes: 15 * 1024 * 1024 * 1024),
        AppUsage(appName: 'TikTok', category: AppCategory.streaming, bytes: 8 * 1024 * 1024 * 1024),
        AppUsage(appName: 'WhatsApp', category: AppCategory.social, bytes: 2 * 1024 * 1024 * 1024),
        AppUsage(appName: 'Zoom', category: AppCategory.productivity, bytes: 5 * 1024 * 1024 * 1024),
        AppUsage(appName: 'PUBG', category: AppCategory.gaming, bytes: 4 * 1024 * 1024 * 1024),
      ],
    );
  }

  @override
  Future<List<DeviceUsage>?> fetchDevicesUsage() async {
    return [
      DeviceUsage(
        mac: 'HH:WW:AA:EE:01',
        rxBytes: 5 * 1024 * 1024 * 1024,
        txBytes: 1 * 1024 * 1024 * 1024,
        ts: DateTime.now(),
        appUsage: const [
          AppUsage(appName: 'YouTube', category: AppCategory.streaming, bytes: 3 * 1024 * 1024 * 1024),
          AppUsage(appName: 'Facebook', category: AppCategory.social, bytes: 1 * 1024 * 1024 * 1024),
        ],
      ),
      DeviceUsage(
        mac: 'ZZ:XX:CC:VV:02',
        rxBytes: 2 * 1024 * 1024 * 1024,
        txBytes: 500 * 1024 * 1024,
        ts: DateTime.now(),
        appUsage: const [
          AppUsage(appName: 'Netflix', category: AppCategory.streaming, bytes: 1500 * 1024 * 1024),
        ],
      ),
    ];
  }

  @override
  Future<List<SystemLog>> fetchLogs() async {
    return [];
  }
}
