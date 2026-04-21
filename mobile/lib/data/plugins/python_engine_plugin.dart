import 'package:dio/dio.dart';
import 'base_router_plugin.dart';

/// 🛡️ محرك الربط مع خادم Python المركزي
class PythonEnginePlugin implements BaseRouterPlugin {
  @override
  String get name => "Python Kernel";
  
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'http://localhost:3000/api', // ربط مع Node.js Bridge -> Python Logic
    connectTimeout: const Duration(seconds: 15),
    validateStatus: (status) => true,
  ));

  @override
  Future<bool> login(String ip, String password) async {
    // محرك البايثون لا يحتاج تسجيل دخول تقليدي للراوتر لأنه هو المتحكم
    try {
      final response = await _dio.get('/health');
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  @override
  Future<List<Map<String, dynamic>>> fetchDevices() async {
    try {
      final response = await _dio.get('/devices');
      if (response.statusCode == 200 && response.data is List) {
        return List<Map<String, dynamic>>.from(response.data);
      }
      return [];
    } catch (e) {
      print('Python Engine Device Fetch Error: $e');
      return [];
    }
  }

  @override
  Future<bool> blockDevice(String macAddress) async {
    try {
      final response = await _dio.post(
        '/devices/toggle-block',
        data: {'mac': macAddress},
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  @override
  Future<Map<String, dynamic>> fetchTrafficStats() async {
    try {
      final response = await _dio.get('/stats');
      if (response.statusCode == 200) {
        return Map<String, dynamic>.from(response.data);
      }
      return {'download': '0 Mb/s', 'upload': '0 Mb/s', 'ping': '0 ms'};
    } catch (e) {
      return {'download': 'ERR', 'upload': 'ERR', 'ping': 'ERR'};
    }
  }

  @override
  Future<bool> checkSession() async => true;

  @override
  Future<void> logout() async {}
}
