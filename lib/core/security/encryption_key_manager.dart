import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:encrypt/encrypt.dart' as enc;

class EncryptionKeyManager {
  static const String _keyName = 'netguard_encryption_key_v1';
  static final EncryptionKeyManager _instance = EncryptionKeyManager._internal();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  enc.Key? _cachedKey;

  factory EncryptionKeyManager() {
    return _instance;
  }

  EncryptionKeyManager._internal();

  Future<enc.Key> getKey() async {
    if (_cachedKey != null) return _cachedKey!;

    String? base64Key = await _storage.read(key: _keyName);
    
    if (base64Key == null) {
      // Generate a new 32-byte key
      final random = Random.secure();
      final values = List<int>.generate(32, (i) => random.nextInt(256));
      base64Key = base64.encode(values);
      await _storage.write(key: _keyName, value: base64Key);
    }

    _cachedKey = enc.Key.fromBase64(base64Key);
    return _cachedKey!;
  }

  /// Special case for backward compatibility: returns the legacy hardcoded key
  enc.Key getLegacyKey() {
    return enc.Key.fromUtf8('32CharLongKeyForEncryption123456');
  }
}
