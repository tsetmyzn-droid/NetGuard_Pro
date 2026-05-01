import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';

class PersistenceManager {
  static const String _fileName = 'engine_state.json';
  static const String _checksumName = 'engine_state.checksum';

  Future<void> saveState(Map<String, dynamic> data) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File(p.join(directory.path, _fileName));
      final checksumFile = File(p.join(directory.path, _checksumName));

      final jsonString = jsonEncode(data);
      final checksum = sha256.convert(utf8.encode(jsonString)).toString();

      await file.writeAsString(jsonString);
      await checksumFile.writeAsString(checksum);
      
      NetGuardLogger().info("Engine state persisted successfully with checksum: ${checksum.substring(0, 8)}");
    } catch (e) {
      NetGuardLogger().error("Failed to persist engine state: $e");
    }
  }

  Future<Map<String, dynamic>?> loadState() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File(p.join(directory.path, _fileName));
      final checksumFile = File(p.join(directory.path, _checksumName));

      if (!await file.exists() || !await checksumFile.exists()) return null;

      final jsonString = await file.readAsString();
      final savedChecksum = await checksumFile.readAsString();
      final currentChecksum = sha256.convert(utf8.encode(jsonString)).toString();

      if (savedChecksum != currentChecksum) {
        NetGuardLogger().warn("Engine state checksum mismatch! Possible data corruption. Resetting state.");
        return null;
      }

      return jsonDecode(jsonString) as Map<String, dynamic>;
    } catch (e) {
      NetGuardLogger().error("Failed to load persisted state: $e");
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
