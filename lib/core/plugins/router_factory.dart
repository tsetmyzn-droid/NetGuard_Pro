import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/plugins/huawei/huawei_plugin.dart';
import 'package:netguard_pro/plugins/zte/zte_plugin.dart';
import 'package:netguard_pro/plugins/tplink/tplink_plugin.dart';
import 'package:netguard_pro/plugins/openwrt/openwrt_plugin.dart';
import 'package:netguard_pro/core/network/router_types.dart';
import 'package:netguard_pro/core/engine/persistence_manager.dart';

class RouterFactory {
  /// جلب الإضافة بناءً على النوع (Enum)
  static Future<RouterPlugin?> createByTypes(RouterType type, String ip) async {
    final agentKey = await PersistenceManager().getAgentKey(ip);
    switch (type) {
      case RouterType.openwrt:
        return OpenWrtPlugin(ip, agentKey: agentKey);
      case RouterType.huawei:
        return HuaweiPlugin(ip);
      case RouterType.zte:
        return ZTEPlugin(ip);
      case RouterType.tplink:
        return TPLinkPlugin(ip);
      case RouterType.unknown:
      default:
        return null;
    }
  }

  /// يكتشف نوع الراوتر بناءً على الهوية النصية (Identity String)
  static Future<RouterPlugin?> getPluginFor(String ip, String probeResult) async {
    final identity = probeResult.toLowerCase();
    
    if (identity.contains("openwrt") || identity.contains("luci")) {
      return await createByTypes(RouterType.openwrt, ip);
    } else if (identity.contains("huawei") || identity.contains("hilink")) {
      return await createByTypes(RouterType.huawei, ip);
    } else if (identity.contains("zte")) {
      return await createByTypes(RouterType.zte, ip);
    } else if (identity.contains("tp-link") || identity.contains("tplink")) {
      return await createByTypes(RouterType.tplink, ip);
    }
    return null;
  }

  /// إنشاء إضافة راوتر جديدة (يدوي)
  static Future<RouterPlugin> create(String ip, String username, String password) async {
    final agentKey = await PersistenceManager().getAgentKey(ip);
    final plugin = OpenWrtPlugin(ip, agentKey: agentKey);
    await plugin.login(username, password);
    return plugin;
  }
}
