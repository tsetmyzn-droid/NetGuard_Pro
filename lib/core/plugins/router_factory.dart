import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/plugins/huawei/huawei_plugin.dart';
import 'package:netguard_pro/plugins/zte/zte_plugin.dart';

class RouterFactory {
  /// يكتشف نوع الراوتر بناءً على رد البوابة الافتراضية
  static RouterPlugin? getPluginFor(String ip, String probeResult) {
    // محاكاة منطق الفرز (Fingerprinting)
    final identity = probeResult.toLowerCase();
    
    if (identity.contains("huawei")) {
      return HuaweiPlugin(ip);
    } else if (identity.contains("zte")) {
      return ZTEPlugin(ip);
    }
    
    // إذا لم يتضح النوع، نستخدم Huawei كافتراضي أو نطلب تحديد يدوي
    return HuaweiPlugin(ip);
  }
}
