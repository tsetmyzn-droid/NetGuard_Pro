import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Activity, Smartphone, Laptop, Cpu, Gauge, Globe, RefreshCw, Database, Server, Link2, AlertCircle, Radio, PieChart as PieIcon, BarChart as BarIcon, TrendingUp } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { io } from 'socket.io-client';
import { useI18n } from '../lib/i18n';
import { NetGuardAPI } from '../services/api';

export const Dashboard: React.FC = () => {
  const { lang, t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [infrastructure, setInfrastructure] = useState<any[]>([]);
  const [connectedCount, setConnectedCount] = useState(0);
  const [liveTraffic, setLiveTraffic] = useState<any[]>([]);
  const [trafficStats, setTrafficStats] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [devices, stats, traffic] = await Promise.all([
        NetGuardAPI.getDevices(),
        NetGuardAPI.getStats(),
        fetch('/api/router/traffic').then(res => res.json())
      ]);
      
      setInfrastructure(devices || []);
      setConnectedCount(devices.length || 0);
      setUsageStats(stats);
      setTrafficStats(traffic);
      
      // Fetch initial live traffic
      const liveRes = await fetch('/api/router/traffic-live').then(res => res.json());
      setLiveTraffic(liveRes.slice(0, 5) || []);
    } catch (e) {
      console.error("Dashboard fetch error", e);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();

    // Socket implementation for real-time status
    const socket = io();
    
    socket.on('devices:update', (updatedNodes: any[]) => {
      setInfrastructure(updatedNodes);
      setConnectedCount(updatedNodes.length);
    });

    socket.on('traffic:packet', (packet: any) => {
      setLiveTraffic(prev => [packet, ...prev].slice(0, 5));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const hourlyData = [
    { label: '00:00', download: 400, upload: 240 },
    { label: '04:00', download: 300, upload: 139 },
    { label: '08:00', download: 800, upload: 980 },
    { label: '12:00', download: 1200, upload: 390 },
    { label: '16:00', download: 900, upload: 480 },
    { label: '20:00', download: 600, upload: 380 },
    { label: '23:59', download: 700, upload: 430 },
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
             <button 
               onClick={fetchData}
               className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-cyan-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
             >
               <RefreshCw className="w-3.5 h-3.5"/>
               {t('optimize')}
             </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Zap, color: 'text-cyan-400', label: t('connectedDevices'), value: connectedCount, status: 'STABLE', bg: 'bg-cyan-400/5' },
          { icon: Shield, color: 'text-emerald-400', label: t('protected'), value: '100%', status: 'SECURE', bg: 'bg-emerald-400/5' },
          { icon: Gauge, color: 'text-purple-400', label: t('highPrecision'), value: usageStats?.ping || '24ms', status: 'SYNCHRONIZED', bg: 'bg-purple-400/5' },
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
        {/* Real-time Traffic Analysis */}
        <div className="lg:col-span-8 glass-card p-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                {t('totalUsage')}
              </h3>
              <p className="text-xs text-white/30 font-medium mt-1 uppercase tracking-tight">Real-time throughput analysis</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('download')}</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('upload')}</span>
               </div>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="white" strokeOpacity={0.03} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill:'white', fillOpacity:0.3, fontSize:10}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill:'white', fillOpacity:0.3, fontSize:10}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px'}}
                  itemStyle={{fontSize: '11px', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="download" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorDownload)" />
                <Area type="monotone" dataKey="upload" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorUpload)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Categories - Pie Chart */}
        <div className="lg:col-span-4 glass-card p-8">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3 mb-8">
            <PieIcon className="w-4 h-4 text-purple-400" />
            {t('appUsage')}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficStats?.categories || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(trafficStats?.categories || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px'}}
                   itemStyle={{color: 'white', fontSize: '10px'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
             {trafficStats?.categories?.map((c: any) => (
                <div key={c.name} className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: c.color}} />
                   <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter truncate">{c.name}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Device Infrastructure Usage - Distribution Bar Chart */}
        <div className="lg:col-span-8 glass-card p-10">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3 mb-10">
            <BarIcon className="w-4 h-4 text-emerald-400" />
            {lang === 'ar' ? 'توزيع استهلاك الأجهزة' : 'Device Usage Distribution'}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficStats?.top_apps || []} layout="vertical">
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="white" strokeOpacity={0.03} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill:'white', fillOpacity:0.5, fontSize:10}} width={100} />
                <Tooltip cursor={{fill: 'white', fillOpacity: 0.02}} contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a'}} />
                <Bar dataKey="percentage" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Stream */}
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
      </div>

      {/* Monitored Infrastructure Nodes */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
           <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.4em]">Integrated Infrastructure Clusters</h3>
           <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-cyan-400 uppercase tracking-widest">Active Scanning</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {infrastructure.map((device, idx) => (
              <motion.div
                key={device.ip + device.mac}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-6 flex items-start gap-4 border-l-2 transition-all hover:translate-y-[-4px]"
                style={{ 
                  borderLeftColor: device.status === 'online' ? '#10b981' : device.status === 'offline' ? '#ef4444' : '#f59e0b' 
                }}
              >
                <div className={`p-3 rounded-2xl ${device.status === 'online' ? 'bg-emerald-500/10' : 'bg-red-500/10'} border border-white/5`}>
                   {device.type === 'router' || device.ip === '192.168.1.1' ? <Server className={`w-5 h-5 ${device.status === 'online' ? 'text-emerald-400' : 'text-red-400'}`} /> : <Link2 className="w-5 h-5 text-white/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                     <span className="text-xs font-black text-white uppercase tracking-wider truncate">{device.name}</span>
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
                     <span>{device.lastChecked ? new Date(device.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'SYNCING'}</span>
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
