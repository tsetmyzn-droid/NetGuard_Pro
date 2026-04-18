import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Laptop, Cpu, Shield, ShieldOff, Search, MoreVertical, Globe, Wifi, Activity } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface Device {
  name: string;
  status: 'online' | 'offline' | 'issue';
  ip: string;
  mac: string;
  type: 'mobile' | 'pc' | 'iot';
  blocked?: boolean;
}

export const Devices: React.FC = () => {
  const { lang, t } = useI18n();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/router/devices');
      const data = await res.json();
      setDevices(data);
    } catch (e) {
      console.error("Failed to fetch devices", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const toggleBlock = async (mac: string) => {
    try {
      const res = await fetch('/api/router/devices/toggle-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac })
      });
      const data = await res.json();
      if (data.success) {
        setDevices(prev => prev.map(d => d.mac === mac ? { ...d, blocked: !d.blocked } : d));
      }
    } catch (e) {
      console.error("Failed to toggle block", e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'mobile': return Smartphone;
      case 'pc': return Laptop;
      default: return Cpu;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-10 pb-20"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter font-display uppercase italic text-white">{t('connectedDevices')}</h2>
          <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-1">Hardware Interface Registry</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search MAC/IP..."
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs text-white outline-none focus:border-cyan-500/50 transition-all font-bold placeholder:text-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {devices.map((device, i) => {
            const Icon = getIcon(device.type);
            return (
              <motion.div
                key={device.mac}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                layout
                className={`glass-card p-6 relative group overflow-hidden ${device.blocked ? 'grayscale opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-6">
                   <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-cyan-500/20 transition-all`}>
                      <Icon className={`w-6 h-6 ${device.blocked ? 'text-red-400' : 'text-cyan-400'}`} />
                   </div>
                   <div className="text-right">
                      <div className={`w-2 h-2 rounded-full ml-auto mb-2 ${device.status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{device.type}</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight truncate pr-8">{device.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <Globe className="w-3 h-3 text-white/10" />
                       <span className="text-[10px] font-mono text-white/40">{device.ip}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                     <div className="flex justify-between text-[10px] uppercase font-black tracking-widest">
                        <span className="text-white/10">MAC_ADDR</span>
                        <span className="text-white/40">{device.mac}</span>
                     </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => toggleBlock(device.mac)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                        device.blocked 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                      }`}
                    >
                      {device.blocked ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                      {device.blocked ? t('unblock') : t('block')}
                    </button>
                    <button className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                       <Activity className="w-4 h-4 text-white/30" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="glass-card p-10 bg-red-500/[0.02] border-red-500/10">
         <div className="flex items-center gap-6">
            <div className="p-4 rounded-3xl bg-red-500/10">
               <ShieldOff className="w-8 h-8 text-red-400" />
            </div>
            <div>
               <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">{t('blacklist')}</h4>
               <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">MAC Filtering Protection Layer</p>
            </div>
         </div>
      </div>
    </motion.div>
  );
};

export default Devices;
