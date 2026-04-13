import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Shield, Lock, ChevronRight } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface LoginProps {
  lang: Language;
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ lang, onLogin }) => {
  const [loading, setLoading] = useState(false);
  const cur = TRANSLATIONS[lang];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
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
              className="bg-transparent border-none outline-none py-3 text-sm w-full text-white placeholder:text-white/20"
              defaultValue="192.168.1.1"
            />
          </div>
          <div className="glass-card p-1 flex items-center gap-3 px-4 focus-within:border-cyan-400/50 transition-colors">
            <Shield className="w-5 h-5 text-white/30" />
            <input 
              type="text" 
              placeholder="admin"
              className="bg-transparent border-none outline-none py-3 text-sm w-full text-white placeholder:text-white/20"
              defaultValue="admin"
            />
          </div>
          <div className="glass-card p-1 flex items-center gap-3 px-4 focus-within:border-cyan-400/50 transition-colors">
            <Lock className="w-5 h-5 text-white/30" />
            <input 
              type="password" 
              placeholder="••••••••"
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
      </div>
    </div>
  );
};
