import 'package:flutter/foundation.dart';

class AppLogger {
  static void log(String message, {String tag = 'INFO'}) {
    if (kDebugMode) {
      print('[NetGuard][$tag] ${DateTime.now()}: $message');
    }
  }

  static void error(String message, [dynamic error]) {
    print('[NetGuard][ERROR] ${DateTime.now()}: $message | Error: $error');
  }
}
