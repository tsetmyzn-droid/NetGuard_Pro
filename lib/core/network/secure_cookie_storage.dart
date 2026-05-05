import 'package:cookie_jar/cookie_jar.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

class SecureCookieStorage implements Storage {
  final _storage = const FlutterSecureStorage();
  final String _keyPrefix = "netguard_cookies_";

  @override
  Future<void> init(bool persistSession, bool ignoreExpires) async {}

  @override
  Future<void> delete(String key) async {
    await _storage.delete(key: _keyPrefix + key);
  }

  @override
  Future<void> deleteAll(List<String> keys) async {
    for (var key in keys) {
      await _storage.delete(key: _keyPrefix + key);
    }
  }

  @override
  Future<String?> read(String key) async {
    return await _storage.read(key: _keyPrefix + key);
  }

  @override
  Future<void> write(String key, String value) async {
    await _storage.write(key: _keyPrefix + key, value: value);
  }
}
