# 🛡️ دستور تطوير NetGuard Pro Native (Flutter) — نسخة تنفيذية محسّنة

**الإصدار:** 2.0.0
**الحالة:** جاهز للتنفيذ الفعلي
**الهدف:** بناء تطبيق Native مستقر وآمن لإدارة الراوترات مع دعم واقعي ومتدرج للأجهزة.

---

# ⚠️ مبدأ أساسي قبل البدء
هذا المشروع **لن يدعم كل الراوترات دفعة واحدة**.
سيتم التنفيذ وفق استراتيجية: **دعم تدريجي (Router-by-Router Strategy)**.

---

# 1. 🧱 المعمارية (Architecture)
## النمط المعتمد:
Clean Architecture + Feature-Based Structure

## التقسيم:
### Data Layer
* RouterClient (HTTP)
* RouterSSHClient (اختياري)
* Parsers لكل نوع راوتر (Plugin System)
* Session Manager (Cookies / Tokens)

### Domain Layer
* Entities (Router, Device, TrafficData)
* UseCases (Login, FetchDevices, BlockDevice, MonitorTraffic)

### Presentation Layer
* Flutter UI (Separated from Logic)
* Providers (Riverpod)

---

# 2. 🌐 دعم الراوترات (الاستراتيجية المكوناتية)
## ❗ القاعدة الأساسية:
كل راوتر = Plugin مستقل يوفر:
* login()
* fetchDevices()
* blockDevice()
* fetchTraffic()

## المرحلة الأولى:
دعم (Huawei, ZTE, TP-Link) بناءً على عكس هندسة الواجهة (Reverse Engineering).

---

# 3. 🔐 إدارة الجلسات والأمان
* **Cookie persistence**: إدارة الكوكيز لكل جلسة بشكل مستقل.
* **التخزين الآمن**: استخدام `flutter_secure_storage` لكلمات المرور ومفاتيح التشفير.
* **التخزين العام**: استخدام `Hive` للبيانات غير الحساسة.
* **الشبكة**: العمل داخل LAN وتنبيه المستخدم بخصوص شهادات SSL الموقعة ذاتياً.

---

# 4. 🧠 تحليل البيانات (Parsing)
* الاعتماد على `RegExp` و `HTML Parsing` لتحويل ردود الراوتر إلى Models برمجية.
* فصل منطق التحليل عن منطق الاتصال.

---

# 5. 🚀 مراحل التنفيذ (Roadmap)
1. **المرحلة 1: الأساس**: إعداد الهيكل، التخزين الآمن، الـ RouterClient الموحد. (✅ مكتملة)
2. **المرحلة 2: دعم الراوترات**: تنفيذ Plugins لـ (ZTE, Huawei, TP-Link). (✅ مكتملة)
3. **المرحلة 3: التحكم والمراقبة**: بناء واجهة الـ Dashboard وتفعيل وظيفة الحظر. (✅ مكتملة)
4. **المرحلة 4: التحصين والجماليات**: إضافة أنيميشن، تحسين الأداء، واختبار الأمان. (✅ مكتملة بنسبة 95%)
5. **المرحلة 5: سجلات الأمان المتقدمة**: ربط الـ Audit Trail والمراقبة العميقة. (🚧 قيد التنفيذ)

---

**إقرار:**
ألتزم بصفتي المعماري المسؤول بتقديم كود Modular، حيث الـ UI منفصل تماماً عن Logic، مع الالتزام الصارم بمعايير الأمان والأداء المذكورة.
