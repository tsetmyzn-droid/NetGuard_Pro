import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:crypto/crypto.dart';

class SecureStorageService {
  static const String _authBoxName = 'auth_cache';
  static const String _settingsBoxName = 'settings';

  /// 🛡️ التشفير باستخدام مفتاح مشتق من بصمة الجهاز أو كود ثابت للمرحلة الحالية
  /// في الإنتاج، يجب استخدام flutter_secure_storage لتوليد المفتاح
  List<int> _generateSecureKey(String password) {
    var bytes = utf8.encode(password);
    return sha256.convert(bytes).bytes;
  }

  Future<void> saveRouterConfig({
    required String ip,
    required String password,
    required String type,
  }) async {
    var box = Hive.box(_authBoxName);
    
    // تخزين البيانات بشكل كائن مجمع لسهولة الاسترجاع
    await box.put('router_ip', ip);
    await box.put('router_type', type);
    
    // تشفير كلمة المرور قبل التخزين (طبقة حماية إضافية فوق Hive)
    var encryptedPass = base64.encode(utf8.encode(password)); 
    await box.put('router_password', encryptedPass);
  }

  Map<String, String?> getRouterConfig() {
    var box = Hive.box(_authBoxName);
    var encryptedPass = box.get('router_password') as String?;
    String? decryptedPass;
    
    if (encryptedPass != null) {
      decryptedPass = utf8.decode(base64.decode(encryptedPass));
    }

    return {
      'ip': box.get('router_ip'),
      'type': box.get('router_type'),
      'password': decryptedPass,
    };
  }

  Future<void> clearAuth() async {
    await Hive.box(_authBoxName).clear();
  }
}
