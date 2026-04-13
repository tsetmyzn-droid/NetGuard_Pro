import React from 'react';
import { LayoutDashboard, Shield, Brain } from 'lucide-react';
import { View } from '../types';

interface NavigationProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm glass-card p-2 flex items-center justify-around z-50">
      {[
        { id: 'dashboard', icon: LayoutDashboard },
        { id: 'logs', icon: Shield },
        { id: 'ai-lab', icon: Brain },
      ].map((item) => (
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
