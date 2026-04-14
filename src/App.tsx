import React, { useState, useEffect } from 'react';
import { Globe, LogOut, Menu, Shield, Bell } from 'lucide-react';
import { View, Language } from './types';
import { TRANSLATIONS } from './constants';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Logs } from './components/Logs';
import { BuildLogs } from './components/BuildLogs';
import { Navigation } from './components/Navigation';
import { Sidebar } from './components/Sidebar';

function App() {
  const [view, setView] = useState<View>('login');
  const [lang, setLang] = useState<Language>('ar');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView('login');
    setIsSidebarOpen(false);
  };

  const cur = TRANSLATIONS[lang];

  if (!isLoggedIn) {
    return <Login lang={lang} onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen bg-[#0a0a0a] tech-grid p-6 max-w-md mx-auto relative overflow-hidden pb-24 ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeView={view}
        onViewChange={setView}
        lang={lang}
        onToggleLang={toggleLang}
        onLogout={handleLogout}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 glass-card hover:bg-white/10 transition-colors"
          >
            <Menu className="w-6 h-6 text-cyan-400" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo1.svg" alt="Logo" className="w-8 h-8" referrerPolicy="no-referrer" />
            <h1 className="text-lg font-bold tracking-tight text-white/90">{cur.title}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 glass-card hover:bg-white/10 transition-colors relative">
            <Bell className="w-5 h-5 text-white/40" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0a0a]" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {view === 'dashboard' && <Dashboard lang={lang} />}
        {view === 'logs' && <Logs lang={lang} />}
        {view === 'build_logs' && <BuildLogs lang={lang} />}
      </main>

      {/* Navigation */}
      <Navigation activeView={view} onViewChange={setView} />

      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] pointer-events-none" />
    </div>
  );
}

export default App;
