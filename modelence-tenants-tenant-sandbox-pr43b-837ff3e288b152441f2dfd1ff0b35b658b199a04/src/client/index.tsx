/**
 * ============================================================================
 * NetGuard Pro - نقطة دخول التطبيق (Entry Point)
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * هذا الملف مسؤول عن:
 * 1. استيراد index.css (مهم جداً - بدونه تظهر شاشة سوداء!)
 * 2. تركيب جميع الـ Providers بالترتيب الصحيح
 * 3. تشغيل التطبيق
 * 
 * 🚫 لا تحذف أي من التالي:
 * - import './index.css'  ← بدونه الواجهة لا تعمل
 * - QueryClientProvider   ← بدونه queries/mutations لا تعمل
 * - ThemeProvider         ← بدونه dark/light mode لا يعمل
 * - I18nProvider          ← بدونه الترجمة AR/EN لا تعمل
 * - Toaster              ← بدونه الإشعارات لا تظهر
 * 
 * ترتيب الـ Providers مهم:
 * QueryClient > Theme > I18n > App
 * ============================================================================
 */
import { Suspense } from 'react';
import { renderApp } from 'modelence/client';
import { toast, Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { router } from './router';
import favicon from './assets/favicon.svg';
// ⚠️ هذا السطر ضروري جداً! بدون استيراد CSS تظهر شاشة سوداء بدون ألوان
import './index.css';
import LoadingSpinner from './components/LoadingSpinner';
import { useAutoLogin } from './lib/autoLogin';
import { I18nProvider } from './lib/i18n';
import { ThemeProvider } from './lib/theme';

// عميل React Query لإدارة حالة الخادم وcache
const queryClient = new QueryClient();

function App() {
  // auto-login: يعيد تسجيل المستخدم إذا كان لديه session
  useAutoLogin();

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      {/* Toaster للإشعارات - يظهر أعلى يمين الشاشة */}
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </Suspense>
  );
}

/**
 * renderApp هو الـ API الخاص بـ Modelence للتطبيقات.
 * لا تستخدم ReactDOM.createRoot مباشرة.
 */
renderApp({
  routesElement: (
    // ⚠️ ترتيب الـ Providers مهم - لا تغيره!
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>      {/* نظام الثيم dark/light */}
        <I18nProvider>     {/* نظام الترجمة AR/EN + RTL */}
          <App />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  ),
  errorHandler: (error) => {
    // عرض الأخطاء كـ toast للمستخدم
    toast.error(error.message);
  },
  loadingElement: <LoadingSpinner fullScreen />,
  favicon
});
