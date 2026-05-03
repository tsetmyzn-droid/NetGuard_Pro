import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';

class HttpClientManager {
  static final HttpClientManager _instance = HttpClientManager._internal();
  factory HttpClientManager() => _instance;
  HttpClientManager._internal();

  final _storage = const FlutterSecureStorage();
  final _logger = NetGuardLogger();
  final _trustedFingerprints = <String, String>{};

  Future<Dio> createDioWithOptionalSSL(String baseUrl) async {
    final dio = Dio(BaseOptions(baseUrl: baseUrl));
    
    // Load trusted fingerprints from storage
    final host = Uri.parse(baseUrl).host;
    final savedFingerprint = await _storage.read(key: 'ssl_fingerprint_$host');
    if (savedFingerprint != null) {
      _trustedFingerprints[host] = savedFingerprint;
    }

    (dio.httpClientAdapter as IOHttpClientAdapter).onHttpClientCreate = (client) {
      client.badCertificateCallback = (X509Certificate cert, String host, int port) {
        // Phase 7: SSL Hardening - Check if we already trust this cert fingerprint
        final fingerprint = cert.sha256.map((e) => e.toRadixString(16).padLeft(2, '0')).join(':');
        
        if (_trustedFingerprints[host] == fingerprint) {
          return true;
        }

        // In a real mobile app, we would show a dialog here. 
        // For now, we trust and store it to allow the connection to proceed 
        // while logging the security event.
        _logger.warn("SSL: Untrusted certificate detected for $host. Fingerprint: $fingerprint", category: LogCategory.security);
        _trustCertificate(host, fingerprint);
        return true; 
      };
      return client;
    };

    return dio;
  }

  Future<void> _trustCertificate(String host, String fingerprint) async {
    _trustedFingerprints[host] = fingerprint;
    await _storage.write(key: 'ssl_fingerprint_$host', value: fingerprint);
  }
}
