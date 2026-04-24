# 🛡️ دستور تطوير NetGuard Pro Native (Flutter) — نسخة تنفيذية صارمة (Production Blueprint)
**الإصدار:** 4.0.0  
**الحالة:** مرجع تنفيذ إلزامي  

---

# ⚠️ قواعد لا يتم كسرها
1. لا تضيف أي تقنية غير مذكورة هنا
2. لا تنفذ أي منطق خارج Plugin System
3. لا تستخدم Python داخل الموبايل
4. أي راوتر جديد = Plugin جديد فقط
5. **قاعدة الواجهة الموحدة:** عند إضافة أي ميزة (Feature)، يجب تحديث UI في التطبيق (`lib/`) والمعاينة (`index.html`) معاً.

---

# 🧱 هيكل المشروع (Folder Structure)

```
/lib
 ├── core/
 │   ├── network/
 │   │   ├── router_client.dart
 │   │   ├── cookie_store.dart
 │   │   └── dio_factory.dart
 │   ├── storage/
 │   │   ├── secure_storage.dart
 │   │   └── local_db.dart
 │   ├── utils/
 │   │   ├── logger.dart
 │   │   └── retry.dart
 │
 ├── features/
 │   ├── router/
 │   │   ├── domain/
 │   │   │   ├── entities/
 │   │   │   │   ├── device.dart
 │   │   │   │   ├── router.dart
 │   │   │   │   └── traffic.dart
 │   │   │   ├── usecases/
 │   │   │   │   ├── login.dart
 │   │   │   │   ├── fetch_devices.dart
 │   │   │   │   ├── block_device.dart
 │   │   │   │   └── fetch_traffic.dart
 │   │   │   └── router_plugin.dart
 │   │
 │   │   ├── data/
 │   │   │   ├── plugins/
 │   │   │   │   ├── huawei_plugin.dart
 │   │   │   │   ├── zte_plugin.dart
 │   │   │   │   └── tplink_plugin.dart
 │   │   │   ├── parsers/
 │   │   │   │   ├── huawei_parser.dart
 │   │   │   │   ├── zte_parser.dart
 │   │   │   │   └── tplink_parser.dart
 │   │   │   └── fingerprint.dart
 │   │
 │   │   ├── presentation/
 │   │   │   ├── providers/
 │   │   │   │   ├── router_provider.dart
 │   │   │   │   ├── device_provider.dart
 │   │   │   │   └── traffic_provider.dart
 │   │   │   └── screens/
 │   │   │       ├── dashboard_screen.dart
 │   │   │       ├── devices_screen.dart
 │   │   │       └── traffic_screen.dart
```

---

# 🔌 Router Plugin — مواصفات إلزامية

## الملف: router_plugin.dart
```dart
abstract class RouterPlugin {
  Future<void> login(String ip, String password);
  Future<List<Device>> fetchDevices();
  Future<void> blockDevice(String mac);
  Future<TrafficSample> fetchTraffic();
  bool canHandle(Map<String, dynamic> fingerprint);
}
```

---

# 📡 RouterClient — تنفيذ الشبكة

## الملف: router_client.dart
المسؤوليات:
- إرسال الطلبات
- إدارة headers
- إدارة cookies

الدوال:
```dart
Future<Response> get(String path);
Future<Response> post(String path, Map data);
```

---

# 🍪 Cookie Store

## الملف: cookie_store.dart
```dart
void saveCookies(String host, List<Cookie> cookies);
List<Cookie> loadCookies(String host);
```

---

# 🔍 Fingerprint System

## الملف: fingerprint.dart
```dart
Future<Map<String, dynamic>> detectRouter(String ip);
```

يجب أن:
- يرسل GET /
- يحلل headers + HTML

---

# 🔐 Secure Storage

## الملف: secure_storage.dart
```dart
Future<void> saveCredentials(String ip, String password);
Future<String?> getPassword(String ip);
```

---

# 🔁 Retry Logic

## الملف: retry.dart
```dart
Future<T> retry<T>(Future<T> Function() fn);
```

سياسة:
- 3 محاولات
- exponential backoff

---

# 🧠 Parser مثال

## الملف: huawei_parser.dart
```dart
List<Device> parseDevices(String html);
TrafficSample parseTraffic(String json);
```

