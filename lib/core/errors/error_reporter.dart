import 'package:dio/dio.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';

class ErrorReporter {
  static final Dio _dio = Dio();
  
  // يتم استبدال هذا الرابط بـ Webhook حقيقي أو API للذكاء الاصطناعي لاحقاً
  static const String _reportEndpoint = "https://your-api-endpoint.com/errors";

  static Future<void> report(dynamic error, StackTrace stack, {bool includeLogs = false}) async {
    final logger = NetGuardLogger();
    logger.error("CRITICAL ERROR CAPTURED: $error");
    
    // Phase 4: Do not send logs automatically without consent
    final List<String> sanitizedLogs = includeLogs 
        ? logger.getEntries().map((e) => e.toString()).toList() 
        : ["Logs omitted for security. User consent required for full diagnostic report."];

    final payload = {
      "timestamp": DateTime.now().toIso8601String(),
      "error": error.toString(),
      "stack": stack.toString(),
      "platform": "native_flutter_v5",
      "app_version": "5.0.0",
      "logs": sanitizedLogs,
    };

    try {
      if (includeLogs) {
        logger.info("Sending full diagnostic report to developer center...");
      } else {
        logger.info("Sending basic crash report (anonymous)...");
      }
      
      // await _dio.post(_reportEndpoint, data: payload); // Enabled when Endpoint is ready
    } catch (e) {
      logger.error("Failed to send remote report: $e");
    }
  }
}
