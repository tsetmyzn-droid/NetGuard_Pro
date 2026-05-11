# 🛡️ Threat Model - NetGuard Pro

## 1. الأصول المحمية (Assets)
- **إعدادات الراوتر (Credentials/Config)**: منع التعديل غير المصرح به.
- **بيانات المستخدم (Traffic/Logs)**: الحفاظ على الخصوصية.
- **استمرارية الخدمة (Availability)**: منع تعطيل الإنترنت (DoS).

## 2. مصفوفة التهديدات (Threat Matrix)

| التهديد | المصدر | التأثير | الإجراء الدفاعي |
| :--- | :--- | :--- | :--- |
| Replay Attack | LAN Attacker | تنفيذ أوامر قديمة | Nonce + Timestamp validation. |
| MITM (Man-In-The-Middle) | LAN/Router | سرقة البيانات | HMAC Signing + Payload Hash. |
| Brute Force | LAN | الوصول للـ Agent | Rate Limiting + Exponential Backoff. |
| Resource Exhaustion | Bug/Attack | تعليق الراوتر | Resource Guard + Watchdog. |
| Config Briking | User Error | فقدان الوصول للراوتر | Transactional Apply + Auto-Rollback. |

## 3. حدود الثقة (Trust Boundaries)
- **App Instance**: موثوق به بعد المصادقة الثنائية.
- **Agent API**: لا يثق بأي طلب ما لم يكن موقعاً بـ HMAC صحيح.
- **Local Network**: غير موثوق بها بطبيعتها (Zero-Trust).
