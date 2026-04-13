import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Activity, Smartphone, Laptop, Cpu, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface DashboardProps {
  lang: Language;
}

const mockData = [
  { time: '12:00', usage: 45 },
  { time: '13:00', usage: 52 },
  { time: '14:00', usage: 48 },
  { time: '15:00', usage: 61 },
  { time: '16:00', usage: 55 },
  { time: '17:00', usage: 67 },
  { time: '18:00', usage: 59 },
];

export const Dashboard: React.FC<DashboardProps> = ({ lang }) => {
  const cur = TRANSLATIONS[lang];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{cur.secure}</span>
          </div>
          <div className="text-2xl font-bold">99.9%</div>
          <div className="text-[10px] text-white/30">Uptime Stability</div>
        </div>
        <div className="glass-card p-4 border-red-500/20">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{cur.threats}</span>
          </div>
          <div className="text-2xl font-bold">0</div>
          <div className="text-[10px] text-white/30">Active Intrusions</div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-white/70">{cur.usage}</h3>
            <p className="text-[10px] text-white/30">Real-time network traffic</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-cyan-400">12.4 MB/s</div>
            <div className="text-[10px] text-white/30">Peak: 18.2 MB/s</div>
          </div>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="usage" 
                stroke="#22d3ee" 
                fillOpacity={1} 
                fill="url(#usageGradient)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="glass-card p-4 flex flex-col items-center gap-3 hover:bg-white/5 transition-colors group">
          <div className="p-3 rounded-xl bg-cyan-400/10 text-cyan-400 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium">{cur.optimize}</span>
        </button>
        <button className="glass-card p-4 flex flex-col items-center gap-3 hover:bg-white/5 transition-colors group">
          <div className="p-3 rounded-xl bg-purple-400/10 text-purple-400 group-hover:scale-110 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium">{cur.scan}</span>
        </button>
      </div>

      {/* Connected Devices */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white/70">{cur.devices}</h3>
          <span className="px-2 py-1 rounded bg-cyan-400/10 text-cyan-400 text-[10px] font-bold">5 ACTIVE</span>
        </div>
        <div className="space-y-4">
          {[
            { name: 'iPhone 15 Pro', ip: '192.168.1.5', icon: Smartphone, usage: '2.4 GB' },
            { name: 'MacBook Air', ip: '192.168.1.12', icon: Laptop, usage: '15.8 GB' },
            { name: 'Smart TV', ip: '192.168.1.45', icon: Cpu, usage: '45.2 GB' },
          ].map((device, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <device.icon className="w-4 h-4 text-white/40" />
                </div>
                <div>
                  <div className="text-xs font-bold">{device.name}</div>
                  <div className="text-[10px] text-white/20">{device.ip}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-cyan-400">{device.usage}</div>
                <div className="text-[8px] text-green-400 font-bold uppercase">Online</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
