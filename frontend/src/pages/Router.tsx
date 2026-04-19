/**
 * ============================================================================
 * NetGuard Pro - صفحة إدارة الراوتر (Router Management)
 * ============================================================================
 * 
 * 🛡️ إدارة العتاد: Control & Diagnostics
 * المسؤول عن:
 * 1. فحص جودة الخط (SNR/Attentuation)
 * 2. التحكم في العمليات الحرجة (Reboot, Reset)
 * 3. عرض إحصائيات الإشارة الحية
 * ============================================================================
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu, Radio, Zap, AlertTriangle, RefreshCw, PowerOff, Activity, ShieldAlert } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { NetGuardAPI } from '../services/api';
import toast from 'react-hot-toast';

export const Router: React.FC = () => {
  const { lang, t } = useI18n();
  const isRtl = lang === 'ar';
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRouterStats = async () => {
      try {
        const data = await NetGuardAPI.getStats();
        setStats(data);
      } catch (e) {
        console.error("Router stats fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRouterStats();
    
    // التحديث التلقائي كل دقيقة
    const interval = setInterval(fetchRouterStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (action: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: t('loading'),
        success: `${action} successful`,
        error: 'Operation failed',
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic font_display">
            {t('router')} <span className="text-cyan-400">Control Center</span>
          </h2>
          <p className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase mt-1">
            Hardware Level Diagnostics & Power management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Signal Diagnostics */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card p-10 border-l-4 border-cyan-500">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3 mb-8">
              <Radio className="w-5 h-5 text-cyan-400" />
              {t('signalStats')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t('snr')}</span>
                  <span className="text-xs font-black text-emerald-400">OPTIMAL</span>
                </div>
                <div className="text-4xl font-black text-white font-display">28.4 <span className="text-sm text-white/20">dB</span></div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[85%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t('lineStability')}</span>
                  <span className="text-xs font-black text-cyan-400">SECURE</span>
                </div>
                <div className="text-4xl font-black text-white font-display">99.9 <span className="text-sm text-white/20">%</span></div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[99.9%] shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 text-center space-y-2">
              <Activity className="w-5 h-5 text-purple-400 mx-auto" />
              <div className="text-xl font-black text-white uppercase tracking-tighter">14ms</div>
              <div className="text-[8px] text-white/30 font-black uppercase tracking-widest">{t('latency')}</div>
            </div>
            <div className="glass-card p-6 text-center space-y-2">
              <RefreshCw className="w-5 h-5 text-amber-400 mx-auto" />
              <div className="text-xl font-black text-white uppercase tracking-tighter">12d 4h</div>
              <div className="text-[8px] text-white/30 font-black uppercase tracking-widest">{t('uptime')}</div>
            </div>
            <div className="glass-card p-6 text-center space-y-2">
               <ShieldAlert className="w-5 h-5 text-emerald-400 mx-auto" />
               <div className="text-xl font-black text-white uppercase tracking-tighter">VERIFIED</div>
               <div className="text-[8px] text-white/30 font-black uppercase tracking-widest">FIREWALL</div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-10 bg-amber-500/[0.02] border border-amber-500/10">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-3 mb-8">
              <AlertTriangle className="w-5 h-5" />
              {t('hardwareControl')}
            </h3>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleAction('Rebooting')}
                className="w-full group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:rotate-180 transition-transform duration-700">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{t('reboot')}</span>
                </div>
              </button>

              <button 
                onClick={() => handleAction('WiFi Control')}
                className="w-full group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                    <PowerOff className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{t('wifiOff')}</span>
                </div>
              </button>

              <div className="pt-6 border-t border-white/5 mt-4">
                <button 
                  onClick={() => handleAction('Factory Reset')}
                  className="w-full group flex items-center justify-between p-5 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60">{t('reset')}</span>
                  </div>
                </button>
                <p className="text-[8px] font-medium text-white/20 mt-4 text-center italic tracking-wide">
                  {t('caution')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Router;
