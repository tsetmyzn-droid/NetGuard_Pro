abstract class RouterPlugin {
  final String ip;
  final String modelName;

  RouterPlugin({required this.ip, required this.modelName});

  /// محاولة تسجيل الدخول للراوتر
  Future<bool> login(String username, String password);

  /// جلب سرعات التحميل والرفع اللحظية
  Future<Map<String, double>> fetchTraffic();

  /// التحقق من توافق الإضافة مع الراوتر المكتشف
  bool canHandle(String identity);
}
