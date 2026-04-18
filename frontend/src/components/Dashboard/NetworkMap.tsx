import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Activity, Smartphone, Laptop, Cpu, AlertTriangle, Info, Timer, Gauge, Globe, PlayCircle, AppWindow, X, ChevronRight, Terminal } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  YAxis, 
  XAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { Language, Device } from '../../types/index';
import { TRANSLATIONS } from '../../constants';

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

  const SummaryRing = ({ value, label }: { value: string, label: string }) => {
    const val = parseFloat(value);
    const percentage = Math.min((val / 100) * 100, 100); // Mock percentage
    return (
      <div className="relative flex items-center justify-center w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={364.4}
            strokeDashoffset={364.4 - (percentage / 100) * 364.4}
            strokeLinecap="round"
            className="text-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,211,238,0.5)]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black tracking-tighter text-white">{value.split(' ')[0]}</span>
          <span className="text-[10px] font-bold text-white/40 uppercase uppercase">{label}</span>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      <p className="text-white/40 text-xs animate-pulse">{cur.loading}</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-24"
    >
      {/* Network Overview - GlassWire Style */}
      <div className="glass-card p-6 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
              <Globe className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white/90">Huawei Gateway</h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-mono text-white/40">192.168.1.1</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            {(['day', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all tracking-wider ${
                  timeRange === r ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {r === 'day' ? (lang === 'ar' ? 'يوم' : 'Day') : r === 'week' ? (lang === 'ar' ? 'أسبوع' : 'Week') : (lang === 'ar' ? 'شهر' : 'Month')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-10">
          <div className="flex flex-col gap-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400">
                <ChevronRight className="w-3 h-3 rotate-90" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{cur.download}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">38.97</span>
                <span className="text-sm font-bold text-white/20">GB</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-400">
                <ChevronRight className="w-3 h-3 -rotate-90" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{cur.upload}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">10.17</span>
                <span className="text-sm font-bold text-white/20">GB</span>
              </div>
            </div>
          </div>

          <SummaryRing 
            value={routerDevice?.stats?.monthly || '49.14 GB'} 
            label={cur.totalUsage} 
          />

            <div className={`p-3 rounded-xl bg-white/10 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1">{cur.networkOverview}</div>
              <div className="text-xl font-black text-white">49.14 <span className="text-[10px] text-white/20 uppercase tracking-tighter">GB</span></div>
            </div>
        </div>

        {/* Improved Bar Chart for Historical Usage */}
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }}
                interval={timeRange === 'day' ? 3 : timeRange === 'week' ? 0 : 5}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#111] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                        <p className="text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest">{label}</p>
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-8 rounded-full bg-cyan-400" />
                          <div>
                            <p className="text-lg font-black text-white">{payload[0].value} <span className="text-[10px] text-white/20">MB</span></p>
                            <p className="text-[9px] font-bold text-cyan-400 uppercase">Usage Spike</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#22d3ee" 
                radius={[4, 4, 0, 0]} 
                barSize={timeRange === 'day' ? 12 : 16}
                className="opacity-80 hover:opacity-100 transition-opacity"
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value > 800 ? '#f87171' : '#22d3ee'} 
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
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
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{lang === 'ar' ? 'الأمان' : 'Security'}</span>
          </div>
          <div className="text-2xl font-bold text-white/90">{cur.secure}</div>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1 h-1 rounded-full bg-green-400" />
            <span className="text-[9px] text-green-400/60 font-medium">{cur.protected}</span>
          </div>
        </div>
        
        <div className="glass-card p-5 bg-gradient-to-br from-white/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-400/10">
              <Gauge className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{lang === 'ar' ? 'الاستجابة' : 'Latency'}</span>
          </div>
          <div className="text-2xl font-bold text-white/90">24<span className="text-xs ml-1 text-white/30 font-normal">ms</span></div>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1 h-1 rounded-full bg-purple-400" />
            <span className="text-[9px] text-purple-400/60 font-medium">Ultra-low response</span>
          </div>
        </div>
      </div>

      {/* Top Apps List - Re-designed to match GlassWire */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">{cur.appUsage}</h3>
          <Info className="w-4 h-4 text-white/10" />
        </div>
        
        <div className="space-y-6">
          {traffic?.top_apps?.map((app: any, i: number) => (
            <div key={i} className="group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">
                    {app.name === 'YouTube' ? <PlayCircle className="w-5 h-5 text-red-500" /> : 
                     app.name === 'Brave' ? <Shield className="w-5 h-5 text-orange-500" /> :
                     app.name === 'TeraBox' ? <Globe className="w-5 h-5 text-cyan-400" /> :
                     <AppWindow className="w-5 h-5 text-cyan-400" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white/90">{app.name}</h4>
                    <p className="text-[10px] text-white/20 uppercase font-black">
                      {app.category === 'Streaming' ? cur.streaming : 
                       app.category === 'Browsing' ? cur.browsing :
                       app.category === 'Cloud Storage' ? cur.cloud :
                       app.category === 'App Store' ? cur.appStore : 
                       app.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-white">{app.usage}</span>
                </div>
              </div>
              <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${app.percentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                />
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-8 py-4 rounded-xl border border-white/5 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:bg-white/5 hover:text-white/40 transition-all">
          View Detail Breakdown
        </button>
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
                <h3 className="font-bold text-lg">{lang === 'ar' ? 'تفاصيل الجهاز' : 'Device Details'}</h3>
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
                      <span className="text-xs text-green-400 font-bold uppercase tracking-widest">{cur.connected}</span>
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
                        {lang === 'ar' ? (r === 'day' ? 'يوم' : r === 'week' ? 'أسبوع' : 'شهر') : r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-24 w-full" style={{ minHeight: '96px' }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                    <p className="text-[8px] text-white/30 uppercase mb-1">{lang === 'ar' ? 'يومي' : 'Daily'}</p>
                    <p className="text-xs font-bold text-cyan-400">{selectedDevice.stats?.daily}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[8px] text-white/30 uppercase mb-1">{lang === 'ar' ? 'أسبوعي' : 'Weekly'}</p>
                    <p className="text-xs font-bold text-cyan-400">{selectedDevice.stats?.weekly}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[8px] text-white/30 uppercase mb-1">{lang === 'ar' ? 'شهري' : 'Monthly'}</p>
                    <p className="text-xs font-bold text-cyan-400">{selectedDevice.stats?.monthly}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase mb-1">{lang === 'ar' ? 'عنوان IP' : 'IP Address'}</p>
                    <p className="text-sm font-mono text-cyan-400">{selectedDevice.ip}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase mb-1">{lang === 'ar' ? 'عنوان MAC' : 'MAC Address'}</p>
                    <p className="text-sm font-mono text-cyan-400">{selectedDevice.mac}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">{lang === 'ar' ? 'مستوى الأمان' : 'Security Level'}</span>
                    <span className="text-green-400 font-bold">{lang === 'ar' ? 'موثوق' : 'Trusted'}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 w-[90%]" />
                  </div>
                </div>

                <button className="w-full py-4 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors">
                  {lang === 'ar' ? 'قطع الاتصال عن الجهاز' : 'Disconnect Device'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
