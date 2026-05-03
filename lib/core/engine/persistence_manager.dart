import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:crypto/crypto.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:encrypt/encrypt.dart' as enc;
import 'package:netguard_pro/core/security/encryption_key_manager.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';

class PersistenceManager {
  static const String _fileName = 'engine_state.enc';
  static const String _checksumName = 'engine_state.checksum';
  
  final _keyManager = EncryptionKeyManager();

  Future<void> saveState(Map<String, dynamic> data) async {
    try {
      final key = await _keyManager.getKey();
      final directory = await getApplicationDocumentsDirectory();
      final file = File(p.join(directory.path, _fileName));
      final checksumFile = File(p.join(directory.path, _checksumName));

      final jsonString = jsonEncode(data);
      
      // Calculate Checksum for integrity
      final checksum = sha256.convert(utf8.encode(jsonString)).toString();

      // Encrypt for confidentiality with Random IV
      final iv = enc.IV.fromSecureRandom(16);
      final encrypter = enc.Encrypter(enc.AES(key));
      final encrypted = encrypter.encrypt(jsonString, iv: iv);

      // Prepend IV to the encrypted bytes: [IV (16 bytes)] + [Ciphertext]
      final combined = Uint8List.fromList(iv.bytes + encrypted.bytes);

      await file.writeAsBytes(combined);
      await checksumFile.writeAsString(checksum);
      
      NetGuardLogger().info("Engine state securely encrypted with random IV.");
    } catch (e) {
      NetGuardLogger().error("Failed to encrypt engine state: $e");
    }
  }

  Future<Map<String, dynamic>?> loadState() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File(p.join(directory.path, _fileName));
      final checksumFile = File(p.join(directory.path, _checksumName));

      if (!await file.exists() || !await checksumFile.exists()) return null;

      final combinedBytes = await file.readAsBytes();
      final savedChecksum = await checksumFile.readAsString();

      String? decrypted;
      final secureKey = await _keyManager.getKey();
      final legacyKey = _keyManager.getLegacyKey();
      
      // Try New System: First 16 bytes are IV, using Secure Key
      if (combinedBytes.length > 16) {
        try {
          final iv = enc.IV(combinedBytes.sublist(0, 16));
          final ciphertext = combinedBytes.sublist(16);
          final encrypter = enc.Encrypter(enc.AES(secureKey));
          decrypted = encrypter.decrypt(enc.Encrypted(ciphertext), iv: iv);
        } catch (_) {
          // If secure key fails, maybe it's still legacy key but with IV? (Transition state)
          try {
            final iv = enc.IV(combinedBytes.sublist(0, 16));
            final ciphertext = combinedBytes.sublist(16);
            final encrypter = enc.Encrypter(enc.AES(legacyKey));
            decrypted = encrypter.decrypt(enc.Encrypted(ciphertext), iv: iv);
            if (decrypted != null) NetGuardLogger().info("Legacy format (with IV) detected.");
          } catch (_) {
             decrypted = null;
          }
        }
      }

      // Backward Compatibility: Try Old System (Fixed Zero IV + Legacy Key)
      if (decrypted == null) {
        try {
          final oldIv = enc.IV.fromLength(16);
          final encrypter = enc.Encrypter(enc.AES(legacyKey));
          decrypted = encrypter.decrypt(enc.Encrypted(combinedBytes), iv: oldIv);
          
          NetGuardLogger().warn("Detected old legacy engine state. Migrating...");
          final data = jsonDecode(decrypted) as Map<String, dynamic>;
          await saveState(data); // Re-encrypt with new secure system
        } catch (_) {
          NetGuardLogger().error("Engine state decryption failed for all protocols.");
          return null;
        }
      }

      // Verify Integrity
      final currentChecksum = sha256.convert(utf8.encode(decrypted)).toString();
      if (savedChecksum != currentChecksum) {
        NetGuardLogger().warn("Engine state integrity check failed! Mismatch found.");
        return null;
      }

      return jsonDecode(decrypted) as Map<String, dynamic>;
    } catch (e) {
      NetGuardLogger().error("Critical failure during state decryption: $e");
      return null;
    }
  }

  Future<void> clearState() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File(p.join(directory.path, _fileName));
      final checksumFile = File(p.join(directory.path, _checksumName));

      if (await file.exists()) await file.delete();
      if (await checksumFile.exists()) await checksumFile.delete();
    } catch (e) {
      NetGuardLogger().error("Failed to clear engine state: $e");
    }
  }
}
