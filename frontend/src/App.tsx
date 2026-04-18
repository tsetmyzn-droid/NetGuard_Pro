import React, { useState } from 'react';
import { Menu, Shield, Zap, Bell } from 'lucide-react';
import { Language, TRANSLATIONS } from './constants';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { BuildLogs } from './pages/BuildLogs';
import { Login } from './components/Login/Login';

function App() {
  const [view, setView] = useState('dashboard');
  const [lang, setLang] = useState<Language>('ar');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const cur = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  if (!isLoggedIn) {
    return (
      <Login 
        lang={lang} 
        onLogin={() => setIsLoggedIn(true)} 
        onViewLogs={() => setView('build_logs')} 
      />
    );
  }

  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[#060606] tech-grid text-white transition-colors selection:bg-cyan-500 selection:text-black ${theme === 'light' ? 'bg-slate-50 text-slate-900' : ''}`}
    >
      
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
      <div className={`transition-all duration-300 min-h-screen flex flex-col ${isRtl ? 'lg:mr-72' : 'lg:ml-72'}`}>
        
        {/* Top Header */}
        <header className="px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 bg-[#060606]/80 backdrop-blur-xl z-50 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-black tracking-tighter leading-none">
                NetGuard <span className="text-cyan-400">Pro</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter">12.4 Mb/s</span>
             </div>
             <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 relative hover:bg-white/10 transition-all">
                <Bell className="w-5 h-5 text-white/60" />
                <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
             </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
           {view === 'dashboard' && <Dashboard lang={lang} />}
           {view === 'settings' && <Settings lang={lang} />}
           {view === 'build_logs' && <BuildLogs lang={lang} />}
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
