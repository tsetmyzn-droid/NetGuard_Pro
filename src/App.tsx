import React, { useState, useEffect } from 'react';
import { Shield, Activity, Zap, Wifi, Smartphone, RefreshCw, LogOut, Globe, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [threats, setThreats] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setThreats(Math.floor(Math.random() * 2));
    }, 3000);
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] tech-grid p-6 max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-cyan-400" />
          <h1 className="text-xl font-bold tracking-tight">حارس الشبكة برو</h1>
        </div>
        <div className="flex gap-2">
          <button className="p-2 glass-card hover:bg-white/10 transition-colors">
            <Globe className="w-5 h-5" />
          </button>
          <button className="p-2 glass-card hover:bg-red-500/20 transition-colors text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="glass-card p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">حالة النظام</span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            متصل
          </span>
        </div>
        <div className="h-[1px] bg-white/10 mb-3"></div>
        <div className="grid grid-cols-2 gap-4 text-[11px] mono text-white/60">
          <div className="flex justify-between">
            <span>التأخير:</span>
            <span className="text-white">24ms</span>
          </div>
          <div className="flex justify-between">
            <span>التشغيل:</span>
            <span className="text-white">12h 4m</span>
          </div>
        </div>
      </div>

      {/* Consumption Card */}
      <div className="glass-card p-6 mb-6 bg-gradient-to-br from-cyan-500/10 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-white/70">استهلاك البيانات</span>
          <Activity className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-4xl font-bold mono mb-2">0.00 GB</div>
        <div className="text-sm text-cyan-400 mono mb-4">↓ {speed.toFixed(1)} Mbps</div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '35%' }}
            className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
          />
        </div>
      </div>

      {/* Security Section */}
      <div className="glass-card p-4 mb-6 border-cyan-400/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="font-bold">الدرع الأمني</span>
          </div>
          <button 
            onClick={handleScan}
            disabled={scanning}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
          >
            {scanning ? 'جاري الفحص...' : 'فحص عميق'}
          </button>
        </div>
        <div className={`text-sm font-bold ${threats > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {threats > 0 ? `تم اكتشاف ${threats} تهديدات` : 'النظام آمن'}
        </div>
      </div>

      {/* AI Assistant */}
      <div className="glass-card p-4 mb-6 bg-blue-900/20 border-blue-400/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm">المساعد الذكي</span>
          </div>
          <button className="p-1 hover:bg-white/5 rounded">
            <RefreshCw className="w-3 h-3 text-white/50" />
          </button>
        </div>
        <p className="text-xs italic text-white/80 leading-relaxed">
          الذكاء الاصطناعي يحلل شبكتك الآن... تأكد من إغلاق المنافذ غير المستخدمة لتحسين الأمان.
        </p>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => setSpeed(Math.random() * 50 + 10)}
        className="w-full py-4 glass-card bg-cyan-400/10 hover:bg-cyan-400/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
      >
        <Zap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
        <span className="font-bold">اختبار السرعة</span>
      </button>

      <div className="mt-6 text-center">
        <span className="text-[10px] mono text-white/30 uppercase tracking-widest">
          متصل بـ: Generic Router
        </span>
      </div>

      {/* Background Glow */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default App;
