import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';
import 'model/speed_test_result.dart';

class SpeedTestManager {
  final NetGuardLogger _logger = NetGuardLogger();

  Future<SpeedTestResult?> runIsolatedTest() async {
    _logger.info("SpeedTest: Starting isolated test...");
    
    try {
      // Use compute to run the heavy logic in a separate isolate
      final result = await compute(_executeTest, "https://speed.cloudflare.com/__down?bytes=10000000");
      _logger.info("SpeedTest: Test finished. Result: ${result.downloadSpeedMbps.toStringAsFixed(2)} Mbps");
      return result;
    } catch (e) {
      _logger.error("SpeedTest: Isolated test failed: $e");
      return null;
    }
  }

  // This function runs in a separate isolate
  static Future<SpeedTestResult> _executeTest(String downloadUrl) async {
    final dio = Dio();
    final stopwatch = Stopwatch()..start();
    
    // 1. Ping Test
    int ping = 0;
    try {
      final pingWatch = Stopwatch()..start();
      await dio.head(downloadUrl);
      ping = pingWatch.elapsedMilliseconds;
    } catch (_) {
      ping = 999;
    }

    // 2. Download Test (Simulated or Real depending on environment)
    // We'll perform a real small download here
    double downloadSpeed = 0;
    try {
      final downWatch = Stopwatch()..start();
      final response = await dio.get(
        downloadUrl,
        options: Options(responseType: ResponseType.bytes),
      );
      final durationSec = downWatch.elapsedMilliseconds / 1000.0;
      final bytes = (response.data as List<int>).length;
      // Convert bytes per second to Mbps (Megabits per second)
      downloadSpeed = (bytes * 8) / (durationSec * 1024 * 1024);
    } catch (_) {
      downloadSpeed = 0;
    }

    // 3. Upload Test (Simplified for this blueprint)
    double uploadSpeed = downloadSpeed * 0.4; // Estimating for demo purposes

    return SpeedTestResult(
      downloadSpeedMbps: downloadSpeed,
      uploadSpeedMbps: uploadSpeed,
      pingMs: ping,
      server: "Cloudflare Edge",
      timestamp: DateTime.now(),
    );
  }
}
