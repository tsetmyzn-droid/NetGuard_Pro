import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  LayoutDashboard, 
  Shield, 
  Settings, 
  Info, 
  HelpCircle, 
  LogOut, 
  Globe, 
  Zap,
  Activity,
  Lock,
  Terminal
} from 'lucide-react';
import { View, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: View;
  onViewChange: (view: View) => void;
  lang: Language;
  onToggleLang: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeView, 
  onViewChange, 
  lang, 
  onToggleLang,
  onLogout 
}) => {
  const cur = TRANSLATIONS[lang];

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: cur.dashboard },
    { id: 'logs', icon: Shield, label: cur.threats },
    { id: 'build_logs', icon: Terminal, label: 'Build Logs' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'about', icon: Info, label: 'About' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar Content */}
          <motion.div
            initial={{ x: lang === 'ar' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: lang === 'ar' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 bottom-0 w-72 bg-[#0a0a0a] border-r border-white/5 z-[70] flex flex-col ${
              lang === 'ar' ? 'right-0 border-l border-r-0' : 'left-0'
            }`}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-400/10">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="font-bold text-lg tracking-tight">NetGuard Pro</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id as View);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeView === item.id 
                      ? 'bg-cyan-400 text-black font-bold shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}

              <div className="pt-4 mt-4 border-t border-white/5">
                <p className="px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Quick Actions</p>
                <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span className="text-sm">Optimize Network</span>
                </button>
                <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm">Deep Scan</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 space-y-2">
              <button 
                onClick={onToggleLang}
                className="w-full flex items-center justify-between p-4 rounded-2xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-4">
                  <Globe className="w-5 h-5" />
                  <span className="text-sm">{lang === 'ar' ? 'English' : 'العربية'}</span>
                </div>
                <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded uppercase">{lang}</span>
              </button>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
