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

  /// جلب قدرات الراوتر ومواصفاته (Enterprise Phase 1)
  Future<Map<String, dynamic>> getCapabilities();

  /// بدء عملية تعديل آمنة (Enterprise Phase 2)
  Future<bool> applyConfig(String scope);

  /// تثبيت التعديلات بعد التأكد من سلامة النظام
  Future<bool> commitConfig(String scope);

  /// التراجع اليدوي السريع
  Future<bool> rollbackConfig(String scope);

  /// جلب قائمة ملفات التحليل الجنائي المتاحة
  Future<List<Map<String, dynamic>>> getForensicManifest();

  /// جلب محتوى ملف تحليل جنائي محدد
  Future<String?> pullForensicChunk(String id);

  /// تأكيد استلام وحذف ملف التحليل الجنائي
  Future<bool> acknowledgeForensicChunk(String id);

  /// الحصول على حالة نظام التعافي والتحذيرات
  Future<Map<String, dynamic>> getDiagnostics();

  /// الأمان والتحكم (Enterprise Phase 5)
  Future<bool> blockDevice(String mac, {String? hostname});
  Future<bool> unblockDevice(String mac);
  Future<bool> updateWifi(String ssid, {String? password, String? device});

  /// إرسال أمر للوكيل
  Future<bool> executeAction(String action, Map<String, dynamic> params);
}
