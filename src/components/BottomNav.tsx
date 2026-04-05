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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-50 pb-safe">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => item.action ? item.action() : setActiveTab(item.id)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={cn(
            "px-5 py-1 rounded-full transition-all duration-300",
            activeTab === item.id ? "bg-blue-100 text-blue-600" : "text-slate-400"
          )}>
            <item.icon className="w-6 h-6" />
          </div>
          <span className={cn(
            "text-[10px] font-medium transition-colors",
            activeTab === item.id ? "text-blue-600" : "text-slate-400"
          )}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
