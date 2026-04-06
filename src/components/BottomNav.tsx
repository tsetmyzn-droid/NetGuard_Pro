import React from 'react';
import { 
  LayoutDashboard, 
  Smartphone, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../contexts/LanguageContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onHelpClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onHelpClick }) => {
  const { t } = useTranslation();

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'devices', label: t('devices'), icon: Smartphone },
    { id: 'analytics', label: t('analytics'), icon: BarChart3 },
    { id: 'settings', label: t('settings'), icon: Settings },
    { id: 'help', label: t('help'), icon: HelpCircle, action: onHelpClick },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => item.action ? item.action() : setActiveTab(item.id)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={cn(
            "px-4 py-1 rounded-full transition-all duration-300",
            activeTab === item.id ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
          )}>
            <item.icon className="w-6 h-6" />
          </div>
          <span className={cn(
            "text-[10px] font-bold transition-colors uppercase tracking-tighter",
            activeTab === item.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
          )}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
