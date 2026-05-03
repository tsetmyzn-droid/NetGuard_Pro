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
import 'package:netguard_pro/core/network/http_client_manager.dart';

class OpenWrtClient {
  late Dio _dio;
  late CookieJar _cookieJar;
  String? _token;
  String? _baseUrl;
  bool _isInitialized = false;
  final NetGuardLogger _logger = NetGuardLogger();
  final HttpClientManager _httpManager = HttpClientManager();

  // Phase 2: Session persistence
  String? _lastUsername;
  String? _lastPassword;
  bool _isRefreshing = false;

  OpenWrtClient() {
    _dio = Dio();
    _initDio();
  }

  Future<void> _initDio() async {
    if (_isInitialized) return;
    try {
      if (_baseUrl == null) {
        _dio = Dio();
      } else {
        _dio = await _httpManager.createDioWithOptionalSSL(_baseUrl!);
      }

      final appDocDir = await getApplicationDocumentsDirectory();
      final cookiePath = p.join(appDocDir.path, ".cookies/");
      final dir = Directory(cookiePath);
      if (!await dir.exists()) {
        await dir.create(recursive: true);
      }
      
      _cookieJar = PersistCookieJar(storage: FileStorage(cookiePath));
      _dio.interceptors.add(CookieManager(_cookieJar));

      // Phase 4: Network Hardening
      _dio.options.connectTimeout = const Duration(seconds: 5);
      _dio.options.receiveTimeout = const Duration(seconds: 10);
      _dio.options.validateStatus = (status) => status != null && status < 500;
      
      // Phase 4: Retry Interceptor with Backoff
      _dio.interceptors.add(InterceptorsWrapper(
        onError: (DioException e, handler) async {
          // Retry Logic: max 3 retries for connection issues
          int retryCount = e.requestOptions.extra['retryCount'] ?? 0;
          if (retryCount < 3 && (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout)) {
            retryCount++;
            final delay = Duration(seconds: (1 << (retryCount - 1))); // 1, 2, 4 seconds
            await Future.delayed(delay);
            
            e.requestOptions.extra['retryCount'] = retryCount;
            _logger.warn("OpenWrt: Retry #$retryCount after ${delay.inSeconds}s...");
            final response = await _dio.fetch(e.requestOptions);
            return handler.resolve(response);
          }

          if (e.response?.statusCode == 401 && _lastUsername != null && _lastPassword != null && !_isRefreshing) {
            _isRefreshing = true;
            _logger.warn("OpenWrt: Session 401 detected. Attempting auto-relogin...");
            
            final success = await login(_lastUsername!, _lastPassword!);
            _isRefreshing = false;
            
            if (success) {
              final options = e.requestOptions;
              // Phase 4: Update Auth Header
              options.headers['Authorization'] = 'Bearer $_token';
              
              try {
                final response = await _dio.fetch(options);
                return handler.resolve(response);
              } catch (retryError) {
                return handler.next(e);
              }
            }
          }
          return handler.next(e);
        },
      ));

      _isInitialized = true;
      _logger.info("OpenWrtClient: Session manager (with Interceptor) initialized.");
    } catch (e) {
      _logger.error("OpenWrtClient Init Error: $e");
    }
  }

  String? get token => _token;

  void setBaseUrl(String url) {
    // Phase 4 & 7: Preference for HTTPS
    String cleanUrl = url;
    if (cleanUrl.startsWith('http://')) {
      cleanUrl = cleanUrl.replaceFirst('http://', '');
    } else if (cleanUrl.startsWith('https://')) {
      cleanUrl = cleanUrl.replaceFirst('https://', '');
    }
    
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.substring(0, cleanUrl.length - 1);
    }

    // Phase 7: Enforce HTTPS preference
    _baseUrl = 'https://$cleanUrl';
    _isInitialized = false; // Force re-init of Dio with SSL manager
    _logger.info("OpenWrt: Base URL set to $_baseUrl (HTTPS preference)");
  }

  Future<bool> login(String username, String password) async {
    await _initDio();
    if (_baseUrl == null) return false;

    _lastUsername = username;
    _lastPassword = password;

    return _performLogin(username, password, retryWithHttp: true);
  }

  Future<bool> _performLogin(String username, String password, {bool retryWithHttp = false}) async {
    final url = '$_baseUrl/cgi-bin/luci/rpc/auth';
    _logger.info("OpenWrt: Attempting login at $url");
    
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
          _logger.info("OpenWrt: Login successful.");
          return true;
        }
      }
      return false;
    } catch (e) {
      if (retryWithHttp && _baseUrl!.startsWith('https://')) {
        _logger.warn("OpenWrt: HTTPS failed, falling back to HTTP...");
        _baseUrl = _baseUrl!.replaceFirst('https://', 'http://');
        return _performLogin(username, password, retryWithHttp: false);
      }
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

    final url = '$_baseUrl/cgi-bin/luci/rpc/network';
    
    try {
      // 1. Get DHCP Leases (All known devices)
      final response = await _dio.post(
        url,
        data: {
          "id": 2,
          "method": "get_dhcp_leases",
          "params": []
        },
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_token'
          },
        ),
      );

      List<ConnectedDevice> initialDevices = [];
      if (response.statusCode == 200 && response.data['result'] != null) {
        final List<dynamic> result = response.data['result'];
        initialDevices = result.map((deviceList) => ConnectedDevice.fromList(deviceList)).toList();
      }

      // 2. Get Wireless Stations to enhance data
      final wifiStations = await _getWirelessStations();
      
      // 3. Merge data
      return initialDevices.map((device) {
        final wifiData = wifiStations[device.macAddress.toLowerCase()];
        if (wifiData != null) {
          return device.copyWith(
            connectionType: "wireless",
            signalStrength: wifiData['signal'],
          );
        }
        return device.copyWith(connectionType: "wired");
      }).toList();

    } catch (e) {
      _logger.error('OpenWrt Get Devices Error: $e');
      return [];
    }
  }

  Future<Map<String, Map<String, dynamic>>> _getWirelessStations() async {
    final url = '$_baseUrl/cgi-bin/luci/rpc/sys';
    Map<String, Map<String, dynamic>> stations = {};

    try {
      // We try to get output from iwinfo assoclist for wlan0 and wlan1 (common interfaces)
      for (var interface in ['wlan0', 'wlan1']) {
        final response = await _dio.post(
          url,
          data: {
            "id": 4,
            "method": "exec",
            "params": ["iwinfo $interface assoclist"]
          },
          options: Options(
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $_token'
            },
          ),
        );

        if (response.statusCode == 200 && response.data['result'] != null) {
          final String output = response.data['result'].toString();
          // Parsing iwinfo output:
          // MAC_ADDRESS -80 dBm / -95 dBm (SNR 15) ...
          final lines = output.split('\n');
          for (var line in lines) {
            final match = RegExp(r'([0-9A-Fa-f:]{17})\s+(-?\d+)\s+dBm').firstMatch(line);
            if (match != null) {
              final mac = match.group(1)!.toLowerCase();
              final signal = int.tryParse(match.group(2) ?? "0") ?? 0;
              stations[mac] = {'signal': signal};
            }
          }
        }
      }
    } catch (_) {}
    return stations;
  }

  Future<List<InterfaceStatus>> getInterfacesStatus() async {
    await _initDio();
    if (_baseUrl == null || _token == null) return [];

    final url = '$_baseUrl/cgi-bin/luci/rpc/network';

    try {
      final response = await _dio.post(
        url,
        data: {
          "id": 3,
          "method": "get_all_interfaces_status",
          "params": []
        },
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_token'
          },
        ),
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
