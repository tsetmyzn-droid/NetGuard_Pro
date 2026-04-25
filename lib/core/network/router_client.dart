import 'package:dio/dio.dart';

class RouterClient {
  final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'User-Agent': 'NetGuardPro/5.0'},
  ));

  /// اختبار أساسي لوجود البوابة (Gateway)
  Future<bool> probeGateway(String ip) async {
    try {
      final response = await _dio.get('http://$ip').timeout(const Duration(seconds: 5));
      return response.statusCode == 200 || response.statusCode == 401;
    } catch (_) {
      return false;
    }
  }

  Future<Response> get(String url) => _dio.get(url);
}
