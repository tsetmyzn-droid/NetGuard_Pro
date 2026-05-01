import 'package:netguard_pro/OpenWrt/Model/ConnectedDevice.dart';
import 'package:netguard_pro/OpenWrt/Model/InterfaceStatus.dart';

abstract class RouterPluginInterface {
  Future<bool> login(String username, String password);
  Future<List<InterfaceStatus>> getInterfacesStatus();
  Future<List<ConnectedDevice>> getDevices();
  void setBaseUrl(String url);
  Future<void> logout();
}
