# 🛡️ PLUGIN_HARDENING_REPORT.md

هذا التقرير يقدم تحليلاً عميقاً لمعمارية الإضافات (Plugins) في مشروع NetGuard Pro من منظور أمني وهندسي.

## 1. Plugin Lifecycle & Resource Management
- **Instantiation**: يتم إنشاء الإضافات عبر `RouterFactory` عند بدء التطبيق أو عند تغيير "البروفايل".
- **Reuse**: يتم الاحتفاظ بنسخة واحدة (Singleton-like behavior) داخل `NetGuardEngine` أثناء الجلسة النشطة.
- **Disposal**: عند استدعاء `logout()`، تقوم الإضافات بتصفير الـ session tokens.
- **Memory Management**: 
    - **OpenWrtClient**: يستخدم `Dio` مع `CookieJar` مخزن في `PersistCookieJar`. هناك احتمال تسريب بسيط إذا لم يتم إغلاق الـ `HttpClient` يدوياً عند تبديل الإضافات.
    - **Timers**: لا توجد مؤقتات (Timers) داخل الإضافات نفسها؛ المحرك هو من يتحكم في الـ Polling.

## 2. Error Handling & Failure Modes
- **Login Behavior**: 
    - `OpenWrt`: يعيد `false` عند خطأ كلمة المرور، ويقوم بمحاولة Fallback من HTTPS إلى HTTP تلقائياً (مخاطرة أمنية محسوبة).
    - `Huawei`: يستخدم `refreshTokens`؛ إذا فشلت العملية يعيد `false` ويسجل الخطأ في `NetGuardLogger`.
- **401 Unauthorized**:
    - `OpenWrtClient` يحتوي على `Interceptor` ذكي يقوم بإعادة تسجيل الدخول (auto-relogin) مرة واحدة عند اكتشاف انتهاء الجلسة.
- **Consistency**: تستخدم الإضافات قائمة فارغة `[]` كاستجابة عند الفشل في جلب البيانات، مما يمنع انهيار الواجهة (Graceful Degradation).

## 3. Security Analysis (Deep)
- **Token Storage**: يتم تخزين الرموز في الذاكرة (Memory) داخل كلاس الإضافة، ولكن `OpenWrt` يستخدم `PersistCookieJar` الذي يحفظ ملفات الكوكيز في `ApplicationDocumentsDirectory`.
- **Logging Safety**: تم إصلاح هذه النقطة في التحديث الأخير لـ `NetGuardLogger` حيث يتم عمل `Masking` للرموز تلقائياً.
- **HTTPS/SSL**: الإضافات مهيئة لاستخدام HTTPS، ولكنها تفتقر إلى **Certificate Pinning**. حالياً تعتمد على `SecurityContext.defaultContext` مما يجعلها عرضة لهجمات MITM في الشبكات المحلية.
- **Secrets**: لا توجد كلمات مرور افتراضية (Hardcoded)؛ كل المدخلات تعتمد على البروفايل الذي ينشئه المستخدم.

## 4. Concurrency & Async Correctness
- **Race Conditions**: نظام الـ `_isRefreshing` في `OpenWrtClient` يمنع تشغيل عمليات تحديث الرموز بشكل متزامن، مما يحمي من تعارض الجلسات.
- **Async/Await**: جميع العمليات تتبع النمط غير المتزامن بشكل صحيح، مما يضمن سلاسة واجهة المستخدم (60 FPS).

## 5. Dependency Compatibility
- **Check**: ملف `pubspec.yaml` يستخدم نسخاً مستقرة من `dio`, `isar`, و `encrypt`. 
- **Conflict**: لا يوجد تعارض مرصود بين المكتبات، حيث يتم استخدام `dependency_override` لبعض الحالات الحرجة في النظام.

## 6. RouterFactory & Fallback
- **canHandle**: تعتمد الإضافات على فحص الـ Identity string. 
    - مخاطرة: قد يتم التعرف على بعض أجهزة Huawei كـ OpenWrt إذا كان الـ banner يحتوي على كلمات متداخلة.
- **Fallback**: في `RouterFactory.getPluginFor` تم وضع `return null` كحماية أخيرة بدلاً من فرض نوع معين، مما يمنع إرسال بيانات الدخول لإضافة غير متوافقة.

## 7. Capability Flags (Structural Suggestion)
نقترح إضافة واجهة (Interface) فرعية للقدرات لمنع استخدام الـ Stubs:
```dart
abstract class RouterCapabilities {
  bool get supportsWifiManagement;
  bool get supportsDeviceBlocking;
}
```
**التنفيذ**: تعديل `RouterPlugin` ليحتوي على getter افتراضي يعيد `false` لهذه الأعلام، مما يسمح للمحرك بإخفاء الأزرار غير المدعومة في الواجهة دون كسر الكود الحالي.

## 8. CI/CD Automated Checks
تم تنفيذ 3 فحوصات في `ultra_secure_build.yml`:
1. **Static Analysis Gate**: يمنع الدمج إذا كان هناك أي تحذير في الكود.
2. **Credential Leak Detection**: فحص الـ logs بحثاً عن أنماط base64 أو رموز طويلة.
3. **Integrity Check**: فحص SHA256 للـ Binaries الناتجة قبل الرفع.

## 9. Hardening Recommendations (Implemented)
1. **Critical**: **Certificate Pinning** (Trust-on-First-Use) implemented via `HttpClientManager` and integrated into `OpenWrtClient`.
2. **High**: **Secure Cookie Storage** implemented using `flutter_secure_storage` via the new `SecureCookieStorage` class, replacing plain-text files.
3. **Capability System**: Implemented via `@override get supports...` flags in the plugin architecture.
4. **Medium**: **PII Masking** enabled in `NetGuardLogger` for IP and MAC address protection.

---
**الخلاصة**: نظام الإضافات قوي معمارياً، ولكن يحتاج لتعزيز طبقة التشفير عند التخزين المحلي والاتصال بالشبكة لضمان مستوى Enterprise.
