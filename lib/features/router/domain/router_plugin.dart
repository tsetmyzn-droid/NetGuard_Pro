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
  
  // Optional operations
  Future<void> reboot() async => throw UnimplementedError('Reboot not supported by this plugin');
  Future<void> updateWifiSsid(String ssid) async => throw UnimplementedError('Update SSID not supported by this plugin');
  Future<void> updateWifiPassword(String password) async => throw UnimplementedError('Update Password not supported by this plugin');

  bool canHandle(Map<String, dynamic> fingerprint);
}
