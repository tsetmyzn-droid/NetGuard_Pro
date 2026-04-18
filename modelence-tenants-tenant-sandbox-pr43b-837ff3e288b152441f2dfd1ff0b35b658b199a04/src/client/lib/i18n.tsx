/**
 * ============================================================================
 * NetGuard Pro - نظام الترجمة (i18n)
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * 🚫 لا تحذف أي ترجمة! كلها مستخدمة في الصفحات.
 * 🚫 لا تُبدّل الـ Context بـ react-i18next أو أي مكتبة أخرى.
 * 
 * 📝 كيفية الاستخدام:
 * ```tsx
 * import { useI18n } from '@/lib/i18n';
 * const { t, language, setLanguage } = useI18n();
 * return <h1>{t('dashboard')}</h1>;
 * ```
 * 
 * ✨ ميزات:
 * - عربية (ar) + إنجليزية (en)
 * - RTL تلقائي للعربية (dir="rtl" على html)
 * - حفظ الاختيار في localStorage
 * - إضافة ترجمة جديدة: أضف المفتاح في كلا اللغتين (en و ar)
 * ============================================================================
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Language = 'en' | 'ar';

const translations = {
  en: {
    // App
    appName: 'NetGuard Pro',
    appDescription: 'Monitor and manage your router',

    // Navigation
    dashboard: 'Dashboard',
    devices: 'Devices',
    settings: 'Router Settings',
    logs: 'Logs',
    errors: 'Errors',

    // Dashboard
    totalUsage: 'Total Usage',
    todayUsage: 'Today\'s Usage',
    weeklyUsage: 'Weekly Usage',
    monthlyUsage: 'Monthly Usage',
    connectedDevices: 'Connected Devices',
    signalStrength: 'Signal Strength',
    uptime: 'Uptime',
    downloadSpeed: 'Download Speed',
    uploadSpeed: 'Upload Speed',

    // Devices
    deviceName: 'Device Name',
    macAddress: 'MAC Address',
    ipAddress: 'IP Address',
    status: 'Status',
    usage: 'Usage',
    lastSeen: 'Last Seen',
    actions: 'Actions',
    blockDevice: 'Block',
    unblockDevice: 'Unblock',
    limitSpeed: 'Limit Speed',
    online: 'Online',
    offline: 'Offline',
    blocked: 'Blocked',

    // Router Settings
    routerInfo: 'Router Information',
    routerModel: 'Model',
    routerBrand: 'Brand',
    firmwareVersion: 'Firmware',
    wifiSettings: 'WiFi Settings',
    networkName: 'Network Name (SSID)',
    password: 'Password',
    hideNetwork: 'Hide Network',
    channel: 'Channel',
    security: 'Security Type',
    bandwidthControl: 'Bandwidth Control',
    maxDownload: 'Max Download (Mbps)',
    maxUpload: 'Max Upload (Mbps)',

    // Controls
    rebootRouter: 'Reboot Router',
    factoryReset: 'Factory Reset',
    disableWifi: 'Disable WiFi',
    enableWifi: 'Enable WiFi',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    confirm: 'Confirm',

    // Logs
    systemLogs: 'System Logs',
    errorLogs: 'Error Logs',
    timestamp: 'Timestamp',
    message: 'Message',
    level: 'Level',
    info: 'Info',
    warning: 'Warning',
    error: 'Error',
    success: 'Success',

    // Connection
    routerConnection: 'Router Connection',
    routerIp: 'Router IP',
    username: 'Username',
    connect: 'Connect',
    disconnect: 'Disconnect',
    connected: 'Connected',
    disconnected: 'Disconnected',
    connecting: 'Connecting...',
    connectionFailed: 'Connection Failed',

    // Data
    dataRemaining: 'Data Remaining',
    renewalDate: 'Renewal Date',
    packageInfo: 'Package Info',

    // Units
    gb: 'GB',
    mb: 'MB',
    mbps: 'Mbps',
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',

    // Messages
    confirmReboot: 'Are you sure you want to reboot the router?',
    confirmReset: 'Warning: Factory reset will erase all settings. Are you sure?',
    confirmBlock: 'Block this device from the network?',
    deviceBlocked: 'Device blocked successfully',
    deviceUnblocked: 'Device unblocked successfully',
    settingsSaved: 'Settings saved successfully',
    rebootInitiated: 'Reboot initiated',
    noDevices: 'No devices connected',
    noLogs: 'No logs available',
    noErrors: 'No errors recorded',

    // Theme
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    arabic: 'Arabic',
    english: 'English',

    // Auth
    login: 'Login',
    logout: 'Logout',
    signup: 'Sign Up',
    email: 'Email',

    // Common
    loading: 'Loading...',
    refresh: 'Refresh',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    custom: 'Custom',
    from: 'From',
    to: 'To',
    apply: 'Apply',
    clear: 'Clear',
    export: 'Export',
    import: 'Import',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    details: 'Details',
  },
  ar: {
    // App
    appName: 'NetGuard Pro',
    appDescription: 'مراقبة وإدارة جهاز الراوتر',

    // Navigation
    dashboard: 'لوحة التحكم',
    devices: 'الأجهزة',
    settings: 'إعدادات الراوتر',
    logs: 'السجلات',
    errors: 'الأخطاء',

    // Dashboard
    totalUsage: 'إجمالي الاستهلاك',
    todayUsage: 'استهلاك اليوم',
    weeklyUsage: 'استهلاك الأسبوع',
    monthlyUsage: 'استهلاك الشهر',
    connectedDevices: 'الأجهزة المتصلة',
    signalStrength: 'قوة الإشارة',
    uptime: 'وقت التشغيل',
    downloadSpeed: 'سرعة التحميل',
    uploadSpeed: 'سرعة الرفع',

    // Devices
    deviceName: 'اسم الجهاز',
    macAddress: 'عنوان MAC',
    ipAddress: 'عنوان IP',
    status: 'الحالة',
    usage: 'الاستهلاك',
    lastSeen: 'آخر ظهور',
    actions: 'الإجراءات',
    blockDevice: 'حظر',
    unblockDevice: 'إلغاء الحظر',
    limitSpeed: 'تحديد السرعة',
    online: 'متصل',
    offline: 'غير متصل',
    blocked: 'محظور',

    // Router Settings
    routerInfo: 'معلومات الراوتر',
    routerModel: 'الموديل',
    routerBrand: 'العلامة التجارية',
    firmwareVersion: 'إصدار البرنامج',
    wifiSettings: 'إعدادات الواي فاي',
    networkName: 'اسم الشبكة (SSID)',
    password: 'كلمة المرور',
    hideNetwork: 'إخفاء الشبكة',
    channel: 'القناة',
    security: 'نوع الحماية',
    bandwidthControl: 'التحكم في النطاق الترددي',
    maxDownload: 'أقصى تحميل (ميجابت)',
    maxUpload: 'أقصى رفع (ميجابت)',

    // Controls
    rebootRouter: 'إعادة تشغيل الراوتر',
    factoryReset: 'ضبط المصنع',
    disableWifi: 'إيقاف الواي فاي',
    enableWifi: 'تشغيل الواي فاي',
    saveChanges: 'حفظ التغييرات',
    cancel: 'إلغاء',
    confirm: 'تأكيد',

    // Logs
    systemLogs: 'سجلات النظام',
    errorLogs: 'سجلات الأخطاء',
    timestamp: 'التوقيت',
    message: 'الرسالة',
    level: 'المستوى',
    info: 'معلومات',
    warning: 'تحذير',
    error: 'خطأ',
    success: 'نجاح',

    // Connection
    routerConnection: 'اتصال الراوتر',
    routerIp: 'عنوان IP للراوتر',
    username: 'اسم المستخدم',
    connect: 'اتصال',
    disconnect: 'قطع الاتصال',
    connected: 'متصل',
    disconnected: 'غير متصل',
    connecting: 'جاري الاتصال...',
    connectionFailed: 'فشل الاتصال',

    // Data
    dataRemaining: 'البيانات المتبقية',
    renewalDate: 'تاريخ التجديد',
    packageInfo: 'معلومات الباقة',

    // Units
    gb: 'جيجابايت',
    mb: 'ميجابايت',
    mbps: 'ميجابت/ث',
    days: 'أيام',
    hours: 'ساعات',
    minutes: 'دقائق',

    // Messages
    confirmReboot: 'هل أنت متأكد من إعادة تشغيل الراوتر؟',
    confirmReset: 'تحذير: ضبط المصنع سيمحو جميع الإعدادات. هل أنت متأكد؟',
    confirmBlock: 'حظر هذا الجهاز من الشبكة؟',
    deviceBlocked: 'تم حظر الجهاز بنجاح',
    deviceUnblocked: 'تم إلغاء حظر الجهاز بنجاح',
    settingsSaved: 'تم حفظ الإعدادات بنجاح',
    rebootInitiated: 'تم بدء إعادة التشغيل',
    noDevices: 'لا توجد أجهزة متصلة',
    noLogs: 'لا توجد سجلات',
    noErrors: 'لا توجد أخطاء مسجلة',

    // Theme
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'الإنجليزية',

    // Auth
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    signup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',

    // Common
    loading: 'جاري التحميل...',
    refresh: 'تحديث',
    search: 'بحث',
    filter: 'تصفية',
    all: 'الكل',
    today: 'اليوم',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    custom: 'مخصص',
    from: 'من',
    to: 'إلى',
    apply: 'تطبيق',
    clear: 'مسح',
    export: 'تصدير',
    import: 'استيراد',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    close: 'إغلاق',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    details: 'التفاصيل',
  },
} as const;

type TranslationKeys = keyof typeof translations.en;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      return (saved as Language) || 'ar';
    }
    return 'ar';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: TranslationKeys): string => {
    return translations[language][key] || key;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
