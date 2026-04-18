import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Smartphone, 
  Settings, 
  Terminal, 
  LogOut, 
  X, 
  Globe, 
  ShieldCheck, 
  Cpu,
  Moon,
  Sun
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onViewChange: (view: any) => void;
  lang: Language;
  onToggleLang: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, onClose, activeView, onViewChange, lang, onToggleLang, onLogout, isLoggedIn, theme, onToggleTheme 
}) => {
  const cur = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  const menuItems = [
    { id: 'dashboard', label: cur.dashboard, icon: LayoutDashboard },
    { id: 'devices', label: cur.devices, icon: Smartphone },
    { id: 'router', label: cur.router, icon: Cpu },
    { id: 'settings', label: cur.settings, icon: Settings },
    { id: 'build_logs', label: cur.logs, icon: Terminal },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : (isRtl ? '100%' : '-100%'),
          opacity: 1 
        }}
        className={`fixed top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} w-72 bg-[#0d0d0d] border-white/10 z-[70] transition-[x] lg:translate-x-0 ${isRtl ? 'border-l' : 'border-r'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="font-black tracking-tighter text-xl">NetGuard <span className="text-cyan-400">Pro</span></span>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onViewChange(item.id); onClose(); }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  activeView === item.id 
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer Controls */}
          <div className="p-6 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={onToggleLang}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/60"
              >
                <Globe className="w-3 h-3" />
                {lang === 'ar' ? 'English' : 'العربية'}
              </button>
              <button 
                onClick={onToggleTheme}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60"
              >
                {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              </button>
            </div>

            {isLoggedIn && (
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>{cur.logout}</span>
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};
