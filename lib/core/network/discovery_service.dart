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
    final baseUrl = ip.startsWith('http') ? ip : 'http://$ip';
    
    // Test 1: Huawei HiLink API
    try {
      final response = await _dio.get('$baseUrl/api/device/information');
      if (response.statusCode == 200 && response.data.toString().contains('<DeviceName>')) {
        return DiscoveryResult(type: RouterType.huawei, ip: ip);
      }
    } catch (_) {}

    // Test 2: OpenWrt LuCI
    try {
      final response = await _dio.get('$baseUrl/cgi-bin/luci/');
      if (response.statusCode == 200 && response.data.toString().contains('LuCI')) {
        return DiscoveryResult(type: RouterType.openwrt, ip: ip);
      }
    } catch (_) {}
    
    // Test 3: RPC OpenWrt
    try {
       final response = await _dio.post(
         '$baseUrl/cgi-bin/luci/rpc/auth',
         data: {"id": 0, "method": "login", "params": []}
       );
       if (response.statusCode == 200) {
         return DiscoveryResult(type: RouterType.openwrt, ip: ip);
       }
    } catch (_) {}

    return DiscoveryResult(type: RouterType.unknown, ip: ip);
  }
}
