import React, { useState } from 'react';
import { Menu, Shield, Zap, Bell, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { BuildLogs } from './pages/BuildLogs';
import { Devices } from './pages/Devices';
import { Login } from './components/Login/Login';
import { useTheme } from './lib/theme';
import { useI18n } from './lib/i18n';

function App() {
  const [view, setView] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const { lang, setLanguage, t } = useI18n();

  const isRtl = lang === 'ar';

  if (!isLoggedIn && view !== 'build_logs') {
    return (
      <Login 
        lang={lang} 
        onLogin={() => setIsLoggedIn(true)} 
        onViewLogs={() => setView('build_logs')} 
      />
    );
  }

  const toggleLang = () => {
    setLanguage(lang === 'ar' ? 'en' : 'ar');
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen tech-grid transition-colors selection:bg-cyan-500 selection:text-black ${theme === 'dark' ? 'bg-[#060606] text-white' : 'bg-slate-50 text-slate-900'}`}
    >
      {/* Immersive Scanner Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden opacity-20">
        <div className="scanner-line" />
      </div>
      
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={view}
        onViewChange={setView}
        lang={lang}
        onToggleLang={toggleLang}
        onLogout={() => setIsLoggedIn(false)}
        isLoggedIn={isLoggedIn}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Layout Wrapper */}
      <div className={`transition-all duration-500 min-h-screen flex flex-col ${isRtl ? 'lg:mr-72' : 'lg:ml-72'}`}>
        
        {/* Top Header */}
        <header className="px-6 md:px-10 py-8 flex items-center justify-between sticky top-0 bg-[#060606]/60 backdrop-blur-2xl z-50 border-b border-white/5">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
            </button>
            <div className="flex items-center gap-3 group cursor-default">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
                <Shield className="w-7 h-7 text-cyan-400 glow-text" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter leading-none font-display">
                  {t('title').split(' ')[0]} <span className="text-cyan-400">{t('title').split(' ')[1]}</span>
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400/60">Enterprise OS 1.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-black text-white uppercase tracking-tighter">12.4 <span className="opacity-40">Mb/s</span></span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs font-black text-white uppercase tracking-tighter">99.9 <span className="opacity-40">%</span></span>
                </div>
             </div>
             <button className="p-3 rounded-2xl bg-white/5 border border-white/10 relative hover:bg-white/10 transition-all group overflow-hidden">
                <Bell className="w-5 h-5 text-white/60 group-hover:text-cyan-400 transition-colors" />
                <div className="absolute top-3 right-3 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(34,211,238,1)] border-2 border-[#060606]" />
             </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-6 md:p-12 max-w-7xl w-full mx-auto">
           <div className="relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full"
                >
                  {view === 'dashboard' && <Dashboard />}
                  {view === 'devices' && <Devices />}
                  {view === 'settings' && <Settings />}
                  {view === 'build_logs' && <BuildLogs onViewChange={setView} isLoggedIn={isLoggedIn} />}
                </motion.div>
              </AnimatePresence>
           </div>
        </main>

        <footer className="p-8 text-center text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">
           NetGuard Enterprise Protection System &copy; 2026
        </footer>
      </div>

      {/* Glow Effects */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-cyan-500/[0.03] blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/[0.03] blur-[120px] pointer-events-none rounded-full" />
    </div>
  );
}

export default App;
