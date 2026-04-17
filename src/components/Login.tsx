import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Shield, Lock, ChevronRight } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface LoginProps {
  lang: Language;
  onLogin: () => void;
  onViewLogs: () => void;
}

export const Login: React.FC<LoginProps> = ({ lang, onLogin, onViewLogs }) => {
  const [loading, setLoading] = useState(false);
  const [ip, setIp] = useState('192.168.1.1');
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('');
  const cur = TRANSLATIONS[lang];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/router/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, user, password: pass })
      });
      const data = await res.json();
      if (data.success) {
        onLogin();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Connection failed. Please check your router IP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a] tech-grid">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 rounded-2xl bg-cyan-400/10 mb-4"
          >
            <img src="/logo1.svg" alt="NetGuard Pro" className="w-24 h-24" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{cur.title}</h1>
          <p className="text-cyan-400 text-sm mt-2 italic">حقك ان تعرف</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="glass-card p-1 flex items-center gap-3 px-4 focus-within:border-cyan-400/50 transition-colors">
            <Globe className="w-5 h-5 text-white/30" />
            <input 
              type="text" 
              placeholder="192.168.1.1"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="bg-transparent border-none outline-none py-3 text-sm w-full text-white placeholder:text-white/20"
            />
          </div>
          <div className="glass-card p-1 flex items-center gap-3 px-4 focus-within:border-cyan-400/50 transition-colors">
            <Shield className="w-5 h-5 text-white/30" />
            <input 
              type="text" 
              placeholder="admin"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="bg-transparent border-none outline-none py-3 text-sm w-full text-white placeholder:text-white/20"
            />
          </div>
          <div className="glass-card p-1 flex items-center gap-3 px-4 focus-within:border-cyan-400/50 transition-colors">
            <Lock className="w-5 h-5 text-white/30" />
            <input 
              type="password" 
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="bg-transparent border-none outline-none py-3 text-sm w-full text-white placeholder:text-white/20"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                {cur.login}
                <ChevronRight className={`w-5 h-5 transition-transform ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
              </>
            )}
          </button>
        </form>

        <div className="pt-8 border-t border-white/5">
          <button 
            onClick={onViewLogs}
            className="text-xs text-white/40 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <Shield className="w-4 h-4" />
            View System Logs (Public)
          </button>
        </div>
      </div>
    </div>
  );
};
