import '../entities/usage_sample.dart';
import '../entities/device_usage.dart';

abstract class UsageRepository {
  Future<UsageSample?> getLatestTotalUsage();
  Future<List<DeviceUsage>?> getLatestDevicesUsage();
  Future<List<UsageSample>> getHistory(DateTime from, DateTime to);
  Future<Map<String, List<DeviceUsage>>> getAllDevicesHistory(DateTime from, DateTime to);
  Future<List<DeviceUsage>> getDeviceHistory(String mac, DateTime from, DateTime to);
  Future<void> saveUsageSample(UsageSample sample);
  Future<void> saveDeviceUsage(List<DeviceUsage> devices);
}
