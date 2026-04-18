import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Activity, Smartphone, Laptop, Cpu, Gauge, Globe, RefreshCw, Database, Server, Link2, AlertCircle, Radio } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { io } from 'socket.io-client';
import { useI18n } from '../lib/i18n';

export const Dashboard: React.FC = () => {
  const { lang, t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [infrastructure, setInfrastructure] = useState<any[]>([]);
  const [connectedCount, setConnectedCount] = useState(0);
  const [liveTraffic, setLiveTraffic] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      try {
        const [nodesRes, devicesRes, trafficRes] = await Promise.all([
          fetch('/api/devices'),
          fetch('/api/router/devices'),
          fetch('/api/router/traffic-live')
        ]);
        
        const nodes = await nodesRes.json();
        const devices = await devicesRes.json();
        const traffic = await trafficRes.json();

        setInfrastructure(nodes || []);
        setConnectedCount(devices.length || 0);
        setLiveTraffic(traffic.slice(0, 5) || []);
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();

    // Socket implementation for real-time status
    const socket = io();
    
    socket.on('devices:update', (updatedNodes: any[]) => {
      setInfrastructure(updatedNodes);
    });

    socket.on('traffic:packet', (packet: any) => {
      setLiveTraffic(prev => [packet, ...prev].slice(0, 5));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const chartData = [
    { label: '00:00', value: 400 },
    { label: '04:00', value: 300 },
    { label: '08:00', value: 800 },
    { label: '12:00', value: 1200 },
    { label: '16:00', value: 900 },
    { label: '20:00', value: 600 },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400 animate-pulse">{t('loading')}</span>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8 pb-12"
    >
      {/* Dynamic Header Section */}
      <div className="glass-card p-10 overflow-hidden group">
        <div className="scanner-line !h-[1px] !opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              <h2 className="text-4xl font-black tracking-tighter font-display uppercase italic text-white text-shadow-glow">
                {lang === 'ar' ? 'نظام الحماية النشط' : 'Active Defense System'}
              </h2>
            </div>
            <p className="text-white/40 text-sm font-medium tracking-wide">
              {lang === 'ar' ? 'رصد وتحليل تهديدات الشبكة في الوقت الفعلي' : 'Real-time network threat monitoring and analysis'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
             <div className="flex flex-col items-end px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">System Signal</span>
                <span className="text-xs font-black text-emerald-400">98.4% STABLE</span>
             </div>
             <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-cyan-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
               <RefreshCw className="w-3.5 h-3.5 animate-spin-slow"/>
               {t('optimize')}
             </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid with High-End Detailing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Zap, color: 'text-cyan-400', label: t('connectedDevices'), value: connectedCount, status: 'STABLE', bg: 'bg-cyan-400/5' },
          { icon: Shield, color: 'text-emerald-400', label: t('protected'), value: '100%', status: 'SECURE', bg: 'bg-emerald-400/5' },
          { icon: Gauge, color: 'text-purple-400', label: t('highPrecision'), value: '24ms', status: 'SYNCHRONIZED', bg: 'bg-purple-400/5' },
          { icon: Radio, color: 'text-amber-400', label: t('snr'), value: '28.4dB', status: 'OPTIMAL', bg: 'bg-amber-400/5' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className={`glass-card p-8 group hover:scale-[1.02] ${stat.bg}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[8px] font-black tracking-[0.2em] ${stat.color} mb-1 animate-pulse`}>● {stat.status}</span>
                <div className="w-12 h-[1px] bg-white/10" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-5xl font-black tracking-tighter glow-text font-display text-white">{stat.value}</div>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Traffic Stream */}
        <div className="lg:col-span-4 glass-card p-8 border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Stream
             </h3>
             <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-cyan-500 animate-ping" />
                <div className="w-1 h-1 rounded-full bg-cyan-500" />
             </div>
          </div>
          <div className="space-y-4">
             {liveTraffic.map((p, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                   <div className={`p-2 rounded-lg ${p.threatLevel === 'high' ? 'bg-red-500/20' : 'bg-cyan-500/10'}`}>
                      <Zap className={`w-3 h-3 ${p.threatLevel === 'high' ? 'text-red-400' : 'text-cyan-400'}`} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-black text-white/60 truncate uppercase">{p.protocol} Sequence</span>
                         <span className="text-[7px] font-mono text-white/20">{p.timestamp}</span>
                      </div>
                      <div className="text-[8px] text-white/20 font-mono flex items-center gap-1">
                         <span className="text-cyan-400/50">{p.source}</span>
                         <span className="mx-1">→</span>
                         <span className="text-purple-400/50">{p.destination}</span>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="lg:col-span-8 glass-card p-10 group">
          <div className="flex items-center flex-wrap justify-between gap-6 mb-10">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Activity className="w-5 h-5 text-cyan-400" />
                {t('totalUsage')}
              </h3>
              <p className="text-xs text-white/30 font-medium mt-1 uppercase tracking-tight">Data throughput analysis over 24H period</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('download')}</span>
               </div>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="white" strokeOpacity={0.03} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill:'white', fillOpacity:0.3, fontSize:10}} dy={15} />
                <Tooltip cursor={{fill: 'white', fillOpacity: 0.02}} contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a'}} />
                <Bar dataKey="value" fill="#22d3ee" radius={[6,6,0,0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Real-time Infrastructure Nodes */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.4em]">Monitored Infrastructure</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {infrastructure.map((device, idx) => (
              <motion.div
                key={device.ip}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 flex items-start gap-4 border-l-2"
                style={{ 
                  borderLeftColor: device.status === 'online' ? '#10b981' : device.status === 'offline' ? '#ef4444' : '#f59e0b' 
                }}
              >
                <div className={`p-3 rounded-2xl ${device.status === 'online' ? 'bg-emerald-500/10' : 'bg-red-500/10'} border border-white/5`}>
                   {device.ip === '192.168.1.1' ? <Server className={`w-5 h-5 ${device.status === 'online' ? 'text-emerald-400' : 'text-red-400'}`} /> : <Link2 className="w-5 h-5 text-white/40" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                     <span className="text-xs font-black text-white uppercase tracking-wider">{device.name}</span>
                     <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                       device.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                     }`}>
                       {device.status}
                     </span>
                  </div>
                  <div className="text-[10px] text-white/20 font-mono tracking-tighter mb-3">{device.ip}</div>
                  <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-white/30">
                     <div className="flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-cyan-500/50" />
                        <span>{device.latency ? `${device.latency}ms` : '--'}</span>
                     </div>
                     <span>{new Date(device.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
