import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ShieldCheck, Info, Clock } from 'lucide-react';
import { Language, SecurityEvent } from '../types';
import { TRANSLATIONS } from '../constants';

interface LogsProps {
  lang: Language;
}

const mockLogs: SecurityEvent[] = [
  { id: '1', timestamp: '2024-03-20 18:45:22', type: 'Intrusion', severity: 'high', description: 'Blocked brute force attempt from 185.22.41.12' },
  { id: '2', timestamp: '2024-03-20 18:30:15', type: 'System', severity: 'low', description: 'Automatic firmware update completed successfully' },
  { id: '3', timestamp: '2024-03-20 17:12:04', type: 'Anomaly', severity: 'medium', description: 'Unusual traffic spike detected on port 8080' },
  { id: '4', timestamp: '2024-03-20 16:05:33', type: 'Access', severity: 'low', description: 'New device authorized: MacBook Air (M2)' },
  { id: '5', timestamp: '2024-03-20 15:22:11', type: 'Firewall', severity: 'medium', description: 'Port scanning attempt detected and neutralized' },
];

export const Logs: React.FC<LogsProps> = ({ lang }) => {
  const cur = TRANSLATIONS[lang];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{cur.logs}</h2>
        <button className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 rounded-full border border-cyan-400/30">
          Export CSV
        </button>
      </div>

      <div className="space-y-3">
        {mockLogs.map((log) => (
          <div key={log.id} className="glass-card p-4 border-l-4 transition-transform hover:scale-[1.02]" style={{ 
            borderLeftColor: log.severity === 'high' ? '#ef4444' : log.severity === 'medium' ? '#f59e0b' : '#22d3ee'
          }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {log.severity === 'high' ? <ShieldAlert className="w-4 h-4 text-red-400" /> : 
                 log.severity === 'medium' ? <Info className="w-4 h-4 text-amber-400" /> : 
                 <ShieldCheck className="w-4 h-4 text-cyan-400" />}
                <span className="text-xs font-bold uppercase tracking-wider">{log.type}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/30">
                <Clock className="w-3 h-3" />
                {log.timestamp.split(' ')[1]}
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {log.description}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
