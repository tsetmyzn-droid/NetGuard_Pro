# ⚙️ EXECUTION BLUEPRINT — NetGuard Pro

هذه هي الخطة التشغيلية النهائية لتحويل هيكل المشروع الحالي إلى تطبيق متكامل ومستقر.

---

## 1. 🎯 Current State (الوضع الحالي)
- **Engine:** الـ `NetGuardEngine` موجود ويدعم الـ Polling والـ Delta Calculation الأساسي.
- **Plugins:** ملف `OpenWrtPlugin` موجود ويرتبط بـ `OpenWrtClient`.
- **UI:** الـ `SystemStatusCard` و `DashboardScreen` تم تحديثهما لاستخدام الـ Engine.
- **Missing:** 
    - نظام الـ Persistent Session في OpenWrt (يحتاج لربط الـ Cookies).
    - تطبيق الـ Huawei Plugin الفعلي (حالياً Stub).
    - منطق الـ Smoothing والـ Error Handling المتقدم في المحرك.

---

## 2. 🧱 Execution Phases (مراحل التنفيذ)

### Phase 1 — Engine Hardening (تقوية المحرك)
- **الهدف:** جعل حساب السرعة مستقراً ومقاوماً للقيم الشاذة.
- **المهام:** 
    - إضافة الـ Smoothing Filter (0.7/0.3).
    - معالجة الـ Counter Reset في `NetGuardEngine`.

### Phase 2 — OpenWrt "Real" Integration
- **الهدف:** استقرار الجلسة والاتصال بـ LuCI.
- **المهام:** 
    - تحديث `OpenWrtClient` لدعم استخراج الـ Token من الـ Request الأول والحفاظ عليه.
    - إضافة `Interceptor` لتجديد الجلسة تلقائياً.

### Phase 3 — Huawei WE Plugin Implementation
- **الهدف:** دعم راوترات Huawei (WE).
- **المهام:** 
    - إنشاء `HuaweiClient` للتعامل مع بروتوكول المصادقة الخاص بهم.
    - تنفيذ الـ Endpoints: `traffic_statistics` و `device_signal`.

### Phase 4 — Logic-to-UI Synchronization
- **الهدف:** ربط كامل للـ Plugins مع الـ `RouterFactory`.
- **المهام:** 
    - تفعيل الـ `Auto-Discovery` الأولي عبر IP Gateway.

### Phase 5 — Logging & Diagnostics System
- **الهدف:** توفير سجلات تقنية مفصلة مع واجهة تصفية للمطور والمستخدم.
- **المهام:** 
    - إنشاء `lib/core/diagnostics/netguard_logger.dart`: نظام سجلات يدعم مستويات (INFO, WARN, ERROR).
    - تنفيذ واجهة "Log Viewer" في صفحة الإعدادات مع إمكانية التصفية والتخزين المحلي.

### Phase 6 — Intelligence & Connectivity Resilience
- **الهدف:** التعرف التلقائي ومعالجة الانقطاع.
- **المهام:** 
    - **Auto-Discovery:** تطوير `lib/core/network/discovery_service.dart` لفحص عناوين IP Gateway المعروفة واختبار الـ Endpoints.
    - **Offline Buffer:** تحديث المحرك لحفظ "آخر حالة مستقرة" (Last Known Good State) واستئناف الحساب التراكمي بدقة فور عودة الاتصال.

### Phase 7 — Efficiency & DevOps
- **الهدف:** أداء عالٍ ونشر تلقائي.
- **المهام:** 
    - **Memory Efficiency:** تطبيق `ListView.builder` لكل القوائم وإيقاف أي `Streams` أو `Timers` غير مرئية لمنع تسرب الذاكرة.
    - **CI/CD Build:** إعداد ملف `.github/workflows/build_apk.yml` لأتمتة بناء الـ APK وإرفاقه كـ Release عند كل Tag جديد.

---

## 3. 📁 File-Level Tasks (المهام على مستوى الملفات)

### `lib/core/engine/netguard_engine.dart`
- [ ] دمج منطق الـ Smoothing داخل وظيفة `_pollData`.
- [ ] إضافة `try-catch` محكم لكل دورة Polling لمنع توقف المحرك عند خطأ عابر.

### `lib/OpenWrt/OpenWrtClient.dart`
- [ ] تعديل الـ `Dio` لإضافة `CookieJar` (عبر مكتبة `dio_cookie_manager` إذا لزم الأمر أو يدوياً).
- [ ] إضافة Check لانتهاء الجلسة (Expiry) قبل إرسال الطلب.

### `lib/plugins/huawei/huawei_plugin.dart` (NEW)
- [ ] بناء هيكل الـ Plugin المتوافق مع `RouterPlugin`.
- [ ] تنفيذ الـ XML Parsing لردود الراوتر.

### `lib/core/diagnostics/netguard_logger.dart` (NEW)
- [ ] وظيفة `log(String msg, {LogLevel level})`.
- [ ] تخزين مؤقت (Buffer) لآخر 500 سطر في الذاكرة.

### `lib/core/network/discovery_service.dart` (NEW)
- [ ] آلية "Fingerprinting" للتعرف على نوع الراوتر عبر الـ HTTP Headers.

---

## 4. 🔄 Execution Order (ترتيب التنفيذ)
1. **Engine Fixes:** ضمان دقة البيانات أولاً.
2. **OpenWrt Polish:** استكمال النظام "الخاص" وجعله مرجعاً.
3. **Huawei Development:** التوسع لدعم السوق المحلي (WE).
4. **Final UI Clean-up:** تحسين الأداء البصري للجرافات.

---

## 5. ⚠️ Risk Points (نقاط المخاطرة)
- **Session Expiry:** قد تنهار الجرافات عند انتهاء الجلسة إذا لم يتم التجديد في خلفية المحرك (Background).
- **Memory Efficiency:** الـ Polling الطويل قد يراكم البيانات؛ سنستخدم تنظيفاً دورياً للـ Buffer.
- **Auto-Discovery Errors:** قد يخطئ النظام في التعرف على الراوتر؛ يجب توفير خيار يدوي دائماً.
- **Incompatible Models:** راوترات Huawei تختلف بروتوكولاتها حسب إصدار الفيرموير. سنركز على موديلات VDSL المنتشرة.
- **Battery Drain:** الـ Polling المستمر قد يستهلك البطارية؛ يجب التأكد من توقفه عند خروج التطبيق للخلفية.

---

## 6. 🧪 Verification Steps (خطوات التحقق)

بعد كل مهمة:
```bash
# 1. التحليل المكتبي
flutter analyze

# 2. فحص استهلاك الذاكرة
flutter run --track-widget-creation

# 3. التجربة الفعلية (Simulation)
flutter run
```
---
**الخطة جاهزة للتنفيذ الجراحي.**
