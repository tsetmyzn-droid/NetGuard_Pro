import React, { useState } from 'react';
import { 
  Wifi, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Save,
  RefreshCw,
  Globe,
  Database,
  Server
} from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { routerService } from '../services/routerService';
import { RouterSettings } from '../types';
import { cn } from '../lib/utils';
import { useTranslation } from '../contexts/LanguageContext';

const Settings: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const [settings, setSettings] = useState<RouterSettings>(routerService.getSettings());
  const [showPassword, setShowPassword] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [dnsSettings, setDnsSettings] = useState({
    primary: '8.8.8.8',
    secondary: '8.8.4.4',
    mode: 'auto'
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await routerService.updateSettings(settings);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setSettings(prev => ({ ...prev, channel: Math.floor(Math.random() * 11) + 1 }));
      setIsOptimizing(false);
    }, 3000);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">{t('router_settings')}</h2>
        <p className="text-slate-500">{t('configure_wifi')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title={t('wifi_config')}>
            <form onSubmit={handleSave} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('ssid')}</label>
                  <div className="relative">
                    <Wifi className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={settings.ssid}
                      onChange={(e) => setSettings({ ...settings, ssid: e.target.value })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('security_mode')}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={settings.securityMode}
                      onChange={(e) => setSettings({ ...settings, securityMode: e.target.value })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                    >
                      <option>WPA3-SAE</option>
                      <option>WPA2-AES</option>
                      <option>WPA2/WPA3 Mixed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{t('wifi_password')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    defaultValue="••••••••••••"
                    className="w-full pl-11 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? t('saving') : t('save_changes')}
                </button>
              </div>
            </form>
          </DashboardCard>

          <DashboardCard title={t('dns_settings')}>
            <div className="space-y-6 mt-4">
              <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                <button 
                  onClick={() => setDnsSettings({ ...dnsSettings, mode: 'auto' })}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                    dnsSettings.mode === 'auto' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                  )}
                >
                  Automatic
                </button>
                <button 
                  onClick={() => setDnsSettings({ ...dnsSettings, mode: 'manual' })}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                    dnsSettings.mode === 'manual' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                  )}
                >
                  Manual
                </button>
              </div>

              {dnsSettings.mode === 'manual' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">{t('primary_dns')}</label>
                    <div className="relative">
                      <Server className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={dnsSettings.primary}
                        onChange={(e) => setDnsSettings({ ...dnsSettings, primary: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">{t('secondary_dns')}</label>
                    <div className="relative">
                      <Server className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={dnsSettings.secondary}
                        onChange={(e) => setDnsSettings({ ...dnsSettings, secondary: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'Google', p: '8.8.8.8', s: '8.8.4.4' },
                  { name: 'Cloudflare', p: '1.1.1.1', s: '1.0.0.1' },
                  { name: 'OpenDNS', p: '208.67.222.222', s: '208.67.220.220' },
                  { name: 'AdGuard', p: '94.140.14.14', s: '94.140.15.15' }
                ].map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => setDnsSettings({ primary: provider.p, secondary: provider.s, mode: 'manual' })}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center hover:border-blue-200 hover:bg-blue-50 transition-all"
                  >
                    <div className="text-xs font-bold text-slate-900">{provider.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{provider.p}</div>
                  </button>
                ))}
              </div>
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-6">
          <DashboardCard title="Language & Region">
            <div className="space-y-4 mt-4">
              <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                <button 
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                    language === 'en' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                  )}
                >
                  <Globe className="w-4 h-4" /> English
                </button>
                <button 
                  onClick={() => setLanguage('ar')}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                    language === 'ar' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                  )}
                >
                  <Globe className="w-4 h-4" /> العربية
                </button>
              </div>
              <p className="text-[10px] text-slate-500 text-center font-medium">
                Changing language will update the interface and AI analysis.
              </p>
            </div>
          </DashboardCard>

          <DashboardCard title={t('network_optimization')}>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Zap className={cn("w-8 h-8", isOptimizing && "animate-pulse")} />
              </div>
              <h4 className="font-bold text-slate-900">{t('channel_optimizer')}</h4>
              <p className="text-xs text-slate-500 mt-2 px-4">Automatically scan and switch to the least congested Wi-Fi channel.</p>
              
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl inline-block">
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">{t('current_channel')}</span>
                <span className="text-2xl font-bold text-blue-600">{settings.channel}</span>
              </div>

              <button 
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="w-full mt-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4 h-4", isOptimizing && "animate-spin")} />
                {isOptimizing ? "Scanning..." : t('optimize_now')}
              </button>
            </div>
          </DashboardCard>

          <DashboardCard title={t('parental_controls')}>
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900">{t('access_schedule')}</div>
                  <div className="text-[10px] text-slate-400">Set time limits for devices</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-lg flex items-center justify-center group-hover:bg-purple-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900">{t('content_filter')}</div>
                  <div className="text-[10px] text-slate-400">Block restricted websites</div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Settings;
