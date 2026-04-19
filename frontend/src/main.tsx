/**
 * ============================================================================
 * NetGuard Pro - نقطة دخول التطبيق (Entry Point)
 * ============================================================================
 * 
 * 🛡️ تصميم المعمارية: Scalable & Secure
 * المسؤول عن:
 * 1. تهيئة Providers (QueryClient, Theme, I18n)
 * 2. حقن التنسيقات العالمية (Tailwind CSS)
 * 3. تشغيل الواجهة الرسومية
 * ============================================================================
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { ThemeProvider } from './lib/theme';
import { I18nProvider } from './lib/i18n';
import { ErrorBoundary } from './components/Common/ErrorBoundary';

// ⚠️ استيراد CSS هنا يمنع مشكلة "الشاشة السوداء" عبر تحميل كافة تنسيقات Tailwind
import './index.css';

// إنشاء عميل React Query بخصائص تناسب تطبيقات الـ Desktop (Stale Time ممتد)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // تحسين الأداء في وضع الـ Desktop
      retry: 1,
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <I18nProvider>
            {/* Toaster لإدارة التنبيهات الأمنية والتقنية */}
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'dark:bg-slate-800 dark:text-white border border-slate-700/50',
                duration: 4000,
              }}
            />
            <App />
          </I18nProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
