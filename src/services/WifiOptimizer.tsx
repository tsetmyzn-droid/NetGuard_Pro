import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  BarChart2, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  Signal,
  Wifi
} from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { routerServiceV2 } from '../services/routerServiceV2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';
import { useTranslation } from '../contexts/LanguageContext';

const WifiOptimizer: React.FC = () => {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [bestChannel, setBestChannel] = useState<number | null>(null);

  const scanChannels = async () => {
    setIsScanning(true);
    // محاكاة فحص القنوات
    await new Promise(resolve => setTimeout(resolve, 3000));
    const data = Array.from({ length: 11 }, (_, i) => ({
      name: `CH ${i + 1}`,
      interference: Math.floor(Math.random() * 80) + 10,
      id: i + 1
    }));
    setChannels(data);
    const best = data.sort((a, b) => a.interference - b.interference)[0].id;
    setBestChannel(best);
    setIsScanning(false);
  };

  useEffect(() => {
    scanChannels();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('wifi_optimizer')}</h2>
          <p className="text-slate-500 dark:text-slate-400">{t('optimizer_subtitle')}</p>
        </div>
        <button 
          onClick={scanChannels}
          disabled={isScanning}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={isScanning ? "animate-spin w-5 h-5" : "w-5 h-5"} />
          {isScanning ? t('scanning_spectrum') : t('rescan_channels')}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard title={t('channel_interference')} className="lg:col-span-2">
          <div className="h-[350px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={channels}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'var(--color-dark-card, #1E293B)',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="interference" radius={[8, 8, 0, 0]}>
                  {channels.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.id === bestChannel ? '#22c55e' : entry.interference > 60 ? '#ef4444' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
              <div className="w-3 h-3 bg-green-500 rounded-full" /> {t('recommended')}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
              <div className="w-3 h-3 bg-blue-500 rounded-full" /> {t('normal')}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
              <div className="w-3 h-3 bg-red-500 rounded-full" /> {t('congested')}
            </div>
          </div>
        </DashboardCard>

        <div className="space-y-6">
          <DashboardCard title={t('optimization_result')}>
            {bestChannel ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-[24px] flex items-center justify-center mx-auto mb-4 border border-green-100 dark:border-green-900/40">
                  <Zap className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{t('channel')} {bestChannel}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{t('cleanest_channel_desc')}</p>
                <button className="w-full mt-8 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20">
                  {t('apply_to_router')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300 dark:text-slate-700">
                <Signal className="w-12 h-12 mb-4 animate-pulse" />
                <span className="font-bold">{t('analyzing')}</span>
              </div>
            )}
          </DashboardCard>

          <DashboardCard title={t('spectrum_tips')}>
            <div className="space-y-4 mt-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <Wifi className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('tip_1')}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('tip_2')}
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default WifiOptimizer;
