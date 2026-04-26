import 'package:dio/dio.dart';

class RouterClient {
  final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'User-Agent': 'NetGuardPro/5.0'},
  ));

  /// اختبار أساسي لوجود البوابة (Gateway) واستخراج الهوية
  Future<String?> getGatewayIdentity(String ip) async {
    try {
      final response = await _dio.get('http://$ip').timeout(const Duration(seconds: 5));
      final serverHeader = response.headers.value('server') ?? '';
      final body = response.data.toString().toLowerCase();
      
      if (serverHeader.isNotEmpty) return serverHeader;
      if (body.contains("huawei")) return "huawei";
      if (body.contains("zte")) return "zte";
      if (body.contains("tplink")) return "tplink";
      
      return "unknown";
    } catch (_) {
      return null;
    }
  }

  Future<Response> get(String url) => _dio.get(url);
}
