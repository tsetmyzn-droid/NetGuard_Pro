# ⚙️ EXECUTION BLUEPRINT FINAL — NetGuard Pro

هذه هي الوثيقة النهائية الموحدة والمصححة تقنياً، والتي تدمج المتطلبات الأساسية مع أفضل الممارسات الأمنية والبرمجية لضمان استقرار التطبيق في بيئة الإنتاج (Production-Ready).

---

## 1. 🎯 Current State (الواقع العملي)
- **Engine:** موجود كقاعدة برمجية، يحتاج لتدعيم المنطق الرياضي (Smoothing) ومعالجة الانقطاعات.
- **Plugins:** الـ OpenWrt Plugin يحتاج لنظام الجلسات المستمرة. الـ Huawei يحتاج لبناء كامل.
- **Support Systems:** نظام السجلات (Logging) ومعالجة الانهيارات (Crash Handling) هما الأولوية القصوى حالياً لتوفير بيئة تصحيح مستقرة.

---

## 2. 🧱 Core Architecture (البنية الموحدة)
- **Observer-Driven Engine:** محرك لا يقبل البيانات الخام، بل يعالجها عبر فلاترSmoothing وSpike Rejection.
- **Isolate-Based Logging:** نظام تسجيل بيانات "غير معطل" للواجهة، يعتمد على الكتابة المؤجلة (Buffered) في ملفات دورية.
- **Plugin Sandbox:** عزل منطق كل راوتر تماماً لضمان عدم تأثير فشل أحدهما على استقرار المحرك.

---

## 3. 🚀 Refined Execution Phases (المراحل التنفيذية)

### Phase 1 — Resilience & Diagnostics (شبكة الأمان)
- **الهدف:** استقرار "رادار" المطور قبل بدء العمليات الجراحية.
- **المهام:** 
    - **NetGuardLogger:** كتابة Buffers كل 2 ثانية لتقليل ضغط الـ I/O. (حجم الملف: 5MB، تدوير: 3 ملفات).
    - **Global Crash Handler:** معالجة الـ `ZoneErrors`.
    - **Crash Loop Protection:** حد أقصى 3 محاولات إعادة تشغيل في دقيقتين؛ بعدها يتم توجيه المستخدم لحذف الإعدادات أو إرسال السجلات.

### Phase 2 — Engine Hardening & Offline Resilience
- **الهدف:** دقة رياضية واستمرارية الحساب.
- **المهام:** 
    - **Smoothing Filter:** تطبيق معادلة (Current = 0.7*New + 0.3*Prev).
    - **Offline Buffer:** تخزين الحالة التراكمية في ملف JSON مشفر مع Checksum لضمان سلامة البيانات عند الاسترجاع.
    - **Spike Rejection:** تجاهل أي قفزة تتجاوز 400% من السرعة السابقة في دورة واحدة كقيمة شاذة.

### Phase 3 — Robust Router Plugins (OpenWrt & Huawei)
- **الهدف:** استقرار الدخول والاتصال.
- **المهام:** 
    - **OpenWrt:** ربط الـ CookieJar وتجديد الـ Token تلقائياً.
    - **Huawei:** تنفيذ الـ `Model Identification` عبر الـ HTTP Headers وحقن الـ `__RequestVerificationToken`.
    - **Failure UI:** إذا فشل الـ Auto Re-login لـ 3 مرات، يتم إظهار شاشة طلب كلمة السر يدوياً.

### Phase 4 — Connectivity Intelligence (Auto-Discovery)
- **الهدف:** تجربة مستخدم "بلمسة واحدة".
- **المهام:** 
    - **Discovery Service:** فحص الـ Gateway وتحليل الـ `Server` header للتعرف على نوع الراوتر (Fingerprinting).

### Phase 5 — Isolated Speed Test System
- **الهدف:** قياس سرعة لا يكسر التطبيق.
- **المهام:** 
    - تنفيذ `SpeedTestManager` داخل `compute()` أو `Isolate` لضمان عزل الذاكرة.
    - إضافة Timeout صارم (15 ثانية) ومراقبة استهلاك الرام أثناء الاختبار.

### Phase 6 — Secure CI/CD & Production Gate
- **الهدف:** نظام بناء آمن ومؤتمت.
- **Gate:** استخدام `flutter analyze --fatal-warnings`.
- **المهام:** أتمتة بناء APK/EXE مع إرفاق SHA256 كبصمة أمان للملفات.

---

## 4. 📁 File-Level Tasks (المهام على مستوى الملفات)

### `lib/core/diagnostics/netguard_logger.dart` (NEW)
- [ ] دعم مستويات: `INFO`, `WARN`, `ERROR`.
- [ ] نظام تدوير الملفات (Log Rotation) أوتوماتيكي.

### `lib/core/engine/netguard_engine.dart`
- [ ] دمج `OfflineIntegrityCheck` قبل تحميل البيانات السابقة.
- [ ] إضافة `onConnectionLost` callback لإخطار الـ UI فوراً.

### `lib/features/speed_test/speed_test_manager.dart`
- [ ] تنفيذ `runIsolatedTest()` باستخدام الـ Isolate API.

---

## 5. 🛡️ Security & Stability Logic
- **Data Integrity:** منع تحميل سجلات تالفة عبر التحقق من الـ JSON Schema عند البدء.
- **Resource Management:** إيقاف جميع الـ Timers والمحركات بمجرد خروج التطبيق للخلفية (Lifecycle Management).

---

## 6. 🎯 First Execution Task (المهمة الأولى)
1. بناء `NetGuardLogger` يدعم الذاكرة والملف بآلية الـ Rotation.
2. اختبار نظام التسجيل "بدون واجهة" (Headless Test) للتأكد من استقرار الكتابة والحفظ تحت ضغط الطلبات العالية.

---

## ⚠️ Risk Mitigation (إدارة المخاطر)
- **Persistence Failure:** إذا فشل كتابة الملف، سيتم الاعتماد على Memory Buffer فقط وإعلام المستخدم.
- **Plugin Mismatch:** في حال فشل التعرف التلقائي، يتم الانتقال تلقائياً للوضع اليدوي (Manual Configuration).

---
**تم دمج V1 و V2 وتقرير التحقق بالكامل، وأصبحت الخطة جاهزة للتنفيذ الفعلي بدون ثغرات حرجة.**

**تم تنفيذ نظام اختبار السرعة كميزة مستقلة مع fallback ذكي دون التأثير على محرك الحساب الأساسي.**
