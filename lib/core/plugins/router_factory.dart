import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/plugins/huawei/huawei_plugin.dart';
import 'package:netguard_pro/plugins/zte/zte_plugin.dart';
import 'package:netguard_pro/plugins/tplink/tplink_plugin.dart';
import 'package:netguard_pro/plugins/openwrt/openwrt_plugin.dart';
import 'package:netguard_pro/core/network/router_types.dart';

class RouterFactory {
  /// جلب الإضافة بناءً على النوع (Enum)
  static RouterPlugin? createByTypes(RouterType type, String ip) {
    switch (type) {
      case RouterType.openwrt:
        return OpenWrtPlugin(ip);
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
  static RouterPlugin? getPluginFor(String ip, String probeResult) {
    final identity = probeResult.toLowerCase();
    
    if (identity.contains("openwrt") || identity.contains("luci")) {
      return createByTypes(RouterType.openwrt, ip);
    } else if (identity.contains("huawei") || identity.contains("hilink")) {
      return createByTypes(RouterType.huawei, ip);
    } else if (identity.contains("zte")) {
      return createByTypes(RouterType.zte, ip);
    } else if (identity.contains("tp-link") || identity.contains("tplink")) {
      return createByTypes(RouterType.tplink, ip);
    }
    
    return null;
  }
}
