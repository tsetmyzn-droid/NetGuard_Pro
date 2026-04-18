import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Activity, FileText, AlertCircle, X, Shield } from 'lucide-react';
import { TRANSLATIONS, Language } from '../constants';
import { io } from 'socket.io-client';
import { useI18n } from '../lib/i18n';

interface BuildLogsProps {
  onViewChange?: (view: string) => void;
  isLoggedIn?: boolean;
}

export const BuildLogs: React.FC<BuildLogsProps> = ({ onViewChange, isLoggedIn }) => {
  const [systemLogs, setSystemLogs] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const { lang, t } = useI18n();

  useEffect(() => {
    // Initial fetch
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/system/logs');
        const data = await res.text();
        setSystemLogs(data);
      } catch (error) {
        console.error("Failed to fetch system logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();

    // Socket implementation
    const socket = io();
    
    socket.on('system:log', (log) => {
      const entry = `[${log.timestamp}] [${log.level}] ${log.message}\n`;
      setSystemLogs(prev => prev + entry);
      
      // Error Notification
      if (log.level === 'ERROR') {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message: log.message }]);
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [systemLogs]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 relative pb-20"
    >
      {/* Immersive Error Notifications (Toast System) */}
      <div className="fixed top-24 right-8 z-[100] flex flex-col gap-4 max-w-sm w-full">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 100, scale: 0.9, rotate: 5 }}
              animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 50, transition: { duration: 0.2 } }}
              className="p-6 rounded-3xl bg-red-600/10 backdrop-blur-2xl text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-red-500/30 flex gap-5 items-start overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
              <div className="absolute top-0 right-0 p-1 bg-red-500/20 rounded-bl-xl text-[8px] font-black uppercase tracking-widest text-red-100">CRITICAL</div>
              
              <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/30 relative z-10">
                <AlertCircle className="w-6 h-6 text-red-400 glow-text" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-1">Security Alert</div>
                <div className="text-xs font-bold leading-relaxed text-white/90">{n.message}</div>
                <div className="mt-3 h-1 w-full bg-red-500/10 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: '100%' }}
                     animate={{ width: 0 }}
                     transition={{ duration: 5 }}
                     className="h-full bg-red-500" 
                   />
                </div>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors relative z-10"
              >
                <X className="w-5 h-5 text-white/20 hover:text-white" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
            <Terminal className="w-8 h-8 text-cyan-400 glow-text" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter font-display uppercase italic text-white">{t('build_logs')}</h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mt-1">{t('liveAudit')}</p>
          </div>
        </div>
        {!isLoggedIn && onViewChange && (
           <button 
             onClick={() => onViewChange('dashboard')}
             className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-cyan-500 hover:text-black transition-all text-xs font-black uppercase tracking-widest shadow-xl active:scale-95"
           >
             <Shield className="w-4 h-4" />
             {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Authorize Session'}
           </button>
        )}
      </div>

      {/* Professional Terminal Display */}
      <div className="glass-card shadow-2xl relative">
        <div className="absolute inset-x-0 h-10 top-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
               <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
               <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30" />
            </div>
            <div className="w-px h-4 bg-white/10 mx-2" />
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400/60" />
              <div className="text-[10px] font-black uppercase tracking-widest text-white/40">kernel.stream.sys</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em]">Buffer Strategy</span>
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">REAL_TIME_PULL</span>
             </div>
             <div className="w-px h-8 bg-white/5" />
             <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,211,238,1)]" />
                <div className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.2em]">Live</div>
             </div>
          </div>
        </div>
        
        <div className="relative">
          {/* Virtual Line Numbers & Log Container */}
          <div className="bg-[#050505]/80 backdrop-blur-3xl font-mono text-[11px] leading-relaxed text-cyan-500/70 h-[600px] overflow-y-auto whitespace-pre-wrap p-8 selection:bg-cyan-500 selection:text-black relative custom-terminal-scroll">
            <div className="scanner-line !h-2 !opacity-5" />
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
                <div className="w-10 h-10 border-2 border-white/5 border-t-cyan-500 rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">{t('loading')}</span>
              </div>
            ) : (
              <div className="space-y-1">
                {systemLogs ? systemLogs : "SYS_INIT_SEQUENCE: READY\nWAITING_FOR_ENTRIES...\n"}
                <span className="inline-block w-2 h-4 bg-cyan-500/50 animate-pulse ml-1 align-middle" />
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-10 flex flex-col gap-6 relative overflow-hidden group">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -right-20 -bottom-20 w-40 h-40 border border-white/5 rounded-full pointer-events-none group-hover:border-cyan-500/10 transition-colors"
          />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-black text-xs uppercase tracking-widest text-white">{t('diagnosticMode')}</h3>
          </div>
          <p className="text-xs text-white/30 leading-relaxed font-medium">
            {lang === 'ar' ? 
              'يقوم هذا السجل بالتقاط كل تفاعل في الوقت الفعلي. ستتلقى إشعاراً مرئياً فور حدوث استثناء أو خطأ تقني للحفاظ على سلامة النظام.' : 
              'This log captures every interaction in real-time. You will receive a visual notification immediately when an exception or technical error occurs to maintain system integrity.'}
          </p>
        </div>

        <div className="glass-card p-10 flex flex-col justify-between items-start">
           <div className="space-y-2">
              <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Stream Metadata</div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/10 uppercase mb-1">Source ID</span>
                    <span className="text-[10px] font-bold text-white/60">NODE_SRV_01</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/10 uppercase mb-1">Encoding</span>
                    <span className="text-[10px] font-bold text-white/60">UTF-8/JSON</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/10 uppercase mb-1">Frequency</span>
                    <span className="text-[10px] font-bold text-white/60">STAGGERED_PULL</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/10 uppercase mb-1">Auth Level</span>
                    <span className="text-[10px] font-bold text-white/60">SYSTEM_READER</span>
                 </div>
              </div>
           </div>
           <div className="w-full h-px bg-white/5 my-6" />
           <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-1/3 h-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"
                 />
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BuildLogs;
