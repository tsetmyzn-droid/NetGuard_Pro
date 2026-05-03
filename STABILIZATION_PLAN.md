# 🛡️ NetGuard Pro — STABILIZATION & REFACTORING PLAN (v2)

هذه الخطة هي المرجع الأساسي لاستقرار وأمن وتطوير مشروع NetGuard Pro.

---

## ✅ المراحل المكتملة (Completed Phases)

### Phase 0: Cleanup & Refactoring [Completed]
- تم توحيد الـ Plugins في `lib/plugins/`.
- جعل `RouterFactory` هو المصنع الوحيد للإضافات.
- حذف الملفات الزائدة والمتعارضة.

### Phase 1: Critical Fixes [Completed]
- تأمين الـ Persistence باستخدام IV عشوائي وضمان التوافق مع النسخ الأقدم.
- ضبط محرك البيانات (NetGuard Engine) لمنع الـ Spikes الأولية.
- دعم كامل لـ (ZTE, TP-Link, Huawei, OpenWrt).

### Phase 2: Stability & Networking [Completed]
- إضافة Interceptor للتعامل مع انتهاء الجلسة (401) وإعادة تسجيل الدخول تلقائياً.
- تحسين اكتشاف الراوتر (Discovery Fallback IPs).
- تحسين أداء الـ Logger وتقليل استهلاك الذاكرة.

### Phase 3: UX & Stability [Completed]
- زيادة استقرار المحرك وحماية الـ Crash Loop (120s reset).
- تحسين الرسوم البيانية لتشمل 60 نقطة بيانات (دقيقة كاملة).
- تنفيذ زر الـ Reset الحقيقي في الإعدادات.

### Phase 4: Security Hardening [Completed]
- تشفير السجلات AES-256 (.nglog) وحماية البيانات الحساسة (Sanitization).
- إدارة المفاتيح عبر `flutter_secure_storage`.
- تفضيل HTTPS وتحصين اتصالات Dio (Timeouts & Retries).

### Phase 5: Intelligence & Observability [Completed]
- **الملخص:** إضافة طبقة الذكاء التشخيصي والمراقبة الذاتية.
- **التغييرات:**
    - `PerformanceMonitor`: تتبع زمن الـ Poll والأخطاء.
    - `DiagnosticsEngine`: تحليل المشاكل وتقديم أسباب مفهومة.
    - `Adaptive Engine`: تغيير تكرار الـ Poll تلقائياً (1s - 5s).
    - `Health Score`: تقييم صحة الشبكة (0-100%).

---

## 🚀 المراحل القادمة (Future Phases)

### 🔵 Phase 6 — Advanced Secure Logging System
1. **Sensitive Data Masking:** استخدام RegEx لإخفاء الـ Passwords والـ Tokens قبل الكتابة.
2. **Log Classification:** تقسيم السجلات إلى تصنيفات (system, network, security, engine, ui).
3. **Encrypted Log Storage:** تحصين التخزين لكل Batch باستخدام التشفير.
4. **Query System:** البحث في السجلات حسب النوع أو الوقت (In-memory).
5. **Crash Snapshot:** حفظ آخر 50 سجل عند حدوث Crash لسهولة التصحيح.
6. **Log Integrity:** استخدام SHA256 للتحقق من سلامة ملف السجلات.

### 🔵 Phase 7 — Enhanced Device Details (OpenWrt & HiLink)
1. توسيع `ConnectedDevice` ليشمل نوع الاتصال (Wired/Wireless) وقوة الإشارة (dBm).
2. تنفيذ `_getWirelessStations()` لجلب بيانات `iwinfo` (Wireless Stations).
3. دمج بيانات Wireless مع DHCP Leases لتحديد الحالات النشطة.
4. تحسين الـ UI لإظهار أيقونات الاتصال وقوة الإشارة.

### Phase 8: HTTPS & Certificates [Completed]
1. إنشاء `HttpClientManager` للتعامل مع شهادات SSL غير الموثوقة (BadCertificateCallback).
2. السماح للمستخدم بقبول البصمة (Fingerprint) للشهادة وحفظها في التخزين الآمن.
3. التبديل التلقائي من HTTP إلى HTTPS عند اكتشاف دعم الراوتر (Redirect 302).

### 🔵 Phase 9 — Engine Improvements
1. استخدام `Queue<double>` لتخزين السرعات (أداء أفضل O(1)).
2. إضافة `_maxSpeedThreshold` (Spike Rejection) لرفض القفزات الوهمية.
3. إمكانية اختيار الـ Interface المراد مراقبتها من الإعدادات (wlan0, eth0, etc).

### 🔵 Phase 10 — Multiple Router Profiles
1. دعم إضافة أكثر من راوتر (Profile System: IP, Name, Credentials).
2. تشفير كلمات مرور البروفايلات في `secure_storage`.
3. واجهة سهلة للتبديل السريع بين الراوترات.

### 🔵 Phase 11 — Device Caching
1. نظام Cache لقائمة الأجهزة (TTL = 30s) لتقليل طلبات الراوتر.
2. دعم Pull-to-refresh لتجاوز الـ Cache وتحميل بيانات طازجة.

---

## ⚠️ قواعد التطوير الصارمة
- كل مرحلة يجب أن لا تتجاوز 150 سطر تعديل.
- مراجعة أمان شاملة بعد كل خطوة.
- الحفاظ على التوافق مع الأنظمة السابقة (Backward Compatibility).
- عدم كسر أي ميزة حالية (No Breaking Changes).
