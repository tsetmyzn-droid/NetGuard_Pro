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
  Future<Map<String, dynamic>> getCapabilities() async {
    try {
      const path = '/capabilities';
      final headers = await _getSecurityHeaders('GET', path);
      final response = await _dio.get("$_baseUrl$path", options: Options(headers: headers));
      
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      return {};
    } catch (e) {
      NetGuardLogger().error("Failed to get agent capabilities: $e");
      return {};
    }
  }

  @override
  Future<bool> applyConfig(String scope) async {
    try {
      const path = '/apply';
      final body = {'scope': scope};
      final headers = await _getSecurityHeaders('POST', path, body: body);
      final response = await _dio.post("$_baseUrl$path", 
          data: body, options: Options(headers: headers));
      return response.statusCode == 200;
    } catch (e) {
      NetGuardLogger().error("Failed to apply config: $e");
      return false;
    }
  }

  @override
  Future<bool> commitConfig(String scope) async {
    try {
      const path = '/commit';
      final body = {'scope': scope};
      final headers = await _getSecurityHeaders('POST', path, body: body);
      final response = await _dio.post("$_baseUrl$path", 
          data: body, options: Options(headers: headers));
      return response.statusCode == 200;
    } catch (e) {
      NetGuardLogger().error("Failed to commit config: $e");
      return false;
    }
  }

  @override
  Future<bool> rollbackConfig(String scope) async {
    try {
      const path = '/rollback';
      final body = {'scope': scope};
      final headers = await _getSecurityHeaders('POST', path, body: body);
      final response = await _dio.post("$_baseUrl$path", 
          data: body, options: Options(headers: headers));
      return response.statusCode == 200;
    } catch (e) {
      NetGuardLogger().error("Failed to rollback config: $e");
      return false;
    }
  }

  @override
  Future<List<Map<String, dynamic>>> getForensicManifest() async {
    try {
      const path = '/forensics/list';
      final headers = await _getSecurityHeaders('GET', path);
      final response = await _dio.get("$_baseUrl$path", options: Options(headers: headers));
      if (response.statusCode == 200) {
        return List<Map<String, dynamic>>.from(response.data);
      }
      return [];
    } catch (e) {
      NetGuardLogger().error("Failed to get forensic manifest: $e");
      return [];
    }
  }

  @override
  Future<String?> pullForensicChunk(String id) async {
    try {
      const path = '/forensics/pull';
      final body = {'id': id};
      final headers = await _getSecurityHeaders('POST', path, body: body);
      final response = await _dio.post("$_baseUrl$path", data: body, options: Options(headers: headers));
      if (response.statusCode == 200) {
        return response.data['content'] as String?;
      }
      return null;
    } catch (e) {
      NetGuardLogger().error("Failed to pull forensic chunk $id: $e");
      return null;
    }
  }

  @override
  Future<bool> acknowledgeForensicChunk(String id) async {
    try {
      const path = '/forensics/ack';
      final body = {'id': id};
      final headers = await _getSecurityHeaders('POST', path, body: body);
      final response = await _dio.post("$_baseUrl$path", data: body, options: Options(headers: headers));
      return response.statusCode == 200;
    } catch (e) {
      NetGuardLogger().error("Failed to acknowledge forensic chunk $id: $e");
      return false;
    }
  }

  @override
  Future<bool> blockDevice(String mac, {String? hostname}) async {
    try {
      const path = '/firewall/block';
      final body = {'mac': mac, 'hostname': hostname};
      final headers = await _getSecurityHeaders('POST', path, body: body);
      final response = await _dio.post("$_baseUrl$path", data: body, options: Options(headers: headers));
      return response.statusCode == 200;
    } catch (e) {
      NetGuardLogger().error("Failed to block device: $e");
      return false;
    }
  }

  @override
  Future<bool> unblockDevice(String mac) async {
    try {
      const path = '/firewall/unblock';
      final body = {'mac': mac};
      final headers = await _getSecurityHeaders('POST', path, body: body);
      final response = await _dio.post("$_baseUrl$path", data: body, options: Options(headers: headers));
      return response.statusCode == 200;
    } catch (e) {
      NetGuardLogger().error("Failed to unblock device: $e");
      return false;
    }
  }

  @override
  Future<bool> updateWifi(String ssid, {String? password, String? device}) async {
    try {
      const path = '/wifi/update';
      final body = {'ssid': ssid, 'password': password, 'device': device};
      final headers = await _getSecurityHeaders('POST', path, body: body);
      final response = await _dio.post("$_baseUrl$path", data: body, options: Options(headers: headers));
      return response.statusCode == 200;
    } catch (e) {
      NetGuardLogger().error("Failed to update WiFi: $e");
      return false;
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
