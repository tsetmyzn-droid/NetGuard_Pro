import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';
import 'package:netguard_pro/core/plugins/model/agent_traffic_stats.dart';

class DatabaseManager {
  static final DatabaseManager _instance = DatabaseManager._internal();
  factory DatabaseManager() => _instance;
  DatabaseManager._internal();

  Isar? _isar;

  Future<Isar> get db async {
    if (_isar != null) return _isar!;
    
    final dir = await getApplicationDocumentsDirectory();
    _isar = await Isar.open(
      [AgentTrafficStatsSchema],
      directory: dir.path,
      name: 'netguard_stats',
    );
    
    return _isar!;
  }

  Future<void> close() async {
    await _isar?.close();
    _isar = null;
  }
}
