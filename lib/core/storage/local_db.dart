import 'package:hive_flutter/hive_flutter.dart';

class LocalDatabase {
  static const String usageBox = 'usage_history';

  Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(usageBox);
  }

  List<Map<String, dynamic>> getUsageHistory() {
    final box = Hive.box(usageBox);
    return box.values.map((e) => Map<String, dynamic>.from(e)).toList();
  }

  Future<void> saveUsage(Map<String, dynamic> data) async {
    final box = Hive.box(usageBox);
    await box.add(data);
  }
}
