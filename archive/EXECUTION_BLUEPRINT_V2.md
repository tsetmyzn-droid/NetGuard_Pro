# ⚙️ EXECUTION BLUEPRINT V2 — NetGuard Pro

هذه هي النسخة المطورة والنهائية لخطة التنفيذ، تركز على الاستقرار، الأمان، والاحترافية التقنية عبر تحسين تدريجي للنظام الحالي.

---

## 1. 🎯 Current State (الوضع الواقعي)
- **Engine:** يعمل بنظام Polling أساسي وحساب Delta. يحتاج لإضافة (Smoothing & Spike Rejection).
- **Plugins:** الـ OpenWrt Plugin يعمل لكنه يفتقر لإدارة الجلسات الطويلة (Persistent Sessions).
- **Logging/Crash:** لا يوجد نظام مركزي للسجلات أو معالجة الانهيارات الشاملة.
- **CI/CD:** غير موجود حالياً.

---

## 2. 🧱 Fixed Architecture (بنية مستقرة)
- **Core Engine:** سيبقى المحرك مركزياً لكن سيتم تدعيم منطق المعالجة الرياضية فيه.
- **Diagnostics Layer:** طبقة جديدة للـ Logging والـ Error Handling تلتف حول كل العمليات.
- **Security Context:** فصل مفاتيح التوثيق والـ Tokens في طبقة آمنة داخل الـ Plugin.

---

## 3. 🚀 Execution Phases (المراحل المحسّنة)

### Phase 1 — Resilience & Diagnostics (الاستقرار والتشخيص)
- **الهدف:** بناء "شبكة الأمان" قبل التوسع.
- **المهام:** 
    - إنشاء `NetGuardLogger` (INFO, WARN, ERROR) مع Memory Buffer و **File Persistence** (المسار: `/logs/netguard.log`).
    - تنفيذ **Global Crash Handler**: عند الانهيار يتم (إيقاف المحرك آمن - حفظ السجلات فوراً - عرض شاشة "حدث خطأ - يرجى إرسال السجلات").

### Phase 2 — Engine & Router Realities
- **الهدف:** دقة بيانات تحت أصعب الظروف.
- **المهام:** 
    - إضافة **Smoothing Filter** و **Spike Rejection** للمحرك.
    - تنفيذ **Auto Re-login** في `OpenWrtClient` عند انتهاء الجلسة.
    - تطوير **Offline Buffer** (تخزين محلي عبر Local File) لحفظ البيانات التراكمية واسترجاعها بدقة فور عودة الاتصال.

### Phase 3 — Local Router Expansion (Huawei/WE)
- **الهدف:** دعم السوق المحلي ببروتوكول مستقر.
- **المهام:** 
    - بناء `HuaweiPlugin`:
        - **Login Endpoint:** `/api/user/login`.
        - **Session Handling:** استخراج `SessionID` و `VerificationToken` من الـ Headers.
        - **Mandatory Headers:** `__RequestVerificationToken` لضمان قبول الطلبات.

### Phase 4 — Connectivity Intelligence
- **الهدف:** التعرف التلقائي والعمل بدون إنترنت.
- **المهام:** 
    - تنفيذ **Offline Mode Buffer** (حفظ الحساب التراكمي عند فقدان الاتصال بالراوتر).
    - تطوير **Auto-Discovery Service** لفحص الـ Gateway.

### Phase 5 — Secure DevOps & Build (CI/CD)
- **الهدف:** أتمتة النشر بأمان عالي.
- **Gate (شرط التنفيذ):** لا يبدأ CI/CD إلا بعد نجاح المرحلة 1 و 2، والتأكد من `flutter analyze` بدون أي أخطاء.
- **المهام:** 
    - برمجية GitHub Actions لبناء APK/EXE وتوقيعها برمجياً.

### Phase 6 — Independent Speed Test System
- **الهدف:** توفير أداة قياس سرعة ذكية ومستقلة.
- **المهام:** 
    - استخدام `FlutterInternetSpeedTest` كحل أساسي.
    - تنفيذ **M-Lab Fallback** للتحميل عبر HTTP عند فشل الأداة الأساسية.
    - ضمان استقلالية النظام تماماً عن `NetGuardEngine`.

---

## 4. 📁 File-Level Tasks (المهام التفصيلية)

### `lib/core/diagnostics/netguard_logger.dart` (NEW)
- [ ] تنفيذ Class يدعم التخزين المؤقت (Last 500 lines) والحفظ التلقائي في `netguard.log`.
- [ ] إضافة آلية Log Rotation لمنع تضخم حجم الملف.

### `lib/core/engine/netguard_engine.dart`
- [ ] دمج `_smoothSpeed(double newValue)` لتقليل تذبذب البيانات.
- [ ] إضافة Check: `if (delta < 0) => restartCounter`.

### `lib/main.dart`
- [ ] إضافة `FlutterError.onError` لتحويل الانهيارات إلى سجلات Log بدلاً من Crash.

### `lib/features/speed_test/speed_test_manager.dart` (NEW)
- [ ] تنفيذ `SpeedTestManager` مع منطق الـ Fallback الذكي.
- [ ] التأكد من وجود Timeout (15 ثانية) ومنع التكرار العشوائي.

---

## 5. 🛡️ Security Layer
- **Secrets:** سيتم استخدام `.env` أو `dart-define` لإدارة متغيرات التطوير.
- **Bypass:** تجاهل الشهادات (Self-signed) سيتم حصره فقط داخل الـ Router Clients وليس كاملاً.

---

## 6. 🔄 Execution Order (نظام العمل الصارم)
1. **Diagnostics First (Phase 1)** -> لبناء أساس التصحيح.
2. **Engine Hardening (Phase 2)** -> لضمان جودة العلميات الرياضية.
3. **Router Plugins (Phase 3)** -> للتوسع الأفقي.
4. **Speed Test (Phase 6)** -> ميزة إضافية مستقلة.
5. **DevOps (Phase 5)** -> كخطوة نهائية للاستقرار.

---

## 7. 🎯 First Execution Task
1. إنشاء `NetGuardLogger` يدعم الذاكرة والملف.
2. اختبار نظام التسجيل بشكل "رأس خفي" (Headless) للتأكد من استقرار الكتابة قبل ربطه بالواجهة.

---

## 8. ⚠️ Risk Control System
- **Memory Leak:** سيتم فحص الـ Logger للتأكد من عدم تجاوزه للحد الأقصى للذاكرة.
- **Speed Test Isolation:** عزل كامل لنظام اختبار السرعة في Sandbox تقني لضمان عدم تأثيره على استقرار التطبيق أو استهلاك الذاكرة الأساسي.
- **Auth Loops:** وضع حد أقصى (3 محاولات) للـ Auto Re-login لتجنب الدوران اللانهائي عند خطأ في كلمة السر.

---
**تمت إعادة بناء الخطة بناءً على تحسين تدريجي، بدون هدم النظام، مع دمج الأمان وCI/CD بشكل منفصل وآمن، وجاهزة للتنفيذ المرحلي.**

**تم تحسين الخطة بإضافة النواقص بدون تغيير بنيتها الأساسية.**

**تم تنفيذ نظام اختبار السرعة كميزة مستقلة مع fallback ذكي دون التأثير على محرك الحساب الأساسي.**
