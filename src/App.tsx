import React, { useState, useEffect } from 'react';
import { Globe, LogOut } from 'lucide-react';
import { View, Language } from './types';
import { TRANSLATIONS } from './constants';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Logs } from './components/Logs';
import { Navigation } from './components/Navigation';

function App() {
  const [view, setView] = useState<View>('login');
  const [lang, setLang] = useState<Language>('ar');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
  };

  const cur = TRANSLATIONS[lang];

  if (!isLoggedIn) {
    return <Login lang={lang} onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen bg-[#0a0a0a] tech-grid p-6 max-w-md mx-auto relative overflow-hidden pb-24 ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img src="/logo1.svg" alt="Logo" className="w-10 h-10" referrerPolicy="no-referrer" />
          <h1 className="text-xl font-bold tracking-tight">{cur.title}</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleLang}
            className="p-2 glass-card hover:bg-white/10 transition-colors"
          >
            <Globe className="w-5 h-5 text-cyan-400" />
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 glass-card hover:bg-red-500/10 transition-colors text-red-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {view === 'dashboard' && <Dashboard lang={lang} />}
        {view === 'logs' && <Logs lang={lang} />}
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
