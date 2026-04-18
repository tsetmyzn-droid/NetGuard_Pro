import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Shield, Lock, ChevronRight, Smartphone, Laptop } from 'lucide-react';
import { Language } from '../../types/index';
import { TRANSLATIONS } from '../../constants';

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
  const [error, setError] = useState<string | null>(null);
  const cur = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
        setError(data.message);
      }
    } catch (error: any) {
      setError("Connection failed. The router could not be reached.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a] tech-grid overflow-hidden relative ${isRtl ? 'rtl' : 'ltr'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Decorative Circles from Image */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-sm space-y-8 text-center relative z-10">
        <div className="flex flex-col items-center">
          <div className="relative mb-12">
            {/* Pulsing Outer Ring */}
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -inset-8 border border-cyan-400/20 rounded-full"
            />
            {/* Device Icons Cluster */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 to-transparent rounded-full shadow-[0_0_50px_rgba(34,211,238,0.2)] flex items-center justify-center border border-cyan-400/30">
                <div className="relative w-full h-full">
                   {/* Central Arrow */}
                   <motion.div 
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     className="absolute inset-0 flex items-center justify-center"
                   >
                     <div className="relative">
                        <div className="w-24 h-24 border-4 border-white/80 rounded-full flex items-center justify-center">
                           <Shield className="w-12 h-12 text-white" />
                        </div>
                        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0a0a0a] px-2 ${isRtl ? 'rotate-180' : ''}`}>
                           <ChevronRight className="w-8 h-8 text-white -rotate-90" />
                        </div>
                     </div>
                   </motion.div>
                   {/* Satellite Devices */}
                   <Smartphone className={`absolute top-1/2 ${isRtl ? 'right-4' : 'left-4'} -translate-y-1/2 w-6 h-6 text-white/40`} />
                   <Laptop className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 text-white/40" />
                   <Globe className={`absolute top-1/2 ${isRtl ? 'left-4' : 'right-4'} -translate-y-1/2 w-6 h-6 text-white/40`} />
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase mb-1">
              NetGuard Pro
            </h1>
            <p className="text-cyan-400 text-[10px] font-bold tracking-[0.3em] uppercase opacity-70 mb-8">
              {cur.rightToKnow}
            </p>
          </motion.div>
        </div>

        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleLogin} 
          className="space-y-4"
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                {error}
              </div>
              <button 
                type="button"
                onClick={onLogin}
                className="text-[9px] uppercase tracking-tighter text-red-400/60 hover:text-red-400 underline decoration-red-400/20 underline-offset-4 text-start"
              >
                {lang === 'ar' ? 'أو تابع باستخدام الوضع التجريبي (Mock Mode)' : 'Or continue with Mock Mode'}
              </button>
            </motion.div>
          )}

          <div className="glass-card p-1 flex items-center gap-3 px-4 focus-within:border-cyan-400/50 transition-colors">
            <Globe className="w-5 h-5 text-white/30 shrink-0" />
            <input 
              type="text" 
              placeholder={cur.routerIp || "192.168.1.1"}
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="bg-transparent border-none outline-none py-3 text-sm w-full text-white placeholder:text-white/20"
            />
          </div>
          <div className="glass-card p-1 flex items-center gap-3 px-4 focus-within:border-cyan-400/50 transition-colors">
            <Shield className="w-5 h-5 text-white/30 shrink-0" />
            <input 
              type="text" 
              placeholder={cur.username || "admin"}
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="bg-transparent border-none outline-none py-3 text-sm w-full text-white placeholder:text-white/20"
            />
          </div>
          <div className="glass-card p-1 flex items-center gap-3 px-4 focus-within:border-cyan-400/50 transition-colors">
            <Lock className="w-5 h-5 text-white/30 shrink-0" />
            <input 
              type="password" 
              placeholder={cur.password || "••••••••"}
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
                <ChevronRight className={`w-5 h-5 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
              </>
            )}
          </button>
        </motion.form>

        <div className="pt-8 border-t border-white/5">
          <button 
            onClick={onViewLogs}
            className="text-[10px] text-white/40 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2 mx-auto uppercase tracking-widest font-bold"
          >
            <Shield className="w-3 h-3" />
            {cur.viewSystemLogs}
          </button>
        </div>
      </div>
    </div>
  );
};
