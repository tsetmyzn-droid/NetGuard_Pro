/**
 * ============================================================================
 * NetGuard Pro - قواعد البيانات (Stores)
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * 🚫 لا تحذف أي Store موجود هنا! كلها مستخدمة.
 * 🚫 لا تنقل تعريفات Stores إلى migrations - يجب أن تبقى هنا.
 * 
 * 📝 قواعد مهمة عند التعديل:
 * 1. indexes صياغتها: { key: {...}, unique: true } وليس { options: { unique: true } }
 * 2. userId دائماً يستخدم schema.userId() وليس schema.string()
 * 3. تواريخ تستخدم schema.date()
 * 4. الحقول الاختيارية تستخدم .optional()
 * 5. لاستعلام حقل optional بقيمة undefined: { field: { $exists: false } }
 *    وليس { field: null }
 * 
 * 🔐 حقول حساسة (يجب تشفيرها):
 * - dbRouterConfig.routerPassword
 * - dbWifiSettings.password
 * استخدم crypto-js لتشفيرها قبل الحفظ.
 * ============================================================================
 */
import { Store, schema } from 'modelence/server';

/**
 * dbRouterConfig - إعدادات الراوتر لكل مستخدم
 * - unique index على userId (كل مستخدم لديه إعداد واحد فقط)
 * - يحفظ IP، اسم المستخدم، كلمة المرور، الموديل، العلامة التجارية
 * - ⚠️ routerPassword يجب أن يكون مشفراً!
 */
export const dbRouterConfig = new Store('routerConfigs', {
  schema: {
    userId: schema.userId(),
    routerIp: schema.string(),
    routerUsername: schema.string(),
    routerPassword: schema.string(), // In production, should be encrypted
    routerModel: schema.string().optional(),
    routerBrand: schema.string().optional(),
    firmwareVersion: schema.string().optional(),
    isConnected: schema.boolean(),
    lastConnectedAt: schema.date().optional(),
    createdAt: schema.date(),
    updatedAt: schema.date(),
  },
  indexes: [
    { key: { userId: 1 }, unique: true }
  ]
});

/**
 * dbDevices - الأجهزة المتصلة بالراوتر
 * - يُعرَّف كل جهاز بـ MAC address (فريد لكل مستخدم)
 * - يحفظ: اسم الجهاز، IP، نوع الجهاز، حالة الاتصال، حالة الحظر، حد السرعة
 * - deviceType: phone, laptop, tablet, tv, desktop, iot, other
 * - speedLimit: حد السرعة بالميجابت/ثانية (اختياري)
 */
export const dbDevices = new Store('routerDevices', {
  schema: {
    userId: schema.userId(),
    macAddress: schema.string(),
    ipAddress: schema.string().optional(),
    deviceName: schema.string().optional(),
    deviceType: schema.string().optional(), // phone, laptop, tablet, tv, etc.
    isOnline: schema.boolean(),
    isBlocked: schema.boolean(),
    speedLimit: schema.number().optional(), // in Mbps
    lastSeen: schema.date(),
    createdAt: schema.date(),
    updatedAt: schema.date(),
  },
  indexes: [
    { key: { userId: 1, macAddress: 1 }, unique: true },
    { key: { userId: 1, isOnline: 1 } },
    { key: { userId: 1, isBlocked: 1 } }
  ]
});

/**
 * dbUsageStats - إحصائيات الاستهلاك
 * - macAddress اختياري: إذا كان undefined → إحصائيات الراوتر الكلية
 * - إذا كان له قيمة → إحصائيات جهاز محدد
 * - periodType: 'daily' (يومي) أو 'hourly' (كل ساعة)
 * - للاستعلام عن الإحصائيات الكلية: استخدم { macAddress: { $exists: false } }
 * - ⚠️ لا تستخدم { macAddress: null } - هذا لا يعمل!
 */
export const dbUsageStats = new Store('routerUsageStats', {
  schema: {
    userId: schema.userId(),
    macAddress: schema.string().optional(), // undefined for total router usage
    date: schema.date(), // Date at midnight for grouping
    downloadBytes: schema.number(),
    uploadBytes: schema.number(),
    totalBytes: schema.number(),
    periodType: schema.string(), // 'daily', 'hourly'
    createdAt: schema.date(),
  },
  indexes: [
    { key: { userId: 1, date: 1, macAddress: 1, periodType: 1 } },
    { key: { userId: 1, periodType: 1, date: -1 } }
  ]
});

/**
 * dbLogs - سجلات العمليات
 * - level: 'info' | 'warning' | 'error' | 'success'
 * - category: 'connection' | 'device' | 'settings' | 'system' | 'security'
 * - تستخدم في صفحتي LogsPage و ErrorsPage
 * - يتم مسح السجلات القديمة (>30 يوم) عبر mutation clearOldLogs
 */
export const dbLogs = new Store('routerLogs', {
  schema: {
    userId: schema.userId(),
    level: schema.string(), // 'info', 'warning', 'error', 'success'
    category: schema.string(), // 'connection', 'device', 'settings', 'system'
    message: schema.string(),
    details: schema.string().optional(),
    timestamp: schema.date(),
  },
  indexes: [
    { key: { userId: 1, timestamp: -1 } },
    { key: { userId: 1, level: 1, timestamp: -1 } },
    { key: { userId: 1, category: 1, timestamp: -1 } }
  ]
});

/**
 * dbWifiSettings - إعدادات WiFi
 * - ssid: اسم الشبكة
 * - password: ⚠️ يجب تشفيرها!
 * - isHidden: إخفاء SSID
 * - securityType: 'WPA2' | 'WPA3' | 'WPA2/WPA3' | 'WEP'
 * - channel: قناة WiFi (1-13 للـ 2.4GHz)
 * - maxDownloadMbps / maxUploadMbps: حدود السرعة الكلية
 */
export const dbWifiSettings = new Store('routerWifiSettings', {
  schema: {
    userId: schema.userId(),
    ssid: schema.string().optional(),
    password: schema.string().optional(),
    isHidden: schema.boolean(),
    channel: schema.number().optional(),
    securityType: schema.string().optional(), // WPA2, WPA3, etc.
    isEnabled: schema.boolean(),
    maxDownloadMbps: schema.number().optional(),
    maxUploadMbps: schema.number().optional(),
    updatedAt: schema.date(),
  },
  indexes: [
    { key: { userId: 1 }, unique: true }
  ]
});

/**
 * dbPackageInfo - معلومات باقة الإنترنت من ISP
 * - خاص بباقات WE / اتصالات / فودافون / أورانج
 * - totalQuotaGB: حد الباقة بالجيجابايت
 * - usedQuotaGB: المستهلك
 * - remainingQuotaGB: المتبقي
 * - renewalDate: تاريخ التجديد
 * 
 * 💡 للاتصال الحقيقي بـ WE ISP، يحتاج scraping لموقع my.te.eg
 * (غير ممكن من Modelence cloud بسبب CORS، يحتاج Electron/Native)
 */
export const dbPackageInfo = new Store('routerPackageInfo', {
  schema: {
    userId: schema.userId(),
    totalQuotaGB: schema.number().optional(),
    usedQuotaGB: schema.number().optional(),
    remainingQuotaGB: schema.number().optional(),
    renewalDate: schema.date().optional(),
    packageName: schema.string().optional(),
    lastUpdated: schema.date(),
  },
  indexes: [
    { key: { userId: 1 }, unique: true }
  ]
});
