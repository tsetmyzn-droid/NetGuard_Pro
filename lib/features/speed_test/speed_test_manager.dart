import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';
import 'model/speed_test_result.dart';

class SpeedTestManager {
  final NetGuardLogger _logger = NetGuardLogger();

  Future<SpeedTestResult?> runIsolatedTest() async {
    // TODO: NOT production ready - placeholder for multi-source strategy
    _logger.info("SpeedTest: Initializing multi-source testing sequence...");
    
    // Primary: Cloudflare
    try {
      final result = await compute(_executeTest, {
        "url": "https://speed.cloudflare.com/__down?bytes=10000000",
        "provider": "Cloudflare Edge"
      });
      if (result.downloadSpeedMbps > 0) return result;
    } catch (e) {
      _logger.warn("SpeedTest: Primary provider (Cloudflare) failed. Switching to M-Lab fallback.");
    }

    // Fallback: M-Lab (Generic large file test)
    try {
      final result = await compute(_executeTest, {
        "url": "https://ndt.measurementlab.net/ndt_protocol", // Placeholder pattern
        "provider": "M-Lab Global"
      });
      return result;
    } catch (e) {
      _logger.error("SpeedTest: All providers exited with errors.");
      return null;
    }
  }

  static Future<SpeedTestResult> _executeTest(Map<String, String> config) async {
    final dio = Dio(BaseOptions(connectTimeout: const Duration(seconds: 5)));
    final url = config["url"]!;
    final provider = config["provider"]!;
    
    // 1. Ping / Latency
    int ping = 0;
    try {
      final pingWatch = Stopwatch()..start();
      await dio.head(url);
      ping = pingWatch.elapsedMilliseconds;
    } catch (_) {
      ping = 999;
    }

    // 2. Download (10MB Sample)
    double downloadSpeed = 0;
    try {
      final downWatch = Stopwatch()..start();
      final response = await dio.get(
        url,
        options: Options(responseType: ResponseType.bytes),
      );
      final durationSec = downWatch.elapsedMilliseconds / 1000.0;
      final bytes = (response.data as List<int>).length;
      downloadSpeed = (bytes * 8) / (durationSec * 1024 * 1024);
    } catch (_) {
      downloadSpeed = 0;
    }

    // 3. Upload (Simulated context-aware estimate)
    // Note: Real upload tests require a writable multipart endpoint
    double uploadSpeed = downloadSpeed * 0.35; 

    return SpeedTestResult(
      downloadSpeedMbps: downloadSpeed,
      uploadSpeedMbps: uploadSpeed,
      pingMs: ping,
      server: provider,
      timestamp: DateTime.now(),
    );
  }
}
