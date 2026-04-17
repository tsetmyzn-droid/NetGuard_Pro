import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Terminal, CheckCircle, XCircle, Clock, FileText, Activity } from 'lucide-react';
import { Language } from '../types';

interface BuildLogsProps {
  lang: Language;
}

export const BuildLogs: React.FC<BuildLogsProps> = ({ lang }) => {
  const [systemLogs, setSystemLogs] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    const interval = setInterval(fetchLogs, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-24"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          System & Build Logs
        </h2>
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Live Audit</span>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-cyan-400" />
            <div className="text-xs font-bold">system.log</div>
          </div>
          <div className="text-[10px] text-white/20 uppercase tracking-widest">Real-time Stream</div>
        </div>
        <div className="p-4 bg-black/60 font-mono text-[10px] leading-relaxed text-cyan-400/80 h-96 overflow-y-auto whitespace-pre-wrap">
          {loading ? "Loading system logs..." : systemLogs || "No logs recorded yet."}
        </div>
      </div>

      <div className="glass-card p-6 border-cyan-400/20 bg-cyan-400/5">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-sm">Diagnostic Mode</h3>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          This log captures every interaction between the Google Preview System and the application backend. 
          If an error occurs, it will be recorded here with a timestamp and error level for immediate analysis.
        </p>
      </div>
    </motion.div>
  );
};
