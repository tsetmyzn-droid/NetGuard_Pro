import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage();
  
  static const _keyIp = 'last_router_ip';
  static const _keyToken = 'session_token';

  Future<void> saveLastIp(String ip) async {
    await _storage.write(key: _keyIp, value: ip);
  }

  Future<String?> getLastIp() async {
    return await _storage.read(key: _keyIp);
  }

  Future<void> saveToken(String token) async {
    await _storage.write(key: _keyToken, value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: _keyToken);
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
