import '../../core/services/credential_service.dart';
import '../models/router_model.dart';
import '../plugins/base_router_plugin.dart';
import '../plugins/zte_router_plugin.dart';
import '../plugins/huawei_router_plugin.dart';
import '../plugins/tp_link_router_plugin.dart';
import '../plugins/python_engine_plugin.dart';

class AuthRepository {
  final SecureCredentialService _secureService = SecureCredentialService();
  
  // قاموس الإضافات المدعومة
  final Map<RouterType, BaseRouterPlugin> _plugins = {
    RouterType.zte: ZteRouterPlugin(),
    RouterType.huawei: HuaweiRouterPlugin(),
    RouterType.tplink: TPLinkRouterPlugin(),
    RouterType.python: PythonEnginePlugin(),
  };

  BaseRouterPlugin? _activePlugin;

  Future<bool> login(String ip, String password, RouterType type) async {
    try {
      final plugin = _plugins[type];
      if (plugin == null) return false;

      final success = await plugin.login(ip, password);
      
      if (success) {
        _activePlugin = plugin;
        // حفظ الأسرار بشكل آمن في مخزن النظام
        await _secureService.saveCredentials(ip, password);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<RouterModel?> getCurrentSession() async {
    final ip = _secureService.getLastIp();
    if (ip == null) return null;

    final password = await _secureService.getPassword(ip);
    
    // سنفترض Python كنوع افتراضي حالياً لاختبار الجلسة
    final auth = RouterModel(
      ip: ip,
      password: password ?? '',
      type: RouterType.python,
      isConnected: true,
    );
    
    // تفعيل الـ Plugin تلقائياً للجلسة المستعادة
    _activePlugin = _plugins[RouterType.python];
    await _activePlugin?.login(ip, password ?? '');
    
    return auth;
  }

  BaseRouterPlugin? get activePlugin => _activePlugin;
}
