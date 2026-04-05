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

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onHelpClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onHelpClick }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'devices', label: 'Devices', icon: Smartphone },
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle, action: onHelpClick },
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
