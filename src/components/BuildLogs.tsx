import React from 'react';
import { motion } from 'motion/react';
import { Terminal, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { Language } from '../types';

interface BuildLogsProps {
  lang: Language;
}

export const BuildLogs: React.FC<BuildLogsProps> = ({ lang }) => {
  const mockLogs = [
    {
      id: 'build-124',
      timestamp: '2026-04-14 09:45:12',
      status: 'success',
      duration: '42s',
      output: '[INFO] Starting build...\n[INFO] Compiling TypeScript...\n[INFO] Building assets...\n[SUCCESS] Build completed in 42s.'
    },
    {
      id: 'build-123',
      timestamp: '2026-04-14 09:30:05',
      status: 'failed',
      duration: '15s',
      output: '[INFO] Starting build...\n[ERROR] Missing parameter name at index 1: *\n[ERROR] Build failed.'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-24"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          Build History
        </h2>
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">System Logs</span>
      </div>

      <div className="space-y-4">
        {mockLogs.map((log) => (
          <div key={log.id} className="glass-card overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                {log.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <div>
                  <div className="text-xs font-bold">{log.id}</div>
                  <div className="text-[10px] text-white/20 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {log.timestamp}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-[10px] font-bold uppercase tracking-widest ${log.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {log.status}
                </div>
                <div className="text-[10px] text-white/20">{log.duration}</div>
              </div>
            </div>
            <div className="p-4 bg-black/40 font-mono text-[10px] leading-relaxed text-white/60 whitespace-pre-wrap">
              {log.output}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 border-cyan-400/20 bg-cyan-400/5">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-sm">Log Persistence</h3>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          All build reports are automatically saved to the <code className="text-cyan-400">/build_logs</code> directory. 
          You can review these files to diagnose deployment issues or track system changes.
        </p>
      </div>
    </motion.div>
  );
};
