import React, { createContext, useContext, useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateText: (text: string) => Promise<string>;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'dashboard': 'Dashboard',
    'devices': 'Devices',
    'analytics': 'Analytics',
    'optimizer': 'Optimizer',
    'profiles': 'Profiles',
    'settings': 'Settings',
    'help': 'Help Center',
    'logout': 'Logout',
    'network_overview': 'Network Overview',
    'real_time_status': 'Real-time status of your NetGuard Pro router',
    'reboot_router': 'Reboot Router',
    'system_online': 'System Online',
    'download': 'Download',
    'upload': 'Upload',
    'active': 'Active',
    'uptime': 'Uptime',
    'current_speed': 'Current speed',
    'connected_now': 'Connected now',
    'system_stability': 'System stability',
    'real_time_traffic': 'Real-time Traffic',
    'system_performance': 'System Performance',
    'cpu_load': 'CPU Load',
    'ram_usage': 'RAM Usage',
    'quick_actions': 'Quick Actions',
    'guest_wifi': 'Guest Wi-Fi',
    'security_scan': 'Security Scan',
    'scan_complete': 'Scan Complete',
    'no_threats': 'No threats detected. Your network is secure.',
    'weekly_consumption': 'Weekly Consumption',
    'data_usage_gb': 'Data usage in GB',
    'quick_stats': 'Quick Stats',
    'total_download': 'Total Download',
    'total_upload': 'Total Upload',
    'peak_usage': 'Peak Usage',
    'network_health': 'Network Health',
    'connection_logs': 'Connection Logs',
    'recent_events': 'Recent network events',
    'router_settings': 'Router Settings',
    'configure_wifi': 'Configure your Wi-Fi and network security parameters',
    'wifi_config': 'Wi-Fi Configuration',
    'ssid': 'SSID (Network Name)',
    'security_mode': 'Security Mode',
    'wifi_password': 'Wi-Fi Password',
    'save_changes': 'Save Changes',
    'guest_network': 'Guest Network',
    'enable_guest': 'Enable Guest Wi-Fi',
    'guest_ssid': 'Guest SSID',
    'network_optimization': 'Network Optimization',
    'channel_optimizer': 'Channel Optimizer',
    'current_channel': 'Current Channel',
    'optimize_now': 'Optimize Now',
    'parental_controls': 'Parental Controls',
    'access_schedule': 'Access Schedule',
    'content_filter': 'Content Filter',
    'dns_settings': 'DNS Settings',
    'primary_dns': 'Primary DNS',
    'secondary_dns': 'Secondary DNS',
    'custom_dns': 'Custom DNS',
    'usage_by_app': 'Usage by Application',
    'usage_by_content': 'Usage by Content Type',
    'month': 'Month',
    'week': 'Week',
    'day': 'Day',
    'timeline': 'Timeline',
    'app_consumption': 'App Consumption',
    'device_consumption': 'Device Consumption',
    'device_management': 'Device Management',
    'manage_secure_devices': 'Manage and secure {count} devices on your network',
    'search_placeholder': 'Search by name or IP...',
    'export': 'Export',
    'total': 'Total',
    'online': 'Online',
    'offline': 'Offline',
    'all_devices': 'All Devices',
    'unblock_all': 'Unblock All',
    'device': 'Device',
    'status': 'Status',
    'signal': 'Signal',
    'ip_mac': 'IP / MAC Address',
    'speed': 'Speed',
    'actions': 'Actions',
    'unblock': 'Unblock',
    'block': 'Block',
    'no_devices_found': 'No devices found',
    'no_blocked_devices': "Great! You haven't blocked any devices yet.",
    'try_searching_different': 'Try searching for a different name or IP address.',
    'help_center': 'Help Center',
    'how_can_we_help': 'How can we help you today?',
    'back_to_topics': 'Back to Topics',
    'search_help_placeholder': 'Search for a feature or issue...',
    'still_need_help': 'Still need help?',
    'contact_support': 'Contact Support',
    'dashboard_overview': 'Dashboard Overview',
    'understand_stats': 'Understand your real-time network statistics.',
    'wifi_optimizer': 'Wi-Fi Optimizer',
    'improve_signal': 'How to improve your Wi-Fi signal stability.',
    'security_shield': 'Security Shield',
    'learn_protection': 'Learn about the military-grade protection.',
    'control_access': 'Control who accesses your network.',
    'configure_dns_help': 'Configure custom DNS servers for your network.',
    'ai_translation': 'AI Translation',
    'ai_translation_help': 'Learn how AI helps translate the app.',
    'advanced_analytics': 'Advanced Analytics',
    'router_connectivity': 'Router Connectivity',
    'router_connectivity_help': 'Connect to your router using different protocols.',
    'detailed_consumption_help': 'Track detailed consumption history and app usage.',
    'mobile_data': 'Mobile Data',
    'cellular': 'Cellular',
    'wifi': 'Wi-Fi',
    'connection_type': 'Connection Type',
    'data_plan': 'Data Plan',
    'used': 'Used',
    'remaining': 'Remaining',
    'days_left': 'Days Left',
    'signal_strength': 'Signal Strength',
    'operator': 'Operator',
    'roaming': 'Roaming',
    'set_data_limit': 'Set Data Limit'
  },
  ar: {
    'dashboard': 'لوحة التحكم',
    'devices': 'الأجهزة',
    'analytics': 'التحليلات',
    'optimizer': 'المحسن',
    'profiles': 'الملفات الشخصية',
    'settings': 'الإعدادات',
    'help': 'مركز المساعدة',
    'logout': 'تسجيل الخروج',
    'network_overview': 'نظرة عامة على الشبكة',
    'real_time_status': 'حالة جهاز التوجيه NetGuard Pro في الوقت الفعلي',
    'reboot_router': 'إعادة تشغيل الراوتر',
    'system_online': 'النظام متصل',
    'download': 'تحميل',
    'upload': 'رفع',
    'active': 'نشط',
    'uptime': 'وقت التشغيل',
    'current_speed': 'السرعة الحالية',
    'connected_now': 'متصل الآن',
    'system_stability': 'استقرار النظام',
    'real_time_traffic': 'حركة المرور في الوقت الفعلي',
    'system_performance': 'أداء النظام',
    'cpu_load': 'حمولة المعالج',
    'ram_usage': 'استخدام الذاكرة',
    'quick_actions': 'إجراءات سريعة',
    'guest_wifi': 'واي فاي الضيوف',
    'security_scan': 'فحص الأمان',
    'scan_complete': 'اكتمل الفحص',
    'no_threats': 'لم يتم اكتشاف تهديدات. شبكتك آمنة.',
    'weekly_consumption': 'الاستهلاك الأسبوعي',
    'data_usage_gb': 'استخدام البيانات بالجيجابايت',
    'quick_stats': 'إحصائيات سريعة',
    'total_download': 'إجمالي التحميل',
    'total_upload': 'إجمالي الرفع',
    'peak_usage': 'ذروة الاستخدام',
    'network_health': 'صحة الشبكة',
    'connection_logs': 'سجلات الاتصال',
    'recent_events': 'أحداث الشبكة الأخيرة',
    'router_settings': 'إعدادات الراوتر',
    'configure_wifi': 'تكوين معلمات الواي فاي وأمان الشبكة',
    'wifi_config': 'تكوين الواي فاي',
    'ssid': 'اسم الشبكة (SSID)',
    'security_mode': 'وضع الأمان',
    'wifi_password': 'كلمة مرور الواي فاي',
    'save_changes': 'حفظ التغييرات',
    'guest_network': 'شبكة الضيوف',
    'enable_guest': 'تمكين واي فاي الضيوف',
    'guest_ssid': 'اسم شبكة الضيوف',
    'network_optimization': 'تحسين الشبكة',
    'channel_optimizer': 'محسن القنوات',
    'current_channel': 'القناة الحالية',
    'optimize_now': 'تحسين الآن',
    'parental_controls': 'الرقابة الأبوية',
    'access_schedule': 'جدول الوصول',
    'content_filter': 'تصفية المحتوى',
    'dns_settings': 'إعدادات DNS',
    'primary_dns': 'DNS الأساسي',
    'secondary_dns': 'DNS الثانوي',
    'custom_dns': 'DNS مخصص',
    'usage_by_app': 'الاستخدام حسب التطبيق',
    'usage_by_content': 'الاستخدام حسب نوع المحتوى',
    'month': 'شهر',
    'week': 'أسبوع',
    'day': 'يوم',
    'timeline': 'الجدول الزمني',
    'app_consumption': 'استهلاك التطبيقات',
    'device_consumption': 'استهلاك الأجهزة',
    'device_management': 'إدارة الأجهزة',
    'manage_secure_devices': 'إدارة وتأمين {count} أجهزة على شبكتك',
    'search_placeholder': 'البحث بالاسم أو عنوان IP...',
    'export': 'تصدير',
    'total': 'الإجمالي',
    'online': 'متصل',
    'offline': 'غير متصل',
    'all_devices': 'كل الأجهزة',
    'unblock_all': 'إلغاء حظر الكل',
    'device': 'الجهاز',
    'status': 'الحالة',
    'signal': 'الإشارة',
    'ip_mac': 'عنوان IP / MAC',
    'speed': 'السرعة',
    'actions': 'الإجراءات',
    'unblock': 'إلغاء الحظر',
    'block': 'حظر',
    'no_devices_found': 'لم يتم العثور على أجهزة',
    'no_blocked_devices': 'رائع! لم تقم بحظر أي أجهزة بعد.',
    'try_searching_different': 'حاول البحث عن اسم أو عنوان IP مختلف.',
    'help_center': 'مركز المساعدة',
    'how_can_we_help': 'كيف يمكننا مساعدتك اليوم؟',
    'back_to_topics': 'العودة إلى المواضيع',
    'search_help_placeholder': 'ابحث عن ميزة أو مشكلة...',
    'still_need_help': 'هل ما زلت بحاجة للمساعدة؟',
    'contact_support': 'اتصل بالدعم',
    'dashboard_overview': 'نظرة عامة على لوحة التحكم',
    'understand_stats': 'فهم إحصائيات الشبكة في الوقت الفعلي.',
    'wifi_optimizer': 'محسن الواي فاي',
    'improve_signal': 'كيفية تحسين استقرار إشارة الواي فاي.',
    'security_shield': 'درع الأمان',
    'learn_protection': 'تعرف على الحماية العسكرية.',
    'control_access': 'التحكم في من يصل إلى شبكتك.',
    'configure_dns_help': 'تكوين خوادم DNS مخصصة لشبكتك.',
    'ai_translation': 'ترجمة الذكاء الاصطناعي',
    'ai_translation_help': 'تعرف على كيفية مساعدة الذكاء الاصطناعي في ترجمة التطبيق.',
    'advanced_analytics': 'التحليلات المتقدمة',
    'router_connectivity': 'اتصال الراوتر',
    'router_connectivity_help': 'الاتصال بالراوتر باستخدام بروتوكولات مختلفة.',
    'detailed_consumption_help': 'تتبع سجل الاستهلاك التفصيلي واستخدام التطبيقات.',
    'mobile_data': 'بيانات الجوال',
    'cellular': 'خلوي',
    'wifi': 'واي فاي',
    'connection_type': 'نوع الاتصال',
    'data_plan': 'باقة البيانات',
    'used': 'مستخدم',
    'remaining': 'متبقي',
    'days_left': 'أيام متبقية',
    'signal_strength': 'قوة الإشارة',
    'operator': 'المشغل',
    'roaming': 'تجوال',
    'set_data_limit': 'تعيين حد البيانات'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('netguard_lang');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('netguard_lang', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const translateText = async (text: string): Promise<string> => {
    return await geminiService.translate(text, language);
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateText, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
