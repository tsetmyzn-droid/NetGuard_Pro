import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Activity, FileText, AlertCircle, X } from 'lucide-react';
import { TRANSLATIONS, Language } from '../constants';
import { io } from 'socket.io-client';

interface BuildLogsProps {
  lang: Language;
}

export const BuildLogs: React.FC<BuildLogsProps> = ({ lang }) => {
  const [systemLogs, setSystemLogs] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const cur = TRANSLATIONS[lang];

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 relative"
    >
      {/* Toast Notifications */}
      <div className="fixed top-24 right-8 z-[100] flex flex-col gap-3 max-w-xs w-full">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="p-4 rounded-2xl bg-red-500/90 backdrop-blur-md text-white shadow-2xl border border-white/20 flex gap-4 items-start"
            >
              <div className="p-2 rounded-xl bg-white/20">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">System Error</div>
                <div className="text-xs font-bold leading-relaxed">{n.message}</div>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
            <Terminal className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black">{cur.build_logs}</h2>
            <p className="text-white/40 text-sm">{cur.liveAudit}</p>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-cyan-400" />
            <div className="text-xs font-bold">system.log</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <div className="text-[10px] text-white/20 uppercase tracking-widest">Real-time Stream</div>
          </div>
        </div>
        <div className="p-4 bg-black/60 font-mono text-[10px] leading-relaxed text-cyan-400/80 h-[500px] overflow-y-auto whitespace-pre-wrap">
          {loading ? cur.loading : systemLogs || "No logs recorded yet."}
          <div ref={logEndRef} />
        </div>
      </div>

      <div className="glass-card p-6 border-cyan-400/20 bg-cyan-400/5">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-sm">{cur.diagnosticMode}</h3>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          {lang === 'ar' ? 
            'يقوم هذا السجل بالتقاط كل تفاعل في الوقت الفعلي. ستتلقى إشعاراً مرئياً فور حدوث استثناء أو خطأ تقني.' : 
            'This log captures every interaction in real-time. You will receive a visual notification immediately when an exception or technical error occurs.'}
        </p>
      </div>
    </motion.div>
  );
};

export default BuildLogs;
