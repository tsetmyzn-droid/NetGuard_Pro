# 🛡️ PROJECT MASTER PLAN — NetGuard Pro

هذا الملف هو المرجع النهائي والشامل لتنفيذ مشروع **NetGuard Pro**. يجمع بين الرؤية التقنية، خطة التنفيذ، ومعايير الجودة والأمان المعتمدة.

---

## 🏛️ Architecture Summary (بنية النظام)

يعتمد التطبيق على معمارية الطبقات المنفصلة لضمان الاستقرار والقابلية للتوسع:
1. **Engine Layer:** محرك معالجة البيانات المركزية (Smoothing, Delta, Logic).
2. **Plugin Layer:** واجهات برمجية مستقلة لكل نوع راوتر (OpenWrt, Huawei, etc).
3. **Diagnostics Layer:** نظام تسجيل أخطاء (Logging) يعمل في Isolate منفصل.
4. **UI Layer:** واجهة مستخدم مبنية على فلاتر (ConsumerWidgets) لضمان التحديث اللحظي.

---

## 🚀 Execution Phases (مراحل التنفيذ)

### Phase 1: Resilience & Diagnostics (الأساس المتين)
**الهدف:** بناء نظام تتبع أخطاء لا ينهار.
- **تأسيس المحرك التشخيصي:** إنشاء نظام `NetGuardLogger`.
  - **الملف:** `lib/core/diagnostics/netguard_logger.dart`
  - **الميزات:** مستويات (INFO, WARN, ERROR)، تخزين آمن لآخر 500 سطر، تدوير تلقائي (Log Rotation) عند وصول الملف لـ 5MB (بحد أقصى 3 ملفات).
- **حماية الانهيار:** ربط `Global Crash Handler`.
  - **الملف:** `lib/main.dart`
  - **الميزات:** اعتراض `ZoneErrors` وإيقاف المحرك بسلام مع عرض شاشة خطأ للمستخدم.

### Phase 2: Engine Hardening (المحرك الرياضي)
**الهدف:** دقة بيانات استثنائية.
- **تطوير المحرك:** تحسين `NetGuardEngine`.
  - **الملف:** `lib/core/engine/netguard_engine.dart`
  - **الميزات:** فلاتر `Smoothing` (0.7/0.3)، تجاهل القفزات الشاذة (Spike Rejection)، تخزين حالة التراكم (Offline Buffer) في ملف JSON مع التثبت من سلامته (Integrity Check).

### Phase 3: Router Plugins (محركات الراوترات)
**الهدف:** دعم شامل ومستقر.
- **OpenWrt Client:** تحديث `OpenWrtClient`.
  - **المسار:** `lib/OpenWrt/OpenWrtClient.dart`
  - **الميزات:** إدارة الجلسات المستمرة (Persistent Cookies)، تجديد التوكن تلقائياً.
- **Huawei Plugin:** تنفيذ `HuaweiPlugin`.
  - **الملف:** `lib/plugins/huawei/huawei_plugin.dart`
  - **الميزات:** التعرف التلقائي على الموديلات (Model ID)، استخراج الـ Credentials والـ Tokens من الـ XML Headers.

### Phase 4: Connectivity Intelligence (الذكاء والربط)
**الهدف:** سهولة الوصول.
- **خدمة الاكتشاف:** إنشاء `DiscoveryService`.
  - **الملف:** `lib/core/network/discovery_service.dart`
  - **الميزات:** فحص الـ Gateway و Fingerprinting لنوع الجهاز أوتوماتيكياً.

### Phase 5: Speed Test (ميزة مستقلة)
**الهدف:** قياس السرعة دون التأثير على النظام الأساسي.
- **مدير اختبار السرعة:** `SpeedTestManager`.
  - **الملف:** `lib/features/speed_test/speed_test_manager.dart`
  - **الميزات:** استخدام `compute()` لعزل العمليات، نظام Fallback إلى M-Lab عند فشل المزود الأساسي.

---

## 🎯 First Execution Task (المهمة الأولى)
**بناء نظام السجلات (The Logger):**
1. إنشاء `lib/core/diagnostics/netguard_logger.dart`.
2. ربط الذاكرة (Memory Buffer) والملف (File Sink).
3. اختبار النظام بشكل Headless (بدون واجهة) للتأكد من استقرار الكتابة تحت الضغط العالي.

---

## 🔮 Future Enhancements (مستقبل المشروع)
- **Auto Update:** نظام تحديث الأجهزة من داخل التطبيق.
- **Data Migration:** نقل سجلات الاستهلاك بين الأجهزة.
- **i18n:** دعم كامل للغة العربية والإنجليزية والفرنسية.
- **Performance Monitor:** لوحة تحكم داخلية لمراقبة استهلاك التطبيق للرام والمعالج.

---

## ⚠️ Strict Rules (القواعد الصارمة)
1. **No Web:** ممنوع إدخال أي تقنيات ويب أو Node.js في كود الـ Dart.
2. **Flutter Native:** الاعتماد الكلي على إمكانيات Flutter Native و Flutter Engine.
3. **Offline First:** التطبيق يعمل كلياً في الشبكة المحلية ولن يتم إرسال أي بيانات لخدمات سحابية.
4. **Resilience:** لا يتم البدء في ميزة بصرية جديدة قبل استقرار الميزة البرمجية التي تسبقها.

---
**تم توحيد جميع الخطط في ملف واحد وتنظيف المشروع مع الحفاظ على نسخة أرشيفية.**
