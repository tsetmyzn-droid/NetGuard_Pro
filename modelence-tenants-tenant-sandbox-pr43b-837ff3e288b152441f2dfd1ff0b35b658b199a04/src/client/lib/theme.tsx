/**
 * ============================================================================
 * NetGuard Pro - نظام الثيم (Dark/Light Mode)
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * 🚫 لا تحذف هذا الملف أو تبدله بـ next-themes.
 * 🚫 لا تحذف تطبيق class 'dark' على documentElement.
 * 
 * 📝 كيفية الاستخدام:
 * ```tsx
 * import { useTheme } from '@/lib/theme';
 * const { theme, toggleTheme, isDark } = useTheme();
 * <button onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</button>
 * ```
 * 
 * ✨ كيف يعمل:
 * 1. يقرأ localStorage للثيم المحفوظ
 * 2. إذا لا يوجد، يستخدم prefers-color-scheme
 * 3. يطبق class "dark" على <html> element
 * 4. Tailwind يكتشف .dark tokens ويطبقها
 * 
 * ⚠️ شرط نجاح dark mode:
 * tailwind.config.js يجب أن يحتوي: darkMode: 'class'
 * ============================================================================
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, isDark]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