---

# ⚙️ Provider مثال

## الملف: device_provider.dart
```dart
final deviceProvider = FutureProvider((ref) async {
  return ref.read(routerProvider).fetchDevices();
});
```

---

# 📊 Traffic Monitoring

## الملف: traffic_provider.dart
- Timer كل 3 ثواني
- حساب الفرق بين القيم

---

# 🚀 خطوات التنفيذ الدقيقة (Strict Steps)

## Step 1
- إنشاء المشروع
- إضافة Dio + Riverpod

## Step 2
- بناء RouterClient
- اختبار GET على الراوتر

## Step 3
- بناء Fingerprint
- طباعة نوع الراوتر

## Step 4
- إنشاء Huawei Plugin
- تنفيذ login فقط

## Step 5
- جلب الأجهزة
- عرضها في UI

## Step 6
- إضافة block device

## Step 7
- إضافة traffic monitor

## Step 8
- إضافة TP-Link

## Step 9
- إضافة ZTE

---

# ❌ ممنوعات
- لا تستخدم WebView
- لا تستخدم Root
- لا تستخدم Python
- لا تضيف Web Server

---

# ✅ معيار النجاح
- التطبيق يكتشف الراوتر
- يسجل الدخول
- يعرض الأجهزة
- يستطيع الحظر
- يعمل بدون crash

---

---

# 📦 توسيع النطاق وفق متطلبات NetGuard Pro (بدون كسر البنية)
> هذا القسم **إضافة إلزامية** تكمل البنية الحالية دون حذف أو تغيير شامل.

## 🎯 أهداف المنتج (Product Goals)
- حساب **الاستهلاك الكلي** من الراوتر بدقة عالية (من المصدر).
- حساب **استهلاك كل جهاز** (Per-Device) مع سجل زمني.
- **سرعة الإنترنت** (Download/Upload/Ping) مع حفظ النتائج.
- **التحكم في إعدادات الراوتر** (حظر/إلغاء حظر/إعادة تشغيل/SSID… حسب دعم الـ Plugin).
- **تخزين محلي مشفّر** لكل البيانات.
- دعم **Android / iOS / Windows** بنفس الكود (Flutter).

---

# 🧩 إضافة وحدات (Modules) — بدون تغيير الهيكل

## 1) 📊 Usage Module (الاستهلاك)
### الملفات:
```
/features/usage/
 ├── domain/
 │   ├── entities/
 │   │   ├── usage_sample.dart
 │   │   └── device_usage.dart
 │   ├── usecases/
 │   │   ├── collect_usage.dart
 │   │   └── aggregate_usage.dart
 │
 ├── data/
 │   ├── usage_repository_impl.dart
 │   └── mappers/
 │       └── usage_mapper.dart
 │
 ├── presentation/
 │   ├── providers/usage_provider.dart
 │   └── screens/usage_screen.dart
```

### التعاريف:
```dart
class UsageSample {
  final DateTime ts;
  final int rxBytes; // total download
  final int txBytes; // total upload
}

class DeviceUsage {
  final String mac;
  final int rxBytes;
  final int txBytes;
}
```

### UseCases:
- `collect_usage.dart`: يجلب القيم من الـ Plugin (إجمالي + لكل جهاز إن توفر).
- `aggregate_usage.dart`: يحسب الفروقات (delta) ويحوّلها إلى استهلاك زمني (ساعة/يوم).

### ملاحظات تنفيذ:
- الاعتماد على **polling كل 3–5 ثواني** (قابل للضبط).
- حفظ آخر قراءة لحساب delta.
- في حال عدم دعم الراوتر لاستهلاك الأجهزة: يتم عرض **إجمالي فقط**.

---

## 2) 🌐 Speed Test Module (اختبار السرعة)
### الملفات:
```
/features/speed/
 ├── domain/
 │   ├── entities/speed_result.dart
 │   └── usecases/run_speed_test.dart
 ├── data/speed_repository_impl.dart
 └── presentation/
     ├── providers/speed_provider.dart
     └── screens/speed_screen.dart
```

### التعاريف:
```dart
class SpeedResult {
  final double downloadMbps;
  final double uploadMbps;
  final int pingMs;
  final DateTime ts;
}
```

