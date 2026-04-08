import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Activity, Zap, Wifi, Smartphone, RefreshCw, LogOut, Globe, AlertTriangle, Lock, User, ChevronRight, ArrowDown, ArrowUp, History, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMobileLogin, setShowMobileLogin] = useState(false);
  const [isMobileLoggedIn, setIsMobileLoggedIn] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [scanning, setScanning] = useState(false);
  const [speed, setSpeed] = useState({ down: 0, up: 0 });
  const [threats, setThreats] = useState<any[]>([]);
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [activeTab, setActiveTab] = useState<'dash' | 'logs'>('dash');

  const usageData = useMemo(() => [
    { name: '04/01', total: 4.2 },
    { name: '04/02', total: 3.8 },
    { name: '04/03', total: 5.1 },
    { name: '04/04', total: 2.9 },
    { name: '04/05', total: 6.4 },
    { name: '04/06', total: 4.7 },
    { name: '04/07', total: 5.2 },
  ], []);

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
      threatsDetected: "تهديدات مكتشفة",
      aiAssistant: "المساعد الذكي",
      aiMsg: "الذكاء الاصطناعي يحلل شبكتك الآن... تم اكتشاف محاولة وصول غير مصرح بها من IP خارجي، يرجى تغيير كلمة مرور المسؤول.",
      speedTest: "اختبار السرعة",
      testing: "جاري الاختبار...",
      connectedTo: "متصل بـ",
      download: "تحميل",
      upload: "رفع",
      daily: "يومي",
      monthly: "شهري",
      history: "سجل الأمان",
      dashboard: "الرئيسية",
      logs: "السجلات",
      noLogs: "لا توجد سجلات أمنية حالياً",
      mitm: "هجوم رجل في المنتصف",
      dns: "اختطاف DNS",
      port: "منفذ مفتوح",
      mobileData: "بيانات الجوال",
      mobileLogin: "تسجيل دخول الجوال",
      phone: "رقم الجوال",
      back: "عودة",
      devices: "الأجهزة المتصلة",
      optimize: "تحسين الاتصال",
      encrypt: "تشفير الملفات"
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
      aiMsg: "AI is analyzing your network... unauthorized access attempt detected from external IP, please change admin password.",
      speedTest: "Speed Test",
      testing: "Testing...",
      connectedTo: "Connected to",
      download: "Download",
      upload: "Upload",
      daily: "Daily",
      monthly: "Monthly",
      history: "Security Logs",
      dashboard: "Dashboard",
      logs: "Logs",
      noLogs: "No security logs currently",
      mitm: "MITM Attack",
      dns: "DNS Hijacking",
      port: "Open Port",
      mobileData: "Mobile Data",
      mobileLogin: "Mobile Login",
      phone: "Phone Number",
      back: "Back",
      devices: "Connected Devices",
      optimize: "Optimize",
      encrypt: "Encrypt Files"
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
      const newThreats = [
        { id: 1, type: cur.port, severity: 'Medium', desc: 'Port 8080 is open' },
        { id: 2, type: cur.dns, severity: 'High', desc: 'DNS resolution mismatch' }
      ];
      setThreats(newThreats);
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

  if (showMobileLogin) {
    return (
      <div className={`min-h-screen ${lang === 'ar' ? 'font-sans' : 'font-sans'} bg-[#050505] text-white p-6 flex flex-col items-center justify-center`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#111] p-8 rounded-3xl border border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setShowMobileLogin(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ChevronRight className={lang === 'ar' ? '' : 'rotate-180'} />
            </button>
            <h2 className="text-2xl font-bold">{cur.mobileLogin}</h2>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/50">{cur.phone}</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-cyan-500 outline-none transition-colors" placeholder="05xxxxxxxx" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/50">{cur.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="password" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-cyan-500 outline-none transition-colors" placeholder="••••••••" />
              </div>
            </div>
            <button 
              onClick={() => { setIsMobileLoggedIn(true); setShowMobileLogin(false); }}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-900/20"
            >
              {cur.login}
            </button>
          </div>
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

        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#0a0a0a] tech-grid p-6 max-w-md mx-auto relative overflow-hidden pb-24 ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
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

      <AnimatePresence mode="wait">
        {activeTab === 'dash' ? (
          <motion.div
            key="dash"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Status Bar */}
            <div className="glass-card p-4">
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

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowMobileLogin(true)}
                className="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/20 rounded-2xl hover:bg-green-900/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">{cur.mobileData}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-white/30 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>
              <button className="flex items-center justify-between p-4 bg-blue-900/20 border border-blue-500/20 rounded-2xl hover:bg-blue-900/30 transition-all">
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium">{cur.devices}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-white/30 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Security Tools */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left">
                <Zap className="w-6 h-6 text-amber-400" />
                <span className="text-sm font-bold">{cur.optimize}</span>
                <span className="text-[10px] text-white/40">DNS & Proxy</span>
              </button>
              <button className="flex flex-col gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left">
                <Lock className="w-6 h-6 text-cyan-400" />
                <span className="text-sm font-bold">{cur.encrypt}</span>
                <span className="text-[10px] text-white/40">AES-256</span>
              </button>
            </div>

            {/* Detailed Consumption Card */}
            <div className="glass-card p-6 bg-gradient-to-br from-cyan-500/10 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white/70">{cur.consumption}</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              
              <div className="flex items-end gap-2 mb-6">
                <div className="text-4xl font-bold mono">12.45</div>
                <div className="text-sm text-white/40 mb-1 mono">GB</div>
              </div>

              {/* Chart */}
              <div className="h-32 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={usageData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="total" stroke="#22d3ee" fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
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
              </div>
            </div>

            {/* Security Section */}
            <div className="glass-card p-4 border-cyan-400/20">
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
              <div className={`flex items-center gap-2 text-sm font-bold ${threats.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {threats.length > 0 ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {threats.length > 0 ? `${cur.threatsDetected}: ${threats.length}` : cur.systemSafe}
              </div>
            </div>

            {/* AI Assistant */}
            <div className="glass-card p-4 bg-blue-900/20 border-blue-400/20">
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
          </motion.div>
        ) : (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              {cur.history}
            </h2>
            <div className="space-y-3">
              {threats.length > 0 ? threats.map(log => (
                <div key={log.id} className="glass-card p-4 border-l-4 border-l-red-500">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm">{log.type}</span>
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded">{log.severity}</span>
                  </div>
                  <p className="text-xs text-white/60">{log.desc}</p>
                  <div className="mt-2 text-[9px] text-white/30 mono">2026-04-08 15:30:21</div>
                </div>
              )) : (
                <div className="text-center py-12 text-white/30">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-sm">{cur.noLogs}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 text-center">
        <span className="text-[10px] mono text-white/30 uppercase tracking-widest">
          {cur.connectedTo}: Huawei OptiXstar
        </span>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md glass-card p-2 flex gap-2 z-50">
        <button 
          onClick={() => setActiveTab('dash')}
          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === 'dash' ? 'bg-cyan-400 text-black' : 'hover:bg-white/5 text-white/60'}`}
        >
          <Activity className="w-4 h-4" />
          <span className="text-xs font-bold">{cur.dashboard}</span>
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === 'logs' ? 'bg-cyan-400 text-black' : 'hover:bg-white/5 text-white/60'}`}
        >
          <History className="w-4 h-4" />
          <span className="text-xs font-bold">{cur.logs}</span>
        </button>
      </div>

      {/* Background Glow */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default App;
