import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Activity, Smartphone, Laptop, Cpu, Gauge, Globe, RefreshCw, Database } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { TRANSLATIONS, Language } from '../constants';

interface DashboardProps {
  lang: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang }) => {
  const cur = TRANSLATIONS[lang];
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    // Simulated or real fetch
    const fetchData = async () => {
      try {
        const res = await fetch('/api/devices');
        const data = await res.json();
        setDevices(data || []);
      } catch (e) {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const chartData = [
    { label: '00:00', value: 400 },
    { label: '04:00', value: 300 },
    { label: '08:00', value: 800 },
    { label: '12:00', value: 1200 },
    { label: '16:00', value: 900 },
    { label: '20:00', value: 600 },
  ];

  if (loading) return <div className="p-8 text-center text-white/40">Loading Dashboard...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Welcome */}
      <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black">{lang === 'ar' ? 'نظرة عامة على الشبكة' : 'Network Overview'}</h2>
          <p className="text-white/40">{lang === 'ar' ? 'نظامك محمي بالكامل' : 'Your system is fully protected'}</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs"><RefreshCw className="w-4 h-4"/>{cur.optimize}</button>
           <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs"><Database className="w-4 h-4 text-cyan-400"/>{cur.scan}</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
           <div className="flex items-center justify-between mb-2">
             <Zap className="w-5 h-5 text-cyan-400" />
             <span className="text-[10px] font-black text-cyan-400">ONLINE</span>
           </div>
           <div className="text-3xl font-black">{devices.length}</div>
           <p className="text-[10px] text-white/20 uppercase">{cur.connectedDevices}</p>
        </div>
        <div className="glass-card p-6">
           <div className="flex items-center justify-between mb-2">
             <Shield className="w-5 h-5 text-green-400" />
             <span className="text-[10px] font-black text-green-400">{cur.secure}</span>
           </div>
           <div className="text-3xl font-black">100%</div>
           <p className="text-[10px] text-white/20 uppercase">{cur.protected}</p>
        </div>
        <div className="glass-card p-6">
           <div className="flex items-center justify-between mb-2">
             <Gauge className="w-5 h-5 text-purple-400" />
             <span className="text-[10px] font-black text-purple-400">LATENCY</span>
           </div>
           <div className="text-3xl font-black">24ms</div>
           <p className="text-[10px] text-white/20 uppercase">{cur.highPrecision}</p>
        </div>
      </div>

      {/* Traffic Chart */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-black text-white/70 uppercase mb-6 tracking-widest">{cur.totalUsage}</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white" strokeOpacity={0.05} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill:'white', fillOpacity:0.2, fontSize:10}} />
              <Tooltip 
                cursor={{fill: 'white', fillOpacity: 0.05}}
                contentStyle={{backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}}
              />
              <Bar dataKey="value" fill="#22d3ee" radius={[4,4,0,0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
