import '../repository/usage_repository.dart';
import '../entities/usage_sample.dart';
import '../entities/device_usage.dart';

class CollectUsage {
  final UsageRepository repository;

  CollectUsage(this.repository);

  Future<void> execute() async {
    final total = await repository.getLatestTotalUsage();
    if (total != null) {
      await repository.saveUsageSample(total);
    }

    final devices = await repository.getLatestDevicesUsage();
    if (devices != null) {
      await repository.saveDeviceUsage(devices);
    }
  }
}
