import 'package:dio/dio.dart';
import 'base_router_plugin.dart';

class TPLinkRouterPlugin implements BaseRouterPlugin {
  @override
  String get name => "TP-Link";
  
  final Dio _dio = Dio(BaseOptions(
    validateStatus: (status) => true,
    connectTimeout: const Duration(seconds: 10),
  ));
  
  String? _token;
  String? _targetIp;

  @override
  Future<bool> login(String ip, String password) async {
    _targetIp = ip;
    try {
      // 🕵️ تي بي لينك الحديث يستخدم توكن في الـ URL غالباً بعد تسجيل الدخول
      final response = await _dio.post(
        'http://$ip/cgi-bin/luci/;stok=/login',
        data: {
          'method': 'login',
          'params': {'username': 'admin', 'password': password},
        },
      );

      if (response.statusCode == 200 && response.data['result'] != null) {
        _token = response.data['result']['stok'];
        return true;
      }
      return false;
    } catch (e) {
      print('TP-Link Login Error: $e');
      return false;
    }
  }

  @override
  Future<List<Map<String, dynamic>>> fetchDevices() async {
    if (_targetIp == null || _token == null) return [];
    
    // محاكاة جلب أجهزة TP-Link
    return [
      {'name': 'Samsung QLED TV', 'mac': 'TP:LK:01:02:03', 'ip': '192.168.0.50', 'status': 'online'},
      {'name': 'iPad Pro', 'mac': 'TP:LK:FF:EE:DD', 'ip': '192.168.0.51', 'status': 'online'},
    ];
  }

  @override
  Future<bool> blockDevice(String macAddress) async {
    print('🚫 TP-Link: Blocking MAC $macAddress');
    return true;
  }

  @override
  Future<Map<String, dynamic>> fetchTrafficStats() async {
    return {'download': '3.8 MB/s', 'upload': '1.1 MB/s', 'total': '89 GB'};
  }

  @override
  Future<bool> checkSession() async => _token != null;

  @override
  Future<void> logout() async {
    _token = null;
  }
}
