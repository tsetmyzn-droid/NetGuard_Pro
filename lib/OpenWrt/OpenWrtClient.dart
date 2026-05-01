import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import 'package:path/path.dart' as p;
import 'Model/AuthResponse.dart';
import 'Model/ConnectedDevice.dart';
import 'Model/InterfaceStatus.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';

class OpenWrtClient {
  late Dio _dio;
  late CookieJar _cookieJar;
  String? _token;
  String? _baseUrl;
  bool _isInitialized = false;
  final NetGuardLogger _logger = NetGuardLogger();

  OpenWrtClient() {
    _dio = Dio();
    _initDio();
  }

  Future<void> _initDio() async {
    if (_isInitialized) return;
    try {
      final appDocDir = await getApplicationDocumentsDirectory();
      final cookiePath = p.join(appDocDir.path, ".cookies/");
      final dir = Directory(cookiePath);
      if (!await dir.exists()) {
        await dir.create(recursive: true);
      }
      
      _cookieJar = PersistCookieJar(storage: FileStorage(cookiePath));
      _dio.interceptors.add(CookieManager(_cookieJar));
      _isInitialized = true;
      _logger.info("OpenWrtClient: Session manager (CookieJar) initialized.");
    } catch (e) {
      _logger.error("OpenWrtClient Init Error: $e");
    }
  }

  String? get token => _token;

  void setBaseUrl(String url) {
    if (!url.startsWith('http')) {
      _baseUrl = 'http://$url';
    } else {
      _baseUrl = url;
    }
    if (_baseUrl!.endsWith('/')) {
      _baseUrl = _baseUrl!.substring(0, _baseUrl!.length - 1);
    }
  }

  Future<bool> login(String username, String password) async {
    await _initDio();
    if (_baseUrl == null) return false;

    final url = '$_baseUrl/cgi-bin/luci/rpc/auth';
    _logger.info("OpenWrt: Attempting login for user: $username");
    
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
          validateStatus: (status) => status! < 500,
        ),
      );

      if (response.statusCode == 200) {
        final authResponse = AuthResponse.fromJson(response.data);
        if (authResponse.isSuccess) {
          _token = authResponse.result;
          _logger.info("OpenWrt: Login successful. Session token acquired.");
          return true;
        }
      }
      _logger.warn("OpenWrt: Login failed. Response: ${response.data}");
      return false;
    } catch (e) {
      _logger.error('OpenWrt Login Exception: $e');
      return false;
    }
  }

  Future<bool> checkSession() async {
    await _initDio();
    if (_baseUrl == null || _token == null) return false;
    
    // Attempt a light RPC call to verify session
    try {
      final devices = await getDevices();
      return devices.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  Future<List<ConnectedDevice>> getDevices() async {
    await _initDio();
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
      _logger.error('OpenWrt Get Devices Error: $e');
      return [];
    }
  }

  Future<List<InterfaceStatus>> getInterfacesStatus() async {
    await _initDio();
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
      _logger.error('OpenWrt Traffic Stats Error: $e');
      return [];
    }
  }

  Future<void> logout() async {
    _token = null;
    await _cookieJar.deleteAll();
    _logger.info("OpenWrt: Session cleared (Logout).");
  }
}
