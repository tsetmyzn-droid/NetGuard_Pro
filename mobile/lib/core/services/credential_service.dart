import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

class SecureCredentialService {
  final _secureStorage = const FlutterSecureStorage();
  static const String _authBoxName = 'auth_cache';

  // 🔑 حفظ الأسرار (كلمات المرور) في المخزن الآمن للنظام
  Future<void> saveCredentials(String ip, String password) async {
    await _secureStorage.write(key: 'router_pass_$ip', value: password);
    
    // حفظ الـ IP والبيانات العامة في Hive
    var box = Hive.box(_authBoxName);
    await box.put('last_connected_ip', ip);
  }

  // 🔓 استرجاع كلمة المرور
  Future<String?> getPassword(String ip) async {
    return await _secureStorage.read(key: 'router_pass_$ip');
  }

  String? getLastIp() {
    return Hive.box(_authBoxName).get('last_connected_ip');
  }

  Future<void> deleteAll() async {
    await _secureStorage.deleteAll();
    await Hive.box(_authBoxName).clear();
  }
}
