/**
 * ============================================================================
 * NetGuard Pro - Tailwind Configuration
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * 🚫 لا تغير darkMode من 'class' إلى 'media'!
 *    - 'class' يطبق dark mode عند إضافة class="dark" على <html>
 *    - 'media' يتبع تفضيل النظام فقط (لا يدعم toggle يدوي)
 * 
 * 🚫 لا تحذف أو تقلل مسارات content!
 *    إذا حُذف ./src/client/**/*.{js,jsx,ts,tsx}، لا يكتشف Tailwind 
 *    الـ classes المستخدمة → تظهر شاشة سوداء بدون ألوان!
 * 
 * 🎨 الألوان المخصصة:
 * - primary (أزرق)      : للأزرار الرئيسية والروابط
 * - secondary (رمادي)   : للخلفيات والنصوص الثانوية
 * - success (أخضر)      : للنجاح والاتصال
 * - warning (أصفر)      : للتحذيرات
 * - danger (أحمر)       : للأخطاء والحظر
 * 
 * 🎬 Animations المتاحة:
 * - animate-fade-in     : ظهور تدريجي
 * - animate-slide-up    : انزلاق من الأسفل
 * - animate-slide-down  : انزلاق من الأعلى
 * - animate-pulse-slow  : نبض بطيء (للحالة live)
 * - animate-spin-slow   : دوران بطيء
 * ============================================================================
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/client/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',  // ⚠️ لا تغيرها إلى 'media'
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
