import 'package:dio/dio.dart';
import 'package:netguard_pro/core/network/agent_client.dart';
import 'package:netguard_pro/core/security/agent_request_signer.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';

class OpenWrtAgentClient extends AgentClient {
  final Dio _dio = Dio();
  
  OpenWrtAgentClient({required super.ip, super.sharedKey});

  String get _baseUrl => "http://$ip/cgi-bin/netguard";

  Future<Map<String, String>> _getSecurityHeaders(String method, String path, {String? body}) async {
    if (sharedKey == null) return {};

    final nonce = AgentRequestSigner.generateNonce();
    final timestamp = AgentRequestSigner.currentTimestamp();
    
    final signature = AgentRequestSigner.generateSignature(
      sharedKey: sharedKey!,
      method: method,
      path: path,
      nonce: nonce,
      timestamp: timestamp,
      body: body,
    );

    return {
      'X-NetGuard-Signature': signature,
      'X-NetGuard-Nonce': nonce,
      'X-NetGuard-Timestamp': timestamp.toString(),
    };
  }

  @override
  Future<bool> checkHealth() async {
    try {
      final headers = await _getSecurityHeaders('GET', '/ping');
      final response = await _dio.get("$_baseUrl/ping", options: Options(headers: headers));
      return response.statusCode == 200;
    } catch (e) {
      NetGuardLogger().error("Agent health check failed: $e");
      return false;
    }
  }

  @override
  Future<Map<String, dynamic>> getTelemetryData({String? mac, int? hours}) async {
    try {
      final path = '/traffic';
      final headers = await _getSecurityHeaders('GET', path);
      final response = await _dio.get("$_baseUrl$path", options: Options(headers: headers));
      
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      return {};
    } catch (e) {
      NetGuardLogger().error("Failed to get agent telemetry: $e");
      return {};
    }
  }

  @override
  Future<Map<String, dynamic>> getDiagnostics() async {
    try {
      final headers = await _getSecurityHeaders('GET', '/stats');
      final response = await _dio.get("$_baseUrl/stats", options: Options(headers: headers));
      return response.data as Map<String, dynamic>;
    } catch (e) {
      return {'error': e.toString()};
    }
  }

  @override
  Future<bool> executeAction(String action, Map<String, dynamic> params) async {
    // Implementation for POST actions
    return false;
  }
}
