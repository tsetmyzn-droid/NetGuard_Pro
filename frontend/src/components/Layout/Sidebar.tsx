import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : (isRtl ? '100%' : '-100%'),
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} w-80 bg-[#080808] border-white/5 z-[70] lg:translate-x-0 ${isRtl ? 'border-l' : 'border-r'} shadow-2xl`}
      >
        <div className="flex flex-col h-full relative">
          <div className="scanner-line !w-[1px] !h-full !left-auto !right-0 !opacity-5" />

          {/* Logo Section */}
          <div className="p-10 flex flex-col items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 relative group overflow-hidden">
               <div className="absolute inset-0 bg-cyan-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
               <ShieldCheck className="w-8 h-8 text-cyan-400 relative z-10 glow-text" />
            </div>
            <div className="text-center">
              <span className="font-black tracking-tighter text-2xl font-display block">NetGuard <span className="text-cyan-400">Pro</span></span>
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20 mt-1 block">Security Management Console</span>
            </div>
            <button onClick={onClose} className="lg:hidden absolute top-8 right-8 p-2 text-white/20 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-6 space-y-2 mt-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onViewChange(item.id); onClose(); }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest relative group overflow-hidden ${
                  activeView === item.id 
                    ? 'text-black font-black' 
                    : 'text-white/30 hover:text-white'
                }`}
              >
                {activeView === item.id && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                  />
                )}
                <div className="relative z-10 flex items-center gap-4">
                  <item.icon className={`w-5 h-5 transition-transform duration-500 ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </nav>

          {/* Footer Controls */}
          <div className="p-8 space-y-6 relative">
            <div className="absolute top-0 left-8 right-8 h-px bg-white/5" />
            
            <div className="flex items-center gap-3">
              <button 
                onClick={onToggleLang}
                className="flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/40 hover:text-white group"
              >
                <Globe className="w-4 h-4 text-cyan-500/60 group-hover:rotate-180 transition-transform duration-700" />
                {lang === 'ar' ? 'English' : 'العربية'}
              </button>
              <button 
                onClick={onToggleTheme}
                className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all text-white/40 hover:text-white group"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /> : <Moon className="w-4 h-4 group-hover:-rotate-45 transition-transform duration-500" />}
              </button>
            </div>

            {isLoggedIn && (
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500/60 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 transition-all group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>{cur.logout}</span>
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};
