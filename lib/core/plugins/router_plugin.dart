abstract class RouterPlugin {
  final String ip;
  final String modelName;

  RouterPlugin({required this.ip, required this.modelName});

  /// محاولة تسجيل الدخول للراوتر
  Future<bool> login(String username, String password);

  /// جلب سرعات التحميل والرفع اللحظية
  Future<Map<String, double>> fetchTraffic();

  /// جلب قائمة الأجهزة المتصلة مع بيانات استهلاكها (إن وجد)
  Future<List<Map<String, dynamic>>> fetchDevices();

  /// حظر/إلغاء حظر جهاز عبر MAC Address
  Future<bool> setBlockState(String mac, bool block);

  /// تغيير إعدادات الواي فاي
  Future<bool> updateWifiSettings(String ssid, String password);

  /// التحقق من توافق الإضافة مع الراوتر المكتشف
  bool canHandle(String identity);
}
