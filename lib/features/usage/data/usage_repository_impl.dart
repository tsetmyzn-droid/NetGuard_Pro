import '../../router/data/router_repository_impl.dart';
import '../../router/domain/router_plugin.dart';
import '../../../core/storage/local_db.dart';
import '../domain/entities/usage_sample.dart';
import '../domain/entities/device_usage.dart';
import '../domain/entities/app_usage.dart';
import '../domain/repository/usage_repository.dart';

class UsageRepositoryImpl implements UsageRepository {
  final RouterRepositoryImpl _routerRepo;
  final LocalDatabase _localDb = LocalDatabase();

  UsageRepositoryImpl(this._routerRepo);

  RouterPlugin? get _plugin => _routerRepo.activePlugin;

  @override
  Future<UsageSample?> getLatestTotalUsage() async {
    if (_plugin == null) return null;
    return await _plugin!.fetchTotalUsage();
  }

  @override
  Future<List<DeviceUsage>?> getLatestDevicesUsage() async {
    if (_plugin == null) return null;
    return await _plugin!.fetchDevicesUsage();
  }

  @override
  Future<List<UsageSample>> getHistory(DateTime from, DateTime to) async {
    final rawDocs = _localDb.getUsageHistory();
    return rawDocs
        .where((e) => e['type'] == 'total')
        .map((e) => UsageSample(
              ts: DateTime.parse(e['ts']),
              rxBytes: e['rxBytes'] as int,
              txBytes: e['txBytes'] as int,
              appUsage: _mapToAppUsageList(e['appUsage']),
            ))
        .where((s) => s.ts.isAfter(from) && s.ts.isBefore(to))
        .toList();
  }

  @override
  Future<Map<String, List<DeviceUsage>>> getAllDevicesHistory(DateTime from, DateTime to) async {
    final rawDocs = _localDb.getUsageHistory();
    final Map<String, List<DeviceUsage>> history = {};
    
    final deviceDocs = rawDocs
        .where((e) => e['type'] == 'device')
        .map((e) => DeviceUsage(
              mac: e['mac'] as String,
              ts: DateTime.parse(e['ts']),
              rxBytes: e['rxBytes'] as int,
              txBytes: e['txBytes'] as int,
              appUsage: _mapToAppUsageList(e['appUsage']),
            ))
        .where((s) => s.ts.isAfter(from) && s.ts.isBefore(to))
        .toList();

    for (var usage in deviceDocs) {
      if (!history.containsKey(usage.mac)) {
        history[usage.mac] = [];
      }
      history[usage.mac]!.add(usage);
    }
    return history;
  }

  @override
  Future<List<DeviceUsage>> getDeviceHistory(String mac, DateTime from, DateTime to) async {
    final rawDocs = _localDb.getUsageHistory();
    return rawDocs
        .where((e) => e['type'] == 'device' && e['mac'] == mac)
        .map((e) => DeviceUsage(
              mac: e['mac'] as String,
              ts: DateTime.parse(e['ts']),
              rxBytes: e['rxBytes'] as int,
              txBytes: e['txBytes'] as int,
              appUsage: _mapToAppUsageList(e['appUsage']),
            ))
        .where((s) => s.ts.isAfter(from) && s.ts.isBefore(to))
        .toList();
  }

  List<AppUsage> _mapToAppUsageList(dynamic raw) {
    if (raw == null || raw is! List) return const [];
    return raw.map((a) => AppUsage(
      appName: a['appName'],
      category: AppCategory.values.firstWhere(
        (c) => c.name == a['category'],
        orElse: () => AppCategory.other,
      ),
      bytes: a['bytes'],
    )).toList();
  }

  @override
  Future<void> saveUsageSample(UsageSample sample) async {
    await _localDb.saveUsage({
      'ts': sample.ts.toIso8601String(),
      'rxBytes': sample.rxBytes,
      'txBytes': sample.txBytes,
      'appUsage': sample.appUsage.map((a) => {
        'appName': a.appName,
        'category': a.category.name,
        'bytes': a.bytes,
      }).toList(),
      'type': 'total',
    });
  }

  @override
  Future<void> saveDeviceUsage(List<DeviceUsage> devices) async {
    for (final device in devices) {
      await _localDb.saveUsage({
        'ts': device.ts.toIso8601String(),
        'mac': device.mac,
        'rxBytes': device.rxBytes,
        'txBytes': device.txBytes,
        'appUsage': device.appUsage.map((a) => {
          'appName': a.appName,
          'category': a.category.name,
          'bytes': a.bytes,
        }).toList(),
        'type': 'device',
      });
    }
  }
}
