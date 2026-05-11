# 📉 Resource Limits & Compatibility - NetGuard Pro

## 1. حدود استهلاك الموارد (Hard Limits)

| المورد | الحد الأقصى المسموح | الإجراء عند التجاوز |
| :--- | :--- | :--- |
| RAM (Agent) | 4 MB | قتل العمليات غير الأساسية |
| Disk (Flash) | 2 MB | حذف أقدم السجلات الجنائية |
| CPU usage | 20% (long term) | زيادة فترات الـ Polling |

## 2. مصفوفة التوافق (Compatibility Matrix)

| الإصدار | مستوى الدعم | الميزات المتاحة |
| :--- | :--- | :--- |
| OpenWrt 21+ | Full | All Features (nftables) |
| OpenWrt 19 | Balanced | iptables instead of nftables |
| RAM < 32MB | Minimal | Basic Monitoring, No Forensics |
| Flash < 8MB | Minimal | Basic Monitoring, No Snapshots |

## 3. أعلام القدرات (Capability Flags)
سوف يقوم الـ Agent بإرسال هذه الأعلام للتطبيق عند أول اتصال:
- `cap_nft`: يدعم nftables.
- `cap_wifi_sch`: يدعم جدولة الواي فاي.
- `cap_for_rec`: يدعم التسجيل الجنائي الكامل.
- `cap_rb_safe`: يدعم نظام الـ Rollback الآمن.
