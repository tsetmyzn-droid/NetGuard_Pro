import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Moon, Sun, Lock, Network, 
  ChevronDown, AlertTriangle, LogOut, 
  Zap, ShieldAlert, History, Settings,
  DownloadCloud, UploadCloud, Database,
  Smartphone, Laptop, Tv, Monitor,
  Unlock, Lock as LockIcon, ScrollText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- App Component ---
export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    }
    return 'dark';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        onLogin={() => setIsAuthenticated(true)} 
        theme={theme} 
        toggleTheme={toggleTheme}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        error={error}
        setError={setError}
      />
    );
  }

  return <Dashboard theme={theme} toggleTheme={toggleTheme} onLogout={() => setIsAuthenticated(false)} />;
}

// --- Login Screen ---
function LoginScreen({ onLogin, theme, toggleTheme, isLoading, setIsLoading, error, setError }: any) {
  const [credentials, setCredentials] = useState({ ip: '192.168.1.1', pass: '', type: 'ZTE' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      if (credentials.pass.length > 0) {
        onLogin();
      } else {
        setError('يرجى إدخال كلمة مرور المسؤول');
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden technical-grid p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      
      <div className="absolute top-8 left-8">
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-xl glass hover:border-cyan-500/50 transition-all text-cyan-500 cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 mb-6"
          >
            <ShieldCheck size={40} />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tighter text-[var(--text)] mb-2 uppercase">NETGUARD <span className="text-cyan-500">PRO</span></h1>
          <p className="text-[var(--text-dim)] text-xs font-bold tracking-[0.2em] uppercase">Native Security Engine</p>
        </div>

        <div className="glass rounded-[32px] p-8 glow-accent">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-1">Gateway IP</label>
              <div className="relative">
                <Network className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50" size={18} />
                <input 
                  type="text" 
                  value={credentials.ip}
                  onChange={(e) => setCredentials({...credentials, ip: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/5 border border-[var(--line)] focus:border-cyan-500 focus:outline-none transition-all mono text-sm" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-1">Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  onChange={(e) => setCredentials({...credentials, pass: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/5 border border-[var(--line)] focus:border-cyan-500 focus:outline-none transition-all mono text-sm" 
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs"
                >
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              disabled={isLoading}
              className={cn(
                "w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer",
                "bg-cyan-500 text-black hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-95",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? "جاري الاتصال بالنواة..." : "إطلاق المحرك (Initiate)"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// --- Dashboard Screen ---
function Dashboard({ theme, toggleTheme, onLogout }: any) {
  const [traffic, setTraffic] = useState({ down: 8.4, up: 1.2 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTraffic({
        down: +(Math.random() * 20 + 5).toFixed(1),
        up: +(Math.random() * 5 + 0.5).toFixed(1)
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <header className="sticky top-0 z-50 glass border-b border-[var(--line)]">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 text-black flex items-center justify-center font-black">N</div>
            <h1 className="font-black tracking-tighter uppercase text-sm">NetGuard <span className="text-cyan-500">Pro</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-black/5 transition-all text-cyan-500 cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={onLogout} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="DOWNLOAD" value={`${traffic.down} Mb/s`} icon={<DownloadCloud className="text-cyan-500" />} color="cyan" />
          <StatCard label="UPLOAD" value={`${traffic.up} Mb/s`} icon={<UploadCloud className="text-purple-500" />} color="purple" />
        </div>

        <section className="flex justify-between gap-4">
          <QuickAction icon={<Zap />} label="فحص سريع" color="yellow" />
          <QuickAction icon={<ShieldAlert />} label="تأمين النطاق" color="red" />
          <QuickAction icon={<History />} label="السجلات" color="blue" />
          <QuickAction icon={<Settings />} label="الضبط" color="gray" />
        </section>

        <div className="glass p-6 rounded-3xl flex items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
            <Database size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Router Infrastructure</p>
            <h3 className="font-bold text-lg mono">192.168.1.1</h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">STATUS</p>
            <p className="text-xs font-bold text-green-500">ONLINE</p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-xl tracking-tight">Devices Discovered</h2>
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-500 text-[10px] font-black rounded-full">4 ACTIVE</span>
          </div>
          
          <div className="space-y-3">
            <DeviceItem name="Admin PC (Host)" type="pc" mac="AA:BB:CC:DD:EE:01" status="online" />
            <DeviceItem name="iPhone 15 Pro" type="phone" mac="7A:1B:9C:2D:4F:33" status="online" />
            <DeviceItem name="Smart TV - Living" type="tv" mac="02:44:88:FF:99:AA" status="online" />
            <DeviceItem name="Unknown Guest" type="unknown" mac="99:88:77:66:55:44" status="offline" />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className={cn(
      "p-6 rounded-3xl glass glow-accent relative overflow-hidden group",
      color === 'cyan' ? 'border-cyan-500/20' : 'border-purple-500/20'
    )}>
      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-center text-[10px] font-black tracking-widest opacity-60">
          {label}
          {icon}
        </div>
        <div className="text-2xl font-black mono tracking-tighter">{value}</div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, color }: any) {
  const colorMap: any = {
    yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    gray: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  return (
    <button className="flex flex-col items-center gap-3 flex-1 group cursor-pointer">
      <div className={cn(
        "w-full aspect-square rounded-2xl flex items-center justify-center transition-all group-active:scale-90",
        colorMap[color] || 'bg-gray-500'
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function DeviceItem({ name, type, mac, status }: any) {
  return (
    <div className="glass p-4 rounded-2xl flex items-center gap-4 group hover:border-cyan-500/50 transition-all cursor-pointer">
      <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center text-[var(--text-dim)] group-hover:text-cyan-500 transition-colors">
        {type === 'phone' ? <Smartphone size={20} /> : type === 'tv' ? <Tv size={20} /> : <Laptop size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm truncate">{name}</h4>
        <p className="text-[10px] mono text-[var(--text-dim)] uppercase">{mac}</p>
      </div>
      <button className={cn(
        "p-2 rounded-xl transition-all cursor-pointer",
        status === 'online' ? "text-cyan-500/40 hover:text-red-500" : "text-red-500"
      )}>
        {status === 'online' ? <Unlock size={18} /> : <LockIcon size={18} />}
      </button>
    </div>
  );
}
