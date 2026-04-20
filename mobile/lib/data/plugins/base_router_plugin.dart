import '../models/router_model.dart';

/// 🛡️ العقد الهندسي الأساسي لأي إضافة راوتر جديدة
abstract class BaseRouterPlugin {
  String get name;
  
  // المصادقة
  Future<bool> login(String ip, String password);
  
  // إدارة الأجهزة
  Future<List<Map<String, dynamic>>> fetchDevices();
  Future<bool> blockDevice(String macAddress);
  
  // المراقبة
  Future<Map<String, dynamic>> fetchTrafficStats();
  
  // حالة الجلسة
  Future<bool> checkSession();
  Future<void> logout();
}
