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

  /// جلب قائمة الأجهزة المتصلة
  Future<List<ConnectedDevice>> getConnectedDevices();

  /// حظر/إلغاء حظر جهاز عبر MAC Address
  Future<bool> setBlockState(String mac, bool block);

  /// تغيير إعدادات الواي فاي
  Future<bool> updateWifiSettings(String ssid, String password);

  /// التحقق من توافق الإضافة مع الراوتر المكتشف
  bool canHandle(String identity);

  Future<void> logout();
}
