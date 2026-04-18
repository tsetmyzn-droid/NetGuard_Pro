import React from 'react';
import { LayoutDashboard, Shield, Terminal, Settings, Lock, Info } from 'lucide-react';
import { View } from '../../types/index';

interface NavigationProps {
  activeView: View;
  onViewChange: (view: View) => void;
  isLoggedIn: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange, isLoggedIn }) => {
  const items = isLoggedIn ? [
    { id: 'dashboard', icon: LayoutDashboard },
    { id: 'logs', icon: Shield },
    { id: 'build_logs', icon: Terminal },
    { id: 'settings', icon: Settings },
    { id: 'about', icon: Info },
  ] : [
    { id: 'login', icon: Lock },
    { id: 'build_logs', icon: Terminal },
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm glass-card p-2 flex items-center justify-around z-50">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id as View)}
          className={`p-3 rounded-xl transition-all ${
            activeView === item.id 
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
              : 'text-white/30 hover:text-white/60'
          }`}
        >
          <item.icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
};