### التنفيذ:
- استخدام HTTP لقياس التحميل/الرفع (ملفات اختبار صغيرة/متوسطة).
- Ping عبر طلبات متكررة (approximation).
- حفظ النتائج محلياً.

---

## 3) ⚙️ Router Control Extensions (امتدادات التحكم)
> توسعة على `RouterPlugin` بدون كسر الواجهة.

### إضافة اختيارية للواجهة:
```dart
abstract class RouterControlExt {
  Future<void> reboot();
  Future<void> changeWifiName(String ssid);
  Future<void> changeWifiPassword(String password);
}
```

- يتم تطبيقها فقط في Plugins التي تدعم ذلك.
- فحص عبر `is RouterControlExt` قبل الاستخدام.

---

## 4) 💾 التخزين المحلي (Usage + Logs)
### تحديث `local_db.dart`:
- جداول/Collections:
  - `usage_samples`
  - `device_usage`
  - `speed_results`

### دوال مطلوبة:
```dart
Future<void> saveUsage(UsageSample s);
Future<List<UsageSample>> getUsageRange(DateTime from, DateTime to);

Future<void> saveSpeed(SpeedResult r);
Future<List<SpeedResult>> getAllSpeeds();
```

---

## 5) 📡 تكامل مع Plugins (إجباري)
> توسيع دون كسر:

### في `RouterPlugin` (إضافة اختيارية):
```dart
Future<UsageSample?> fetchTotalUsage();
Future<List<DeviceUsage>?> fetchDevicesUsage();
```

- لو غير مدعوم → يرجع `null`.
- يجب على الـ UseCase التعامل مع ذلك.

---

## 6) 🧠 Providers إضافية
- `usageProvider`: يجمع + يحسب + يبث البيانات.
- `speedProvider`: يدير اختبار السرعة.

---

## 7) 🖥️ دعم المنصات
- Flutter Desktop (Windows)
- Flutter Mobile (Android/iOS)
- لا يوجد اختلاف في المنطق — فقط UI adaptations.

---

## 8) 🔐 الأمان (تأكيد إضافي)
- كل البيانات الحساسة → `flutter_secure_storage`
- البيانات التاريخية → مشفرة اختيارياً داخل DB
- لا يتم إرسال أي بيانات خارج الجهاز

---

## 9) 📊 معايير الدقة
- الاعتماد على بيانات الراوتر = المصدر الأساسي
- في حال غياب بيانات per-device:
  - يتم توضيح ذلك في UI
- منع التقديرات الوهمية

---

## 10) ✅ معايير القبول (Acceptance Criteria)
- عرض الاستهلاك الكلي بدقة
- عرض استهلاك الأجهزة (إن توفر)
- اختبار سرعة يعمل ويحفظ النتائج
- التحكم في جهاز (حظر) يعمل
- لا يوجد crash في الاستخدام اليومي

---

---

# 🧾 إضافات وظيفية دقيقة (Feature Notes)
- **تحليل الاستهلاك حسب التطبيقات (إن توفر من الراوتر):** يدعم النظام عرض استهلاك البيانات لكل تطبيق عند توفره من واجهة الراوتر/الـ Plugin، وإلا يتم الإشارة بوضوح لعدم توفر هذه الميزة.
- **تصنيف التطبيق:** يندرج تحت فئة **Network Monitoring & Router Management**.
- **إحصائيات زمنية قياسية:**
  - يومي (اليوم الحالي)
  - أسبوعي (آخر 7 أيام)
  - شهري (من يوم 1 حتى آخر يوم في الشهر)
- **إحصائيات منفصلة:**
  - إحصائيات الراوتر (إجمالي الشبكة)
  - إحصائيات لكل جهاز (Per-Device)
- **شرط الاتصال:** جميع العمليات تعتمد على وجود اتصال مباشر بين جهاز المستخدم والراوتر عبر الشبكة المحلية (LAN) **حتى بدون توفر إنترنت**.

---

**إقرار:**
تمت إضافة هذه المتطلبات دون تعديل أو حذف في البنية الأساسية. أي تطوير لاحق يجب أن يلتزم بنفس المبدأ (الإضافة فقط دون كسر النظام).

