/**
 * ============================================================================
 * NetGuard Pro - الـ Layout الرئيسي (Sidebar + Header)
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * 🚫 لا تحذف sidebar! هو المسؤول عن التنقل بين الصفحات.
 * 🚫 لا تحذف زري تبديل اللغة أو الثيم من الـ header.
 * 🚫 استخدم useSession من 'modelence/client' وليس useUser (غير موجود).
 * 🚫 user.id فقط متاح، لا يوجد user.email في الـ UserInfo.
 * 
 * 📋 Sidebar links (جميعها يجب أن تبقى):
 * - / (Dashboard)      - LayoutDashboard icon
 * - /devices          - Laptop2 icon
 * - /settings         - Settings icon
 * - /logs             - FileText icon
 * - /errors           - AlertTriangle icon
 * 
 * 🎨 يحتوي على:
 * - Sidebar (يمين/يسار حسب RTL)
 * - Mobile hamburger menu
 * - Theme toggle (☀️/🌙)
 * - Language toggle (ع/EN)
 * - User info + logout
 * 
 * ⚠️ إذا المستخدم يرى شاشة سوداء بدون أيقونات:
 * تأكد من تثبيت lucide-react: npm install lucide-react
 * ============================================================================
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSession, logout } from 'modelence/client';
import { useI18n } from '@/client/lib/i18n';
import { useTheme } from '@/client/lib/theme';
import {
  LayoutDashboard,
  Laptop2,
  Settings,
  FileText,
  AlertTriangle,
  Sun,
  Moon,
  Languages,
  Menu,
  X,
  LogOut,
  Wifi,
  User,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t, language, setLanguage, isRTL } = useI18n();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSession();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/devices', icon: Laptop2, label: t('devices') },
    { path: '/settings', icon: Settings, label: t('settings') },
    { path: '/logs', icon: FileText, label: t('logs') },
    { path: '/errors', icon: AlertTriangle, label: t('errors') },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-secondary-900 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-secondary-800 border-b border-gray-200 dark:border-secondary-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-2">
            <Wifi className="text-primary-600 dark:text-primary-400" size={24} />
            <span className="font-bold text-lg">{t('appName')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} z-50 h-full w-64 bg-white dark:bg-secondary-800 border-gray-200 dark:border-secondary-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        } ${isRTL ? 'border-l' : 'border-r'}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-secondary-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Wifi className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg">{t('appName')}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('appDescription')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${isActive(item.path) ? 'sidebar-link-active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-secondary-700">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? t('lightMode') : t('darkMode')}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors"
          >
            <Languages size={20} />
            <span>{language === 'ar' ? t('english') : t('arabic')}</span>
          </button>

          {/* User Info */}
          {user && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-secondary-700">
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <User size={16} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.id}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-2"
              >
                <LogOut size={20} />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`lg:${isRTL ? 'mr-64' : 'ml-64'} pt-16 lg:pt-0 min-h-screen`}>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
