import 'package:dio/dio.dart';

class RouterClient {
  final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'User-Agent': 'NetGuardPro/5.0'},
  ));

  /// اختبار أساسي لوجود البوابة (Gateway) واستخراج الهوية
  Future<String?> getGatewayIdentity(String ip) async {
    final baseUrl = ip.startsWith('http') ? ip : 'http://$ip';
    try {
      final response = await _dio.get(baseUrl).timeout(const Duration(seconds: 5));
      final serverHeader = (response.headers.value('server') ?? '').toLowerCase();
      final body = response.data.toString().toLowerCase();
      
      if (serverHeader.contains("luci") || body.contains("luci")) return "openwrt";
      if (body.contains("huawei") || body.contains("hilink")) return "huawei";
      if (body.contains("zte") || body.contains("zxhn")) return "zte";
      if (body.contains("tp-link") || body.contains("tplink")) return "tplink";
      if (serverHeader.isNotEmpty) return serverHeader;
      
      return "unknown";
    } catch (_) {
      return null;
    }
  }

  Future<Response> get(String url) => _dio.get(url);
}
