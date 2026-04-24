import '../../usage/domain/entities/usage_sample.dart';
import '../../usage/domain/entities/device_usage.dart';
import 'entities/device.dart';
import 'entities/traffic.dart';
import 'entities/system_log.dart';

abstract class RouterPlugin {
  Future<void> login(String ip, String password);
  Future<List<Device>> fetchDevices();
  Future<void> blockDevice(String mac);
  Future<TrafficSample> fetchTraffic();
  Future<UsageSample?> fetchTotalUsage();
  Future<List<DeviceUsage>?> fetchDevicesUsage();
  Future<List<SystemLog>> fetchLogs();
  bool canHandle(Map<String, dynamic> fingerprint);
}
