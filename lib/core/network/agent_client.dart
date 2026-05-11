import 'package:dio/dio.dart';

abstract class AgentClient {
  final String ip;
  final String? sharedKey;

  AgentClient({required this.ip, this.sharedKey});

  /// التحقق من صحة الاتصال بالعميل (Handshake)
  Future<bool> checkHealth();

  /// جلب البيانات التاريخية من الوكيل
  /// [mac] اختياري لجلب بيانات جهاز محدد
  Future<Map<String, dynamic>> getTelemetryData({String? mac, int? hours});

  /// الحصول على حالة نظام التعافي والتحذيرات
  Future<Map<String, dynamic>> getDiagnostics();

  /// إرسال أمر للوكيل
  Future<bool> executeAction(String action, Map<String, dynamic> params);
}
