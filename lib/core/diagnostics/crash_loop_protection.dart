import 'package:shared_preferences/shared_preferences.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';

class CrashLoopProtection {
  static const String _keyLastCrash = 'last_crash_timestamp';
  static const String _keyCrashCount = 'crash_count';
  static const int _maxRetries = 3;
  static const Duration _window = Duration(minutes: 2);

  static Future<bool> shouldBlockRestart() async {
    final prefs = await SharedPreferences.getInstance();
    final lastCrash = prefs.getInt(_keyLastCrash) ?? 0;
    final now = DateTime.now().millisecondsSinceEpoch;
    
    // If last crash was more than window ago, reset count
    if (now - lastCrash > _window.inMilliseconds) {
      await prefs.setInt(_keyCrashCount, 0);
      return false;
    }

    final count = prefs.getInt(_keyCrashCount) ?? 0;
    return count >= _maxRetries;
  }

  static Future<void> recordCrash() async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now().millisecondsSinceEpoch;
    final count = (prefs.getInt(_keyCrashCount) ?? 0) + 1;

    await prefs.setInt(_keyLastCrash, now);
    await prefs.setInt(_keyCrashCount, count);
    
    NetGuardLogger().error("CRASH RECORDED. Total consecutive crashes: $count");
  }

  static Future<void> reset() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_keyCrashCount, 0);
  }
}
