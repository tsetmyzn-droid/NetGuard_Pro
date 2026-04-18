import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Globe, Moon, Shield, Save, Lock, Sun, Wifi, WifiOff, Power, RotateCcw, Zap, EyeOff, AlertCircle } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { encrypt } from '../lib/encryption';

export const Settings: React.FC = () => {
  const { lang, setLanguage, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [speedLimit, setSpeedLimit] = React.useState('unlimited');
  const [wifiPass, setWifiPass] = React.useState('');

  const handleSave = () => {
    // Commit configurations with encryption
    const encryptedPass = encrypt(wifiPass);
    console.log('Committing configurations. Encrypted WiFi pass:', encryptedPass);
    // In real app, this would be an API call
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-6xl mx-auto space-y-10 pb-20"
    >
      <div className="flex items-center gap-6">
        <div className="p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
          <SettingsIcon className="w-8 h-8 text-cyan-400 glow-text" />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tighter font-display uppercase italic text-white">{t('settings')}</h2>
          <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-1">Console System Configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card p-10 space-y-12">
            {/* Wi-Fi Settings Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Wifi className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-white">{t('wifiSettings')}</h3>
                </div>
                <span className="text-[8px] font-black text-cyan-400/40 uppercase tracking-[0.3em]">RADIO_CONFIG</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('ssid')}</label>
                  <input 
                    type="text" 
                    placeholder="NetGuard_Pro_5GHz"
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-cyan-500/50 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('wifiPass')}</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-cyan-500/50 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-4">
                   <EyeOff className="w-5 h-5 text-white/20" />
                   <span className="text-xs font-bold text-white/60">{t('hideSsid')}</span>
                </div>
                <button className="w-12 h-6 rounded-full bg-white/5 border border-white/10 relative">
                   <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white/20" />
                </button>
              </div>
            </section>

            {/* Speed Limit Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-white">{t('speedLimit')}</h3>
                </div>
                <span className="text-[8px] font-black text-purple-400/40 uppercase tracking-[0.3em]">BANDWIDTH_THROTTLE</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'mb5', label: t('mb5') },
                  { id: 'mb10', label: t('mb10') },
                  { id: 'unlimited', label: t('unlimited') }
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setSpeedLimit(item.id)}
                    className={`p-4 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 ${
                      speedLimit === item.id 
                        ? 'border-purple-500 bg-purple-500/10 text-cyan-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]' 
                        : 'border-white/5 bg-white/[0.02] text-white/30'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Hardware Control Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                    <Power className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-white">{t('hardwareControl')}</h3>
                </div>
                <span className="text-[8px] font-black text-red-400/40 uppercase tracking-[0.3em]">KERNEL_OPERATIONS</span>
              </div>

              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center gap-4">
                 <AlertCircle className="w-5 h-5 text-red-400" />
                 <p className="text-[10px] font-bold text-red-400/60 leading-relaxed">{t('caution')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col items-center gap-3 hover:bg-white/5 transition-all group">
                   <RotateCcw className="w-5 h-5 text-white/40 group-hover:text-cyan-400 group-hover:rotate-[-45deg] transition-all" />
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('reboot')}</span>
                </button>
                <button className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col items-center gap-3 hover:bg-white/5 transition-all group">
                   <Shield className="w-5 h-5 text-white/40 group-hover:text-red-400 transition-all" />
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('reset')}</span>
                </button>
                <button className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col items-center gap-3 hover:bg-white/5 transition-all group">
                   <WifiOff className="w-5 h-5 text-white/40 group-hover:text-purple-400 transition-all" />
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('wifiOff')}</span>
                </button>
              </div>
            </section>
            {/* Language Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <Globe className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-white">{t('language')}</h3>
                </div>
                <span className="text-[8px] font-black text-cyan-400/40 uppercase tracking-[0.3em]">LOCALE_SYNC</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'ar', label: 'العربية' },
                  { id: 'en', label: 'English' }
                ].map((item) => (
                  <button 
                    key={item.id}
                    className={`p-6 rounded-2xl border transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 relative group overflow-hidden ${
                      lang === item.id 
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
                        : 'border-white/5 bg-white/[0.02] text-white/30 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {lang === item.id && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-500 rounded-full" />}
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Theme Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <Moon className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-white">{t('theme')}</h3>
                </div>
                <span className="text-[8px] font-black text-purple-400/40 uppercase tracking-[0.3em]">VISUAL_ENGINE</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'dark', label: 'Dark Protocol', icon: Moon },
                  { id: 'light', label: 'Light Protocol', icon: Sun }
                ].map((item) => (
                  <button 
                    key={item.id}
                    className={`p-6 rounded-2xl border transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 relative group overflow-hidden ${
                      item.id === 'dark' 
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
                        : 'border-white/5 bg-white/[0.02] text-white/30 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.id === 'dark' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-500 rounded-full" />}
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Security Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <Lock className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-white">{t('security')}</h3>
                </div>
                <span className="text-[8px] font-black text-red-400/40 uppercase tracking-[0.3em]">SECURE_AUTH</span>
              </div>
              <div className="space-y-4">
                <div className="relative group">
                  <input 
                    type="password" 
                    placeholder={t('changePass')}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-white/[0.04] transition-all font-bold placeholder:text-white/10"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-cyan-500 uppercase tracking-widest opacity-0 group-focus-within:opacity-100 transition-opacity">
                    Edit Requested
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-6">
              <button 
                onClick={handleSave}
                className="w-full py-6 rounded-2xl bg-cyan-500 text-black font-black flex items-center justify-center gap-3 hover:bg-cyan-400 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)]"
              >
                <Save className="w-6 h-6" />
                <span className="uppercase tracking-[0.2em] text-xs">Commit Configurations</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6 text-white">
          <div className="glass-card p-8 border-cyan-500/20 bg-cyan-500/[0.02]">
             <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-4">{t('signalStats')}</h4>
             <div className="space-y-4">
                {[
                  { label: t('snr'), value: '28.4 dB', color: 'text-emerald-400' },
                  { label: t('lineStability'), value: '99.9%', color: 'text-cyan-400' },
                  { label: 'Attainable Rate', value: '112 Mb/s', color: 'text-white' },
                  { label: 'CRC Errors', value: '0', color: 'text-emerald-400' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-[10px] font-bold text-white/20 uppercase">{item.label}</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${item.color}`}>{item.value}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="glass-card p-8 bg-purple-500/[0.02] border-purple-500/20">
             <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-4">Billing Integration (WE)</h4>
             <div className="space-y-6">
                <div className="space-y-1">
                   <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                      <span className="text-white/40">{t('remainingData')}</span>
                      <span className="text-purple-400 font-display italic">142.4 GB / 250 GB</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[57%] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                   </div>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-bold text-white/20 uppercase">{t('renewalDate')}</span>
                   <span className="text-[10px] font-black text-white uppercase tracking-wider">Oct 12, 2026</span>
                </div>
             </div>
          </div>

          <div className="glass-card p-8 border-cyan-500/20 bg-cyan-500/[0.02]">
             <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-4">System Integrity</h4>
             <div className="space-y-4">
                {[
                  { label: 'Kernel Version', value: '1.0.4' },
                  { label: 'Security Layer', value: 'Active' },
                  { label: 'Uptime', value: '142h 22m' },
                  { label: 'Protocol', value: 'GTP-Alpha' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-[10px] font-bold text-white/20 uppercase">{item.label}</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{item.value}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="glass-card p-10 flex flex-col items-center justify-center text-center gap-4">
            <Shield className="w-12 h-12 text-white/5" />
            <p className="text-[9px] font-medium text-white/20 uppercase max-w-[140px]">All changes require authenticated session authorization</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
