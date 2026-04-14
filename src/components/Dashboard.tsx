import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Activity, Smartphone, Laptop, Cpu, AlertTriangle, Info, Timer, Gauge, Globe, PlayCircle, AppWindow, X, ChevronRight, Terminal } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Language, Device } from '../types';
import { TRANSLATIONS } from '../constants';

interface DashboardProps {
  lang: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang }) => {
  const cur = TRANSLATIONS[lang];
  const [devices, setDevices] = useState<Device[]>([]);
  const [traffic, setTraffic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devRes, trafficRes] = await Promise.all([
          fetch('/api/router/devices'),
          fetch('/api/router/traffic')
        ]);
        if (!devRes.ok || !trafficRes.ok) throw new Error("Server error");
        const devData = await devRes.json();
        const trafficData = await trafficRes.json();
        setDevices(devData || []);
        setTraffic(trafficData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const routerDevice = devices.find(d => d.type === 'router');
  const chartData = routerDevice?.stats?.chartData[timeRange] || [];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      <p className="text-white/40 text-xs animate-pulse">جاري جلب بيانات الشبكة...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-24"
    >
      {/* Network Status Header */}
      <div className="glass-card p-6 bg-white/5 border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Huawei Gateway
            </h2>
            <p className="text-xs font-mono text-cyan-400/60">192.168.1.1</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Secure</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
          <div className="flex flex-col items-center gap-1">
            <p className="text-[8px] text-white/20 uppercase">Daily</p>
            <span className="text-[10px] font-bold text-cyan-400">{routerDevice?.stats?.daily}</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-white/5">
            <p className="text-[8px] text-white/20 uppercase">Weekly</p>
            <span className="text-[10px] font-bold text-cyan-400">{routerDevice?.stats?.weekly}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[8px] text-white/20 uppercase">Monthly</p>
            <span className="text-[10px] font-bold text-cyan-400">{routerDevice?.stats?.monthly}</span>
          </div>
        </div>
      </div>

      {/* Network Pulse & Real-time Stats */}
      <div className="glass-card p-6 overflow-hidden relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Network Pulse</span>
          </div>
          <div className="flex bg-white/5 rounded-lg p-1">
            {(['day', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${
                  timeRange === r ? 'bg-cyan-400 text-black' : 'text-white/40 hover:text-white/60'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">
              {timeRange === 'day' ? 'Hourly Usage' : 'Daily Usage'}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tighter">
                {timeRange === 'day' ? routerDevice?.stats?.daily.split(' ')[0] : timeRange === 'week' ? routerDevice?.stats?.weekly.split(' ')[0] : routerDevice?.stats?.monthly.split(' ')[0]}
              </span>
              <span className="text-sm font-medium text-white/40 uppercase">
                {routerDevice?.stats?.daily.split(' ')[1]}
              </span>
            </div>
          </div>
        </div>

        <div className="h-32 w-full -mx-6 mb-[-24px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#22d3ee" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#pulseGradient)" 
                isAnimationActive={true}
                label={{ fill: 'rgba(34,211,238,0.5)', fontSize: 8, position: 'top' }}
              />
              <XAxis 
                dataKey="label" 
                hide={false} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 8 }}
                interval={timeRange === 'day' ? 3 : timeRange === 'week' ? 0 : 5}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#111] border border-white/10 p-2 rounded-lg shadow-xl">
                        <p className="text-[10px] text-white/40 mb-1">{label}</p>
                        <p className="text-xs font-bold text-cyan-400">
                          {payload[0].value} {timeRange === 'month' || routerDevice?.stats?.monthly.includes('GB') ? 'MB' : 'KB'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Grid - Command Center Style */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5 bg-gradient-to-br from-white/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-400/10">
              <Shield className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Security</span>
          </div>
          <div className="text-2xl font-bold text-white/90">Optimal</div>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1 h-1 rounded-full bg-green-400" />
            <span className="text-[9px] text-green-400/60 font-medium">No threats detected</span>
          </div>
        </div>
        
        <div className="glass-card p-5 bg-gradient-to-br from-white/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-400/10">
              <Gauge className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Latency</span>
          </div>
          <div className="text-2xl font-bold text-white/90">24<span className="text-xs ml-1 text-white/30 font-normal">ms</span></div>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1 h-1 rounded-full bg-purple-400" />
            <span className="text-[9px] text-purple-400/60 font-medium">Ultra-low response</span>
          </div>
        </div>
      </div>

      {/* Traffic Analysis - Enhanced */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Traffic Distribution</h3>
          <Info className="w-4 h-4 text-white/10" />
        </div>
        <div className="flex items-center gap-8">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={traffic?.categories || []}
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {traffic?.categories?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {traffic?.categories?.map((cat: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-white/60">{cat.name}</span>
                </div>
                <span className="font-bold">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
          <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Top Apps Usage</h4>
          {traffic?.top_apps?.map((app: any, i: number) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  {app.name === 'YouTube' ? <PlayCircle className="w-4 h-4 text-red-500" /> : <AppWindow className="w-4 h-4 text-cyan-400" />}
                </div>
                <span className="text-xs font-medium">{app.name}</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-cyan-400">{app.usage}</div>
                <div className="w-24 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${app.percentage}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Devices */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white/70">{cur.devices}</h3>
          <span className="px-2 py-1 rounded bg-cyan-400/10 text-cyan-400 text-[10px] font-bold">{devices.length} ACTIVE</span>
        </div>
        <div className="space-y-4">
          {devices.map((device, i) => (
            <motion.div 
              key={device.id || i} 
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDevice(device)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-cyan-400/10 transition-colors">
                  {device.type === 'mobile' ? <Smartphone className="w-5 h-5 text-cyan-400" /> : device.type === 'pc' ? <Laptop className="w-5 h-5 text-purple-400" /> : device.type === 'media' ? <PlayCircle className="w-5 h-5 text-amber-400" /> : <Cpu className="w-5 h-5 text-white/40" />}
                </div>
                <div>
                  <div className="text-sm font-bold group-hover:text-cyan-400 transition-colors">{device.name}</div>
                  <div className="text-[10px] text-white/20 font-mono">{device.ip}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs font-bold text-cyan-400">{device.usage}</div>
                  <div className="text-[8px] text-green-400 font-bold uppercase mt-1">Online</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-cyan-400 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Device Details Modal */}
      <AnimatePresence>
        {selectedDevice && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-md glass-card bg-[#111] border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-lg">تفاصيل الجهاز</h3>
                <button 
                  onClick={() => setSelectedDevice(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-cyan-400/10">
                      {selectedDevice.type === 'mobile' ? <Smartphone className="w-8 h-8 text-cyan-400" /> : selectedDevice.type === 'pc' ? <Laptop className="w-8 h-8 text-purple-400" /> : <Cpu className="w-8 h-8 text-amber-400" />}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{selectedDevice.name}</h4>
                      <span className="text-xs text-green-400 font-bold uppercase tracking-widest">متصل الآن</span>
                    </div>
                  </div>
                  <div className="flex bg-white/5 rounded-lg p-1">
                    {(['day', 'week', 'month'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setTimeRange(r)}
                        className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${
                          timeRange === r ? 'bg-cyan-400 text-black' : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedDevice.stats?.chartData[timeRange] || []}>
                      <XAxis 
                        dataKey="label" 
                        hide={false} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 7 }}
                        interval={timeRange === 'day' ? 5 : timeRange === 'week' ? 0 : 7}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-[#111] border border-white/10 p-1.5 rounded-md shadow-xl">
                                <p className="text-[8px] text-white/40 mb-0.5">{label}</p>
                                <p className="text-[10px] font-bold text-cyan-400">
                                  {payload[0].value} MB
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="#22d3ee20" strokeWidth={2} label={{ fill: 'rgba(34,211,238,0.5)', fontSize: 7, position: 'top' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[8px] text-white/30 uppercase mb-1">Daily</p>
                    <p className="text-xs font-bold text-cyan-400">{selectedDevice.stats?.daily}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[8px] text-white/30 uppercase mb-1">Weekly</p>
                    <p className="text-xs font-bold text-cyan-400">{selectedDevice.stats?.weekly}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[8px] text-white/30 uppercase mb-1">Monthly</p>
                    <p className="text-xs font-bold text-cyan-400">{selectedDevice.stats?.monthly}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase mb-1">IP Address</p>
                    <p className="text-sm font-mono text-cyan-400">{selectedDevice.ip}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase mb-1">MAC Address</p>
                    <p className="text-sm font-mono text-cyan-400">{selectedDevice.mac}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">مستوى الأمان</span>
                    <span className="text-green-400 font-bold">موثوق</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 w-[90%]" />
                  </div>
                </div>

                <button className="w-full py-4 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors">
                  قطع الاتصال عن الجهاز
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
