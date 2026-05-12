import 'package:netguard_pro/core/plugins/model/connected_device.dart';
import 'package:netguard_pro/core/plugins/model/interface_status.dart';
import 'package:netguard_pro/core/network/agent_client.dart';

abstract class RouterPlugin {
  final String ip;
  final String modelName;

  RouterPlugin({required this.ip, required this.modelName});

  /// القدرات (Capabilities) - يتم استبدالها في الإضافات التي تدعم هذه الميزات
  bool get supportsWifiManagement => false;
  bool get supportsDeviceBlocking => false;
  bool get supportsTrafficStats => true;
  
  /// هل الراوتر يدعم نظام الـ Agent المتقدم
  bool get hasAgentSupport => false;

  /// الوكيل (Agent) المرتبط بالراوتر إن وجد
  AgentClient? get agent => null;

  /// محاولة تسجيل الدخول للراوتر
  Future<bool> login(String username, String password);

  /// جلب إحصائيات المرور لكل واجهة
  Future<List<InterfaceStatus>> getTrafficStats();
  
  /// جلب قدرات الراوتر (Enterprise Phase 1)
  Future<Map<String, dynamic>> getCapabilities();
  
  /// تطبيق إعدادات آمن مع مؤقت (Enterprise Phase 2)
  Future<bool> applyConfig(String scope);
  
  /// تأكيد الإعدادات
  Future<bool> commitConfig(String scope);
  
  /// التراجع عن الإعدادات
  Future<bool> rollbackConfig(String scope);

  /// جلب قائمة ملفات التحليل الجنائي
  Future<List<Map<String, dynamic>>> getForensicManifest();
  
  /// جلب محتوى ملف تحليل جنائي
  Future<String?> pullForensicChunk(String id);
  
  /// تأكيد الاستلام
  Future<bool> acknowledgeForensicChunk(String id);

  /// جلب قائمة الأجهزة المتصلة
  Future<List<ConnectedDevice>> getConnectedDevices();

  /// التحكم في جدار الحماية والواي فاي (Enterprise Phase 5)
  Future<bool> blockDevice(String mac, {String? hostname});
  Future<bool> unblockDevice(String mac);
  Future<bool> updateWifi(String ssid, {String? password});

  /// حظر/إلغاء حظر جهاز عبر MAC Address
  Future<bool> setBlockState(String mac, bool block);

  /// تغيير إعدادات الواي فاي
  Future<bool> updateWifiSettings(String ssid, String password);

  /// التحقق من توافق الإضافة مع الراوتر المكتشف
  bool canHandle(String identity);

  Future<void> logout();
}
