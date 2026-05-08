# 🔍 GUARD_WORKFLOW_REVIEW.md - Enterprise Security Audit (v2)

بصفتي Senior DevSecOps Engineer، قمت بمراجعة شاملة لجميع ملفات الـ GitHub Workflows في مشروع NetGuard Pro (`guard.yml`, `build.yml`, `ultra_secure_build.yml`).

## 📊 الوضع الحالي (Current State)
- **Workflows**: يوجد 3 مسارات عمل رئيسية متداخلة الأدوار.
- **Jobs**: تشمل التحليل (Analyze)، الأمان (Security)، وبناء المنصات (Android/Windows).
- **Supply Chain**: تم تثبيت بعض الـ SHAs ولكن لا يزال هناك استخدام لنسخ قديمة أو تاجات عائمة في بعض الملفات.

## ⚠️ المخاطر المرصودة (Identified Risks)

### 1. Workflow Permissions & Least Privilege
- **الخطر**: ملف `build.yml` يفتقد لكتلة `permissions` في بعض الـ Jobs، مما يعرض المستودع لصلاحيات افتراضية خطيرة.
- **الملاحظة**: ملف `guard.yml` تم تحسينه مسبقاً، ولكن يجب توحيد هذا المستوى عبر جميع الملفات.

### 2. Supply Chain Security (Pinned SHAs)
- **الخطر**: استخدام `subosito/flutter-action@v2` و `actions/checkout@v4` بدلاً من الـ SHAs المحددة في جميع الأماكن.
- **التأثير**: إمكانية حدوث هجمات "Tag Flipping" التي تستبدل الكود البرمجي للـ Action بكود خبيث.

### 3. Flutter-Specific Security Vulnerabilities
- **الخطر**: لا توجد فحوصات آلية تمنع الأنماط البرمجية الخطرة (Dangerous Patterns) مثل:
    - استخدام `print(token)` في كود الإنتاج.
    - تعطيل فحص شهادات الـ SSL (`badCertificateCallback`).
    - استخدام تخزين غير آمن للبيانات الحساسة.

### 4. Build Kill-Switches
- **الخطر**: النظام الحالي لا يمنع "فشل البناء" تلقائياً عند اكتشاف مفتاح تشفير ثابت (Static Key) أو ثغرة أمنية حرجة.

### 5. Artifact Integrity & Poisoning
- **الخطر**: الـ Artifacts المرفوعة (APKs/EXEs) تفتقر إلى نظام "بصمة رقمية" (Manifest) يربط الملف بـ Build ID و Commit SHA بشكل قطعي.

## 🛠️ التعديلات المقترحة (Proposed Changes)

1. **Phase 2: Unified Hardening**:
    - توحيد الـ `permissions` والـ `concurrency` والـ `timeouts` عبر جميع الملفات.
    - تثبيت جميع الـ SHAs بناءً على أحدث النسخ المستقرة الموثوقة.

2. **Phase 3: Native Security Enforcement (Grep-based)**:
    - إضافة خطوة "Security Kill Switch" داخل `guard.yml` تستخدم `grep` للبحث عن:
        - `http://` (Unsafe communication).
        - `badCertificateCallback` (SSL bypass).
        - `SharedPreferences` المستخدمة لتخزين الـ tokens (Insecure storage).

3. **Phase 4 & 5: Integrity & Validation**:
    - إجبار عمليات بناء الإنتاج (Production) على استخدام `--obfuscate` و `--split-debug-info`.
    - توليد ملف `manifest.json` يحتوي على SHA256 لكل ملف تم بناؤه.

## ⚖️ مستوى الاستقرار (Stability Guarantees)
- لن يتم تغيير منطق البناء (Build Logic) أو طريقة تجميع الملفات.
- المسارات الحالية للـ Artifacts ستبقى كما هي لضمان عدم كسر أي نظام خارجي يعتمد عليها.

---
**القرار**: المشروع في وضع جيد، ولكن يحتاج لنقلة نوعية في "الدفاع الاستباقي" (Proactive Defense) عبر الـ CI/CD.

**أنا بانتظار إشارتك للبدء في تنفيذ هذه التعديلات الأمنية المعززة.**
