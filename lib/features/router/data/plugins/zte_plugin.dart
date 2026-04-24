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
        } else if (response.statusCode != 200) {
          throw Exception('Session cookie missing');
        }
      } else {
        throw Exception('Login failed with status ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('ZTE Connection Error: $e');
    }
  }

  @override
  Future<List<Device>> fetchDevices() async {
    if (_targetIp == null) return [];
    
    // بيانات تجريبية (Mock Data) للاختبار الأولي للـ UI
    final rawDevices = [
      {'name': 'هاتف ذكي Apple', 'mac': 'AA:BB:CC:DD', 'ip': '192.168.1.5', 'status': 'online'},
      {'name': 'لابتوب Dell', 'mac': '11:22:33:44', 'ip': '192.168.1.10', 'status': 'offline'},
    ];
    return rawDevices.map((d) => Device.fromMap(d)).toList();
  }

  @override
  Future<void> blockDevice(String mac) async {
    print('🚫 ZTE: Blocking MAC $mac');
  }

  @override
  Future<TrafficSample> fetchTraffic() async {
    return TrafficSample(
      ts: DateTime.now(),
      rxBytes: 2500000, 
      txBytes: 150000,
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

  @override
  Future<void> login(String ip, String password) async {}
}
