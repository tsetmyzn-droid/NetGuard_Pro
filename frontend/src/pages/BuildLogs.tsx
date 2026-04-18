import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Terminal, Activity, FileText } from 'lucide-react';
import { TRANSLATIONS, Language } from '../constants';

interface BuildLogsProps {
  lang: Language;
}

export const BuildLogs: React.FC<BuildLogsProps> = ({ lang }) => {
  const [systemLogs, setSystemLogs] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const cur = TRANSLATIONS[lang];

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
    const interval = setInterval(fetchLogs, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
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
          <div className="text-[10px] text-white/20 uppercase tracking-widest">Real-time Stream</div>
        </div>
        <div className="p-4 bg-black/60 font-mono text-[10px] leading-relaxed text-cyan-400/80 h-96 overflow-y-auto whitespace-pre-wrap">
          {loading ? cur.loading : systemLogs || "No logs recorded yet."}
        </div>
      </div>

      <div className="glass-card p-6 border-cyan-400/20 bg-cyan-400/5">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-sm">{cur.diagnosticMode}</h3>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          {lang === 'ar' ? 
            'يقوم هذا السجل بالتقاط كل تفاعل بين نظام معاينة Google وخلفية التطبيق. في حالة حدوث خطأ، سيتم تسجيله هنا مع طابع زمني ومستوى خطأ للتحليل الفوري.' : 
            'This log captures every interaction between the Google Preview System and the application backend. If an error occurs, it will be recorded here with a timestamp and error level for immediate analysis.'}
        </p>
      </div>
    </motion.div>
  );
};

export default BuildLogs;
