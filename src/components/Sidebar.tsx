import React from 'react';
import { 
  LayoutDashboard, 
  Smartphone, 
  BarChart3, 
  Zap,
  Settings, 
  ShieldCheck, 
  LogOut,
  Menu,
  X,
  HelpCircle,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../contexts/LanguageContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onHelpClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, onHelpClick }) => {
  const { t, language, setLanguage } = useTranslation();

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'devices', label: t('devices'), icon: Smartphone },
    { id: 'analytics', label: t('analytics'), icon: BarChart3 },
    { id: 'optimizer', label: t('optimizer'), icon: Zap },
    { id: 'profiles', label: t('profiles'), icon: ShieldCheck },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 border-r border-slate-800">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">NetGuard Pro</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-300"
            )} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800 space-y-2">
        <button 
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
        >
          <Globe className="w-5 h-5" />
          <span className="font-medium">{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
        <button 
          onClick={onHelpClick}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">{t('help_center')}</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
