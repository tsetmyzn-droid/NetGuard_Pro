import 'package:dio/dio.dart';
import 'package:network_info_plus/network_info_plus.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';
import 'router_types.dart';

class DiscoveryService {
  final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 3),
    receiveTimeout: const Duration(seconds: 3),
  ));
  final NetGuardLogger _logger = NetGuardLogger();
  final NetworkInfo _networkInfo = NetworkInfo();

  Future<DiscoveryResult> autoDiscover() async {
    _logger.info("DiscoveryService: Starting auto-discovery...");
    
    String? gatewayIp;
    try {
      gatewayIp = await _networkInfo.getWifiGatewayIP();
    } catch (e) {
      _logger.error("DiscoveryService: Failed to get gateway IP: $e");
    }

    // Common fallbacks if gateway detection fails
    List<String> targets = [
      if (gatewayIp != null) gatewayIp,
      '192.168.1.1',
      '192.168.0.1',
      '192.168.8.1', // Huawei default
      '10.0.0.1',    // Common corporate fallback
    ];

    for (String ip in targets) {
      final result = await _fingerprint(ip);
      if (result.type != RouterType.unknown) {
        _logger.info("DiscoveryService: Successfully matched ${result.type} at $ip");
        return result;
      }
    }

    _logger.warn("DiscoveryService: No router matched automatically.");
    return DiscoveryResult(type: RouterType.unknown, ip: gatewayIp ?? '192.168.1.1');
  }

  Future<DiscoveryResult> _fingerprint(String ip) async {
    String baseUrl = ip.startsWith('http') ? ip : 'http://$ip';
    
    // Test for HTTPS redirect (301/302)
    try {
      final probe = await _dio.get(baseUrl, options: Options(followRedirects: false, validateStatus: (status) => status != null && status < 400));
      if (probe.statusCode == 301 || probe.statusCode == 302) {
        final location = probe.headers.value('location');
        if (location != null && location.startsWith('https')) {
          _logger.info("DiscoveryService: Detected HTTPS redirect for $ip, switching to secure connection.", category: LogCategory.network);
          baseUrl = location;
        }
      }
    } catch (_) {}
    
    // Phase 4: Discovery Hardening (Content Verification)

    // Test 1: Huawei HiLink API
    try {
      final response = await _dio.get('$baseUrl/api/device/information');
      if (response.statusCode == 200 && response.data.toString().contains('<DeviceName>') && response.data.toString().contains('<SerialNumber>')) {
        return DiscoveryResult(type: RouterType.huawei, ip: baseUrl);
      }
    } catch (_) {}

    // Test 2: OpenWrt LuCI
    try {
      final response = await _dio.get('$baseUrl/cgi-bin/luci/');
      if (response.statusCode == 200 && (response.data.toString().contains('LuCI') || response.data.toString().contains('luci-static'))) {
        return DiscoveryResult(type: RouterType.openwrt, ip: baseUrl);
      }
    } catch (_) {}
    
    // Test 3: RPC OpenWrt - JSON verification
    try {
       final response = await _dio.post(
         '$baseUrl/cgi-bin/luci/rpc/auth',
         data: {"id": 0, "method": "login", "params": []}
       );
       if (response.statusCode == 200 && response.data is Map && response.data.containsKey('id')) {
         return DiscoveryResult(type: RouterType.openwrt, ip: baseUrl);
       }
    } catch (_) {}

    // Test 4: TP-Link
    try {
      final response = await _dio.get(baseUrl);
      if (response.statusCode == 200) {
        final body = response.data.toString();
        if (body.contains('TP-LINK') || body.contains('Tether') || body.contains('tplinkwifi')) {
          return DiscoveryResult(type: RouterType.tplink, ip: baseUrl);
        }
      }
    } catch (_) {}

    // Test 5: ZTE
    try {
      final response = await _dio.get(baseUrl);
      if (response.statusCode == 200) {
        final body = response.data.toString();
        if (body.contains('ZTE') || body.contains('ZXHN') || body.contains('zte.com.cn')) {
          return DiscoveryResult(type: RouterType.zte, ip: baseUrl);
        }
      }
    } catch (_) {}

    return DiscoveryResult(type: RouterType.unknown, ip: baseUrl);
  }
}
