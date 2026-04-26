import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/plugins/huawei/huawei_plugin.dart';
import 'package:netguard_pro/plugins/zte/zte_plugin.dart';
import 'package:netguard_pro/plugins/tplink/tplink_plugin.dart';
import 'package:netguard_pro/plugins/openwrt/openwrt_plugin.dart';

class RouterFactory {
  /// يكتشف نوع الراوتر بناءً على رد البوابة الافتراضية
  static RouterPlugin? getPluginFor(String ip, String probeResult) {
    // محاكاة منطق الفرز (Fingerprinting)
    final identity = probeResult.toLowerCase();
    
    if (identity.contains("openwrt") || identity.contains("luci")) {
      return OpenWrtPlugin(ip);
    } else if (identity.contains("huawei")) {
      return HuaweiPlugin(ip);
    } else if (identity.contains("zte")) {
      return ZTEPlugin(ip);
    } else if (identity.contains("tp-link") || identity.contains("tplink")) {
      return TPLinkPlugin(ip);
    }
    
    // إذا لم يتضح النوع، نرجع OpenWrt كونه النظام "الخاص" والأكثر مرونة
    return OpenWrtPlugin(ip);
  }
}
