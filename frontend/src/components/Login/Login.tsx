import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Shield, Lock, ChevronRight, Smartphone, Laptop, RefreshCw } from 'lucide-react';
import { Language } from '../../types/index';
import { TRANSLATIONS } from '../../constants';

interface LoginProps {
  lang: Language;
  onLogin: () => void;
  onViewLogs: () => void;
}

export const Login: React.FC<LoginProps> = ({ lang, onLogin, onViewLogs }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [ip, setIp] = useState('192.168.1.1');
  const [detecting, setDetecting] = useState(false);
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAutoDetect = async () => {
    setDetecting(true);
    setStatus(lang === 'ar' ? 'جاري البحث عن أجهزة الراوتر...' : 'Scanning for router hardware...');
    try {
      const res = await fetch('/api/router/detect', { method: 'POST' });
      const data = await res.json();
      if (data && data.length > 0) {
        setIp(data[0].ip);
        setStatus(lang === 'ar' ? `تم اكتشاف: ${data[0].brand}` : `Hardware found: ${data[0].brand}`);
        setTimeout(() => setStatus(null), 2000);
      } else {
        setError(lang === 'ar' ? 'لم يتم العثور على أجهزة نشطة' : 'No active hardware detected');
      }
    } catch (e) {
      setError("Detection probe failed.");
    } finally {
      setDetecting(false);
    }
  };
  const cur = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(lang === 'ar' ? 'جاري فحص الشبكة...' : 'Probing network...');
    
    // Status rotation for better UX
    const statusIdx = { val: 0 };
    const statuses = lang === 'ar' 
      ? ['جاري فحص الشبكة...', 'محاولة الاتصال بالراوتر...', 'انتظار استجابة البوابة...', 'تحليل بروتوكول الأمان...']
      : ['Probing network...', 'Attempting router handshake...', 'Waiting for gateway response...', 'Analyzing security protocol...'];
    
    const statusInterval = setInterval(() => {
      statusIdx.val = (statusIdx.val + 1) % statuses.length;
      setStatus(statuses[statusIdx.val]);
    }, 2500);

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
      setStatus(null);
      clearInterval(statusInterval);
    }
  };

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a] tech-grid overflow-hidden relative ${isRtl ? 'rtl' : 'ltr'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-700/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-sm space-y-10 text-center relative z-10">
        <div className="flex flex-col items-center">
          <div className="relative mb-8 group">
            {/* Pulsing Outer Ratios */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-12 border border-dashed border-cyan-400/10 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-6 border border-dotted border-white/5 rounded-full"
            />
            
            {/* Main Terminal Icon */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-purple-400/10 rounded-3xl rotate-12 group-hover:rotate-45 transition-transform duration-700 border border-white/10" />
              <div className="absolute inset-0 bg-[#111] rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
                <Shield className="w-16 h-16 text-cyan-400 glow-text" />
                <div className="scanner-line !h-[1px]" />
              </div>
            </div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-1"
          >
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase font-display italic">
              NetGuard <span className="text-cyan-400">Pro</span>
            </h1>
            <p className="text-cyan-400/40 text-[9px] font-black tracking-[0.5em] uppercase">
              Secure Gateway Protocol Alpha
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider flex flex-col gap-2 backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {error}
              </div>
              <button 
                type="button"
                onClick={onLogin}
                className="text-[9px] text-red-300 hover:text-white transition-colors underline decoration-red-500/30 underline-offset-4"
              >
                {lang === 'ar' ? 'أو تابع باستخدام الوضع التجريبي (Mock Mode)' : 'Force Authorization (Demo Mode)'}
              </button>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="glass-card bg-white/5 flex items-center gap-4 px-6 focus-within:border-cyan-500/50 transition-all">
              <Globe className="w-5 h-5 text-cyan-400 group-focus-within:animate-pulse" />
              <div className="flex-1 text-right py-4">
                <label className="block text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Gateway IP</label>
                <input 
                  type="text" 
                  placeholder="192.168.1.1"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/10 font-bold"
                />
              </div>
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={detecting}
                className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
                title="Auto Detect"
              >
                <RefreshCw className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="glass-card bg-white/5 flex items-center gap-4 px-6 focus-within:border-cyan-500/50 transition-all">
              <Shield className="w-5 h-5 text-cyan-400" />
              <div className="flex-1 text-right py-4">
                <label className="block text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Authentication ID</label>
                <input 
                  type="text" 
                  placeholder="admin"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/10 font-bold"
                />
              </div>
            </div>

            <div className="glass-card bg-white/5 flex items-center gap-4 px-6 focus-within:border-cyan-500/50 transition-all">
              <Lock className="w-5 h-5 text-cyan-400" />
              <div className="flex-1 text-right py-4">
                <label className="block text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Pass-Key</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/10 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-5 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 group disabled:opacity-80 relative overflow-hidden active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
                </>
              ) : (
                <span className="uppercase tracking-[0.2em] text-xs px-8">Authenticate Session</span>
              )}
            </button>

            <button 
              type="button"
              onClick={onLogin}
              className="w-full bg-white/5 hover:bg-white/10 text-white/40 font-black py-4 rounded-2xl transition-all border border-white/10 text-[10px] uppercase tracking-[0.2em] hover:text-white"
            >
              {lang === 'ar' ? 'تخطي والبدء بالوضع التجريبي' : 'Initialize Bypass Mode'}
            </button>
          </div>
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
