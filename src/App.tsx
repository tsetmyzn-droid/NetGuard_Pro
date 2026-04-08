import React, { useState, useEffect } from 'react';
import { Shield, Activity, Zap, Wifi, Smartphone, RefreshCw, LogOut, Globe, AlertTriangle, Lock, User, ChevronRight, ArrowDown, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [scanning, setScanning] = useState(false);
  const [speed, setSpeed] = useState({ down: 0, up: 0 });
  const [threats, setThreats] = useState(0);
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);

  const t = {
    ar: {
      title: "حارس الشبكة برو",
      login: "تسجيل الدخول",
      routerIp: "عنوان IP الراوتر",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      connect: "اتصال بالراوتر",
      status: "حالة النظام",
      connected: "متصل",
      latency: "التأخير",
      uptime: "التشغيل",
      consumption: "استهلاك البيانات",
      shield: "الدرع الأمني",
      deepScan: "فحص عميق",
      scanning: "جاري الفحص...",
      systemSafe: "النظام آمن",
      threatsDetected: "تم اكتشاف تهديدات",
      aiAssistant: "المساعد الذكي",
      aiMsg: "الذكاء الاصطناعي يحلل شبكتك الآن... تأكد من إغلاق المنافذ غير المستخدمة لتحسين الأمان.",
      speedTest: "اختبار السرعة",
      testing: "جاري الاختبار...",
      connectedTo: "متصل بـ",
      download: "تحميل",
      upload: "رفع",
      daily: "يومي",
      monthly: "شهري"
    },
    en: {
      title: "NetGuard Pro",
      login: "Login",
      routerIp: "Router IP",
      username: "Username",
      password: "Password",
      connect: "Connect to Router",
      status: "System Status",
      connected: "Connected",
      latency: "Latency",
      uptime: "Uptime",
      consumption: "Data Consumption",
      shield: "Security Shield",
      deepScan: "Deep Scan",
      scanning: "Scanning...",
      systemSafe: "System Secure",
      threatsDetected: "Threats Detected",
      aiAssistant: "AI Assistant",
      aiMsg: "AI is analyzing your network... ensure unused ports are closed to improve security.",
      speedTest: "Speed Test",
      testing: "Testing...",
      connectedTo: "Connected to",
      download: "Download",
      upload: "Upload",
      daily: "Daily",
      monthly: "Monthly"
    }
  };

  const cur = t[lang];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsLoggedIn(true);
    }, 1000);
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setThreats(Math.floor(Math.random() * 2));
    }, 3000);
  };

  const runSpeedTest = () => {
    setIsTestingSpeed(true);
    let count = 0;
    const interval = setInterval(() => {
      setSpeed({
        down: Math.random() * 100,
        up: Math.random() * 50
      });
      count++;
      if (count > 20) {
        clearInterval(interval);
        setIsTestingSpeed(false);
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Shield className="w-12 h-12 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen bg-[#0a0a0a] tech-grid p-6 flex flex-col justify-center max-w-md mx-auto relative overflow-hidden ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="mb-12 text-center">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 rounded-2xl bg-cyan-400/10 mb-4"
          >
            <Shield className="w-12 h-12 text-cyan-400" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{cur.title}</h1>
          <p className="text-white/40 text-sm mt-2">Enterprise Network Security</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="glass-card p-1 flex items-center gap-3 px-4 focus-within:border-cyan-400/50 transition-colors">
            <Globe className="w-5 h-5 text-white/30" />
            <input 
              type="text" 
              placeholder={cur.routerIp} 
              defaultValue="192.168.1.1"
              className="bg-transparent border-none outline-none py-3 w-full text-sm"
            />
          </div>
          <div className="glass-card p-1 flex items-center gap-3 px-4 focus-within:border-cyan-400/50 transition-colors">
            <User className="w-5 h-5 text-white/30" />
            <input 
              type="text" 
              placeholder={cur.username} 
              defaultValue="admin"
              className="bg-transparent border-none outline-none py-3 w-full text-sm"
            />
          </div>
          <div className="glass-card p-1 flex items-center gap-3 px-4 focus-within:border-cyan-400/50 transition-colors">
            <Lock className="w-5 h-5 text-white/30" />
            <input 
              type="password" 
              placeholder={cur.password} 
              defaultValue="••••••••"
              className="bg-transparent border-none outline-none py-3 w-full text-sm"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>{cur.connect}</span>
            <ChevronRight className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </form>

        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="text-xs font-bold text-white/40 hover:text-cyan-400 transition-colors flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            {lang === 'ar' ? 'Switch to English' : 'تغيير للغة العربية'}
          </button>
        </div>

        {/* Background Glow */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#0a0a0a] tech-grid p-6 max-w-md mx-auto relative overflow-hidden ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-cyan-400" />
          <h1 className="text-xl font-bold tracking-tight">{cur.title}</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="p-2 glass-card hover:bg-white/10 transition-colors"
          >
            <Globe className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="p-2 glass-card hover:bg-red-500/20 transition-colors text-red-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="glass-card p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{cur.status}</span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {cur.connected}
          </span>
        </div>
        <div className="h-[1px] bg-white/10 mb-3"></div>
        <div className="grid grid-cols-2 gap-4 text-[11px] mono text-white/60">
          <div className="flex justify-between">
            <span>{cur.latency}:</span>
            <span className="text-white">24ms</span>
          </div>
          <div className="flex justify-between">
            <span>{cur.uptime}:</span>
            <span className="text-white">12h 4m</span>
          </div>
        </div>
      </div>

      {/* Detailed Consumption Card */}
      <div className="glass-card p-6 mb-6 bg-gradient-to-br from-cyan-500/10 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-white/70">{cur.consumption}</span>
          <Activity className="w-4 h-4 text-cyan-400" />
        </div>
        
        <div className="flex items-end gap-2 mb-4">
          <div className="text-4xl font-bold mono">12.45</div>
          <div className="text-sm text-white/40 mb-1 mono">GB</div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase">
              <ArrowDown className="w-3 h-3 text-green-400" />
              {cur.download}
            </div>
            <div className="text-lg font-bold mono">{speed.down.toFixed(1)} <span className="text-[10px] text-white/30">Mbps</span></div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase">
              <ArrowUp className="w-3 h-3 text-blue-400" />
              {cur.upload}
            </div>
            <div className="text-lg font-bold mono">{speed.up.toFixed(1)} <span className="text-[10px] text-white/30">Mbps</span></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[10px] mono">
            <span className="text-white/40">{cur.daily}</span>
            <span className="text-cyan-400">1.2 GB / 5 GB</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '24%' }}
              className="h-full bg-cyan-400"
            />
          </div>
          <div className="flex justify-between text-[10px] mono">
            <span className="text-white/40">{cur.monthly}</span>
            <span className="text-blue-400">45.8 GB / 200 GB</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '45%' }}
              className="h-full bg-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="glass-card p-4 mb-6 border-cyan-400/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="font-bold">{cur.shield}</span>
          </div>
          <button 
            onClick={handleScan}
            disabled={scanning}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
          >
            {scanning ? cur.scanning : cur.deepScan}
          </button>
        </div>
        <div className={`text-sm font-bold ${threats > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {threats > 0 ? `${cur.threatsDetected}: ${threats}` : cur.systemSafe}
        </div>
      </div>

      {/* AI Assistant */}
      <div className="glass-card p-4 mb-6 bg-blue-900/20 border-blue-400/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm">{cur.aiAssistant}</span>
          </div>
        </div>
        <p className="text-xs italic text-white/80 leading-relaxed">
          {cur.aiMsg}
        </p>
      </div>

      {/* Action Button */}
      <button 
        onClick={runSpeedTest}
        disabled={isTestingSpeed}
        className="w-full py-4 glass-card bg-cyan-400/10 hover:bg-cyan-400/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
      >
        <Zap className={`w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform ${isTestingSpeed ? 'animate-bounce' : ''}`} />
        <span className="font-bold">{isTestingSpeed ? cur.testing : cur.speedTest}</span>
      </button>

      <div className="mt-6 text-center">
        <span className="text-[10px] mono text-white/30 uppercase tracking-widest">
          {cur.connectedTo}: Huawei OptiXstar
        </span>
      </div>

      {/* Background Glow */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default App;
