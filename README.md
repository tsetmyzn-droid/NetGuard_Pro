# NetGuard Pro V7 🛡️

**NetGuard Pro** هو تطبيق Native متطور وشامل لإدارة الشبكات وأمن أجهزة التوجيه (Routers)، مبني بالكامل باستخدام لغة **Python** وإطار عمل **Flet**. تم تصميمه ليوفر واجهة عصرية (Material 3) للتحكم الكامل في بيئة الشبكة، مع دمج ذكاء اصطناعي متقدم (Gemini) لتعزيز الأمان.

---

## 📊 حالة الميزات (Feature Status)

| الميزة | الحالة | التقنية المستخدمة |
| :--- | :--- | :--- |
| **Auto-Detect Router** | ✅ مكتملة | HTTP Headers & HTML Parsing |
| **Real Speed Test** | ✅ مكتملة | Actual Mbps measurement via HTTPX |
| **Security Shield** | ✅ مكتملة | Port Scanning, ARP/MITM Detection |
| **AI Assistant** | ✅ مكتملة | Google Gemini 2.0 Flash |
| **Native UI** | ✅ مكتملة | Flet (Flutter engine) |
| **Encrypted Data** | ✅ مكتملة | SQLite + Fernet Encryption |
| **Cross-Platform** | ✅ مكتملة | Android (APK) & Windows (EXE) |

---

## 🏗️ البنية التقنية (Technical Stack)

تم الانتقال من تقنيات الويب الثقيلة إلى بنية Native خفيفة وسريعة:

- **Core Logic**: Python 3.11.
- **UI Framework**: [Flet](https://flet.dev) (يعتمد على Flutter لتقديم أداء Native).
- **Security Engine**: فحص منافذ (Port Scanner) واكتشاف هجمات حقيقي.
- **Database**: SQLite مشفر محلياً.
- **AI Integration**: Google Gemini API للتحليل الأمني الذكي.
- **CI/CD**: GitHub Actions للبناء التلقائي لملفات APK و EXE.

---

## 🚀 الميزات الرئيسية

### 1. لوحة تحكم تقنية (Technical Dashboard)
- **تصميم احترافي**: واجهة مستوحاة من غرف التحكم العالمية مع دعم كامل للغة العربية (RTL).
- **مراقبة الحالة**: عرض لحظي لحالة النظام، وقت التشغيل (Uptime)، والتأخير (Latency).
- **إحصائيات الاستهلاك**: تتبع دقيق لحجم البيانات المستهلكة.

### 2. الدرع الأمني (Security Shield)
- **فحص المنافذ**: التأكد من إغلاق المنافذ الخطيرة في الراوتر (مثل Telnet).
- **اكتشاف MITM**: التنبيه الفوري في حال تغير عنوان الـ Gateway بشكل مريب.
- **سجل الأمان**: تسجيل كافة الأحداث الأمنية في قاعدة بيانات مشفرة.

### 3. المساعد الذكي (AI Assistant)
- **نصائح مخصصة**: يقوم Gemini بتحليل سجلات الأمان والاستهلاك لتقديم نصائح احترافية بالعربية.
- **دعم الحملات**: يركز الذكاء الاصطناعي على دعم حملة "إنترنت غير محدود" عبر تحسين الاستهلاك.

---

## 📱 التحميل والتثبيت (GitHub Actions)

يتم بناء التطبيق تلقائياً. للحصول على النسخ الجاهزة:

1. اذهب إلى صفحة **Actions** في مستودعك.
2. اختر آخر عملية بناء ناجحة (✅).
3. حمل الملفات من قسم **Artifacts**:
   - `NetGuard-Pro-Android-APK`: ملف الأندرويد.
   - `NetGuard-Pro-Windows-EXE`: ملف الويندوز.

---

## 🛠️ للمطورين (Manual Run)

### المتطلبات:
- Python 3.11 أو أحدث.

### التشغيل:
```bash
# 1. تثبيت المكتبات
pip install -r requirements.txt

# 2. تشغيل التطبيق
python main.py
```

---

## 🛡️ الأمان والخصوصية
- **Privacy-First**: لا يتم إرسال أي بيانات خاصة خارج جهازك.
- **تشفير قوي**: يتم تشفير بيانات الراوتر قبل حفظها باستخدام مفتاح فريد يتم توليده لكل مستخدم.

---

**NetGuard Pro - القوة والذكاء في يدك لحماية عالمك الرقمي.**
