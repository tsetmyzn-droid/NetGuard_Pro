import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/router_plugin.dart';
import '../plugins/zte_plugin.dart';
import '../plugins/huawei_plugin.dart';
import '../plugins/tplink_plugin.dart';

class RouterRepositoryImpl {
  final List<RouterPlugin> _plugins = [
    ZteRouterPlugin(),
    HuaweiRouterPlugin(),
    TPLinkRouterPlugin(),
  ];

  RouterPlugin? _activePlugin;
  RouterPlugin? get activePlugin => _activePlugin;

  Future<void> login(String ip, String username, String password) async {
    // 1. Fingerprinting: Try to detect which router it is
    // This is a simplified version. Real version would try to GET the login page first.
    
    _activePlugin = null;
    
    // We try each plugin
    for (final plugin in _plugins) {
      try {
        await plugin.login(ip, password);
        _activePlugin = plugin;
        return; // Success
      } catch (e) {
        // Try next
        continue;
      }
    }
    
    throw Exception('لا يمكن الاتصال بالراوتر. تأكد من صحة IP وكلمة المرور ونوع الجهاز.');
  }

  Future<void> logout() async {
    _activePlugin = null;
  }
}

final routerRepositoryProvider = Provider((ref) => RouterRepositoryImpl());
