# 🔄 Rollback & Recovery Strategy - NetGuard Pro

## 1. مبادئ التعافي (Recovery Principles)
- **Safe by Default**: أي تعديل يعتبر "غير مستقر" حتى يثبت العكس.
- **Auto-Revert**: إذا لم يستقبل الراوتر تأكيداً من التطبيق خلال 90 ثانية، يعود للحالة السابقة آلياً.
- **Accessibility Preservation**: الحفاظ على بروتوكول SSH متاحاً دائماً كخيار أخير للتعافي اليدوي.

## 2. نظام اللقطات (Scoped Snapshots)
بدلاً من نسخ كل شيء، نقوم بلقطات للأقسام المتأثرة فقط:

| القسم | ملفات الإعدادات المتأثرة |
| :--- | :--- |
| WiFi | `/etc/config/wireless` |
| Firewall | `/etc/config/firewall` |
| Network | `/etc/config/network` |

## 3. تدفق التنفيذ الآمن (Safe Apply Flow)
1. **Prepare**: إنشاء نسخة احتياطية للقسم المتأثر.
2. **Apply**: تطبيق الإعدادات الجديدة مؤقتاً.
3. **Validate**: تشغيل `Recovery Timer`.
4. **Confirm**: انتظار `Heartbeat` من التطبيق.
5. **Finalize**: حذف النسخة الاحتياطية وإتمام العملية.
6. **Failure**: في حال انقطاع الاتصال، يقوم سكريبت `watchdog` باستعادة النسخة الاحتياطية.
