import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';

class CrashSnapshot {
  static Future<void> save(dynamic error, StackTrace stack) async {
    try {
      final logger = NetGuardLogger();
      final lastLogs = logger.getEntries().reversed.take(50).toList().reversed;
      
      final docDir = await getApplicationDocumentsDirectory();
      final file = File(p.join(docDir.path, 'crash_snapshot.log'));
      
      final StringBuffer buffer = StringBuffer();
      buffer.writeln("=== NETGUARD PRO CRASH SNAPSHOT ===");
      buffer.writeln("Timestamp: ${DateTime.now()}");
      buffer.writeln("Error: $error");
      buffer.writeln("\n=== STACK TRACE ===");
      buffer.writeln(stack);
      buffer.writeln("\n=== RECENT LOGS ===");
      for (var log in lastLogs) {
        buffer.writeln(log.toString());
      }
      
      await file.writeAsString(buffer.toString());
    } catch (e) {
      // Silent fail during crash to avoid secondary crash
    }
  }
}
