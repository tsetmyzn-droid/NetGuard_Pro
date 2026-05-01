import 'package:netguard_pro/OpenWrt/Model/ConnectedDevice.dart';
import 'package:netguard_pro/OpenWrt/Model/InterfaceStatus.dart';

abstract class RouterPlugin {
  final String ip;
  final String modelName;

  RouterPlugin({required this.ip, required this.modelName});

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
