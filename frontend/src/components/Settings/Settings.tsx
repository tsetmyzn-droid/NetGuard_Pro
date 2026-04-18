import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Router, 
  ShieldCheck, 
  Smartphone, 
  Trash2, 
  Plus,
  Server,
  Key,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../../types/index';
import { TRANSLATIONS } from '../../constants';

interface SettingsProps {
  lang: Language;
}

export const Settings: React.FC<SettingsProps> = ({ lang }) => {
  const cur = TRANSLATIONS[lang];
  const [showSaved, setShowSaved] = useState(false);
  const [routerConfig, setRouterConfig] = useState(() => {
    const saved = localStorage.getItem('routerConfig');
    return saved ? JSON.parse(saved) : {
      ip: '192.168.1.1',
      user: 'admin',
      pass: '••••••••'
    };
  });

  const [trustedDevices, setTrustedDevices] = useState(() => {
    const saved = localStorage.getItem('trustedDevices');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'My Private iPhone', mac: 'AA:BB:CC:DD:EE:FF' },
      { id: '2', name: 'Work Laptop', mac: '11:22:33:44:55:66' }
    ];
  });

  const handleSaveRouter = () => {
    localStorage.setItem('routerConfig', JSON.stringify(routerConfig));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const handleAddDevice = () => {
    const name = prompt(lang === 'ar' ? 'أدخل اسم الجهاز:' : 'Enter device name:');
    const mac = prompt(lang === 'ar' ? 'أدخل عنوان MAC:' : 'Enter MAC address:');
    if (name && mac) {
      const newDevices = [...trustedDevices, { id: Date.now().toString(), name, mac }];
      setTrustedDevices(newDevices);
      localStorage.setItem('trustedDevices', JSON.stringify(newDevices));
    }
  };

  const handleDeleteDevice = (id: string) => {
    const newDevices = trustedDevices.filter((d: any) => d.id !== id);
    setTrustedDevices(newDevices);
    localStorage.setItem('trustedDevices', JSON.stringify(newDevices));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white/90">{cur.settings}</h2>
        </div>
        <AnimatePresence>
          {showSaved && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 text-green-400 text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تم الحفظ' : 'Saved'}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Router Configuration Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border border-white/5 relative overflow-hidden group"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-cyan-400/10">
            <Router className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-white/90">{lang === 'ar' ? 'اتصال الراوتر' : 'Router Connection'}</h3>
            <p className="text-xs text-white/40">{lang === 'ar' ? 'تكوين معلمات الوصول الإداري' : 'Configure administrative access parameters'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 flex items-center gap-2">
              <Server className="w-3 h-3" /> {lang === 'ar' ? 'عنوان IP للبوابة' : 'Gateway IP Address'}
            </label>
            <input 
              type="text" 
              value={routerConfig.ip}
              onChange={(e) => setRouterConfig({...routerConfig, ip: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-400/50 outline-none transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> {lang === 'ar' ? 'اسم المستخدم' : 'Username'}
              </label>
              <input 
                type="text" 
                value={routerConfig.user}
                onChange={(e) => setRouterConfig({...routerConfig, user: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-400/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 flex items-center gap-2">
                <Key className="w-3 h-3" /> {lang === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <input 
                type="password" 
                value={routerConfig.pass}
                onChange={(e) => setRouterConfig({...routerConfig, pass: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-400/50 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleSaveRouter}
            className="w-full mt-4 bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            <Save className="w-4 h-4" />
            <span>{lang === 'ar' ? 'حفظ إعدادات الهاردوير' : 'Apply Hardware Configuration'}</span>
          </button>
        </div>

        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-400/5 blur-2xl rounded-full -mr-8 -mt-8" />
      </motion.div>

      {/* Trusted Devices Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 border border-white/5"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-400/10">
              <Smartphone className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-white/90">{lang === 'ar' ? 'الأجهزة الموثوقة' : 'Trusted Devices'}</h3>
              <p className="text-xs text-white/40">{lang === 'ar' ? 'القائمة البيضاء لعناوين MAC المعروفة' : 'Whitelist known MAC addresses'}</p>
            </div>
          </div>
          <button 
            onClick={handleAddDevice}
            className="p-2 hover:bg-white/5 rounded-lg border border-white/10 text-cyan-400 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {trustedDevices.map((dev: any) => (
            <div key={dev.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-cyan-400/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white/20" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white/90">{dev.name}</h4>
                  <p className="text-[10px] font-mono text-white/30 uppercase">{dev.mac}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteDevice(dev.id)}
                className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {trustedDevices.length === 0 && (
            <div className="text-center py-8 text-white/20 text-xs italic">
              {lang === 'ar' ? 'لا توجد أجهزة موثوقة مضافة حالياً' : 'No trusted devices added yet'}
            </div>
          )}
        </div>
      </motion.div>

      {/* System info */}
      <div className="flex items-center justify-center gap-2 p-4 border border-dashed border-white/10 rounded-2xl opacity-40">
        <Globe className="w-4 h-4" />
        <span className="text-[10px] uppercase font-bold tracking-[0.2em]">NetGuard Core v2.4.0-Stable</span>
      </div>
    </div>
  );
};
