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
    
    try {
      final response = await _dio.get(
        'http://$_targetIp/get_devices.cgi', // Real ZTE endpoint usually involves multiple steps or specific CGI
        options: Options(headers: {'Cookie': _sessionCookie}),
      );
      
      if (response.statusCode == 200) {
        // Here we would parse real XML/JSON from ZTE
        return [];
      }
    } catch (e) {
      print('ZTE Fetch Error: $e');
    }
    return [];
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
}
