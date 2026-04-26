import 'package:dio/dio.dart';
import 'Model/AuthResponse.dart';
import 'Model/ConnectedDevice.dart';
import 'Model/InterfaceStatus.dart';

class OpenWrtClient {
  final Dio _dio = Dio();
  String? _token;
  String? _baseUrl;

  String? get token => _token;

  void setBaseUrl(String url) {
    if (!url.startsWith('http')) {
      _baseUrl = 'http://$url';
    } else {
      _baseUrl = url;
    }
    // Remove trailing slash if exists
    if (_baseUrl!.endsWith('/')) {
      _baseUrl = _baseUrl!.substring(0, _baseUrl!.length - 1);
    }
  }

  /// Phase 1: Authentication (التوثيق)
  /// Authenticates with LuCI RPC returning a token if successful.
  Future<bool> login(String username, String password) async {
    if (_baseUrl == null) return false;

    final url = '$_baseUrl/cgi-bin/luci/rpc/auth';
    
    try {
      final response = await _dio.post(
        url,
        data: {
          "id": 1,
          "method": "login",
          "params": [username, password]
        },
        options: Options(
          headers: {'Content-Type': 'application/json'},
        ),
      );

      if (response.statusCode == 200) {
        final authResponse = AuthResponse.fromJson(response.data);
        if (authResponse.isSuccess) {
          _token = authResponse.result;
          return true;
        }
      }
      return false;
    } catch (e) {
      print('OpenWrt Login Error: $e');
      return false;
    }
  }

  /// Phase 2: Device List (قائمة الأجهزة)
  /// Gets the list of connected devices via DHCP Leases.
  Future<List<ConnectedDevice>> getDevices() async {
    if (_baseUrl == null || _token == null) return [];

    final url = '$_baseUrl/cgi-bin/luci/rpc/network?auth=$_token';
    
    try {
      final response = await _dio.post(
        url,
        data: {
          "id": 2,
          "method": "get_dhcp_leases",
          "params": []
        },
      );

      if (response.statusCode == 200 && response.data['result'] != null) {
        final List<dynamic> result = response.data['result'];
        return result.map((deviceList) => ConnectedDevice.fromList(deviceList)).toList();
      }
      return [];
    } catch (e) {
      print('OpenWrt Get Devices Error: $e');
      return [];
    }
  }

  /// Phase 3: Traffic Stats (إحصائيات المرور)
  /// Gets statistics for all network interfaces.
  Future<List<InterfaceStatus>> getInterfacesStatus() async {
    if (_baseUrl == null || _token == null) return [];

    final url = '$_baseUrl/cgi-bin/luci/rpc/network?auth=$_token';

    try {
      final response = await _dio.post(
        url,
        data: {
          "id": 3,
          "method": "get_all_interfaces_status",
          "params": []
        },
      );

      if (response.statusCode == 200 && response.data['result'] != null) {
        final Map<String, dynamic> result = response.data['result'];
        List<InterfaceStatus> interfaces = [];
        result.forEach((key, value) {
          interfaces.add(InterfaceStatus.fromJson(key, value));
        });
        return interfaces;
      }
      return [];
    } catch (e) {
      print('OpenWrt Traffic Stats Error: $e');
      return [];
    }
  }
}
