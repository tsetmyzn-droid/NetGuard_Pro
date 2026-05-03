import 'package:dio/dio.dart';
import 'package:xml/xml.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';
import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/OpenWrt/Model/ConnectedDevice.dart';
import 'package:netguard_pro/OpenWrt/Model/InterfaceStatus.dart';
import 'model/huawei_status.dart';

class HuaweiPlugin extends RouterPlugin {
  final Dio _dio = Dio();
  final NetGuardLogger _logger = NetGuardLogger();
  
  String? _sessionId;
  String? _requestToken;
  late String _baseUrl;

  HuaweiPlugin(String ip) : super(ip: ip, modelName: "Huawei HiLink") {
    // Phase 4: Network Hardening
    _dio.options.connectTimeout = const Duration(seconds: 5);
    _dio.options.receiveTimeout = const Duration(seconds: 10);
    _dio.options.validateStatus = (status) => status != null && status < 500;
    
    // Phase 4: Retry Interceptor
    _dio.interceptors.add(InterceptorsWrapper(
      onError: (DioException e, handler) async {
        int retryCount = e.requestOptions.extra['retryCount'] ?? 0;
        if (retryCount < 2 && (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout)) {
          retryCount++;
          e.requestOptions.extra['retryCount'] = retryCount;
          await Future.delayed(Duration(seconds: retryCount * 2));
          final response = await _dio.fetch(e.requestOptions);
          return handler.resolve(response);
        }
        return handler.next(e);
      },
    ));

    // Preference for HTTPS
    if (ip.startsWith('http')) {
      _baseUrl = ip;
    } else {
      _baseUrl = 'https://$ip';
    }
  }

  @override
  void setBaseUrl(String url) {
    if (url.startsWith('http')) {
      _baseUrl = url;
    } else {
      _baseUrl = 'https://$url';
    }
  }

  String get _fullBaseUrl => _baseUrl;

  /// Phase 2: Session & Token Acquisition
  Future<bool> _refreshTokens({bool retryWithHttp = true}) async {
    try {
      final response = await _dio.get('$_fullBaseUrl/api/webserver/SesTokInfo');
      if (response.statusCode == 200) {
        final document = XmlDocument.parse(response.data);
        _sessionId = document.findAllElements('SesInfo').first.innerText;
        _requestToken = document.findAllElements('TokInfo').first.innerText;
        
        // Update Dio headers for subsequent requests
        _dio.options.headers['Cookie'] = _sessionId;
        _dio.options.headers['__RequestVerificationToken'] = _requestToken;
        
        return true;
      }
    } catch (e) {
      if (retryWithHttp && _fullBaseUrl.startsWith('https://')) {
        _logger.warn("Huawei Plugin: HTTPS failed, falling back to HTTP...");
        _baseUrl = _baseUrl.replaceFirst('https://', 'http://');
        return _refreshTokens(retryWithHttp: false);
      }
      _logger.error("Huawei Plugin: Failed to get SesTokInfo: $e");
    }
    return false;
  }

  @override
  Future<bool> login(String username, String password) async {
    await _refreshTokens();
    _logger.info("Huawei Plugin: Session initialized at $ip");
    return true; 
  }

  @override
  Future<List<InterfaceStatus>> getTrafficStats() async {
    try {
      final response = await _dio.get('$_fullBaseUrl/api/monitoring/status');
      if (response.statusCode == 200) {
        final document = XmlDocument.parse(response.data);
        
        int totalDown = int.tryParse(document.findAllElements('TotalDownload').first.innerText) ?? 0;
        int totalUp = int.tryParse(document.findAllElements('TotalUpload').first.innerText) ?? 0;

        // Map to a single virtual interface called 'wan' for Huawei
        return [
          InterfaceStatus(
            name: "wan",
            up: true,
            rxBytes: totalDown,
            txBytes: totalUp,
          )
        ];
      }
      
      if (response.statusCode == 403) {
        await _refreshTokens();
      }
    } catch (e) {
      _logger.error("Huawei Plugin: Traffic poll failed: $e");
    }
    return [];
  }

  @override
  Future<List<ConnectedDevice>> getConnectedDevices() async {
    try {
      final response = await _dio.get('$_fullBaseUrl/api/host/host-list');
      if (response.statusCode == 200) {
        final document = XmlDocument.parse(response.data);
        final hosts = document.findAllElements('Host');
        
        return hosts.map((node) {
          return ConnectedDevice(
            hostname: node.findElements('HostName').first.innerText,
            ipAddress: node.findElements('IpAddress').first.innerText,
            macAddress: node.findElements('MacAddress').first.innerText,
          );
        }).toList();
      }
    } catch (e) {
      _logger.error("Huawei Plugin: Device list poll failed: $e");
    }
    return [];
  }

  @override
  Future<bool> setBlockState(String mac, bool block) async {
    return false;
  }

  @override
  Future<bool> updateWifiSettings(String ssid, String password) async {
    return false;
  }

  @override
  bool canHandle(String identity) {
    return identity.toLowerCase().contains("huawei") || identity.toLowerCase().contains("hilink");
  }

  @override
  Future<void> logout() async {
    _sessionId = null;
    _requestToken = null;
  }
}
