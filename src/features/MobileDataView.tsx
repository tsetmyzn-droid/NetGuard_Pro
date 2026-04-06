import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Signal, 
  Globe, 
  Zap, 
  Clock, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Activity,
  AlertCircle
} from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { mobileDataService } from '../services/mobileDataService';
import { MobileDataStats } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

const MobileDataView: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<MobileDataStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await mobileDataService.getStats();
      setStats(data);
      setIsLoading(false);
    };
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const usagePercentage = (stats.dataPlanUsed / stats.dataPlanLimit) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title={t('operator')} 
          subtitle={t('signal_strength')} 
          icon={<Signal className={stats.signalStrength > 50 ? "text-green-500" : "text-yellow-500"} />}
        >
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.operatorName}</span>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`w-1 h-3 rounded-full ${i <= Math.ceil(stats.signalStrength / 25) ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">{stats.signalStrength}%</span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard 
          title={t('data_plan')} 
          subtitle={t('used')} 
          icon={<Globe className="text-blue-500" />}
        >
          <div className="mt-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.dataPlanUsed.toFixed(1)}</span>
            <span className="text-slate-400 dark:text-slate-500 ml-1 font-medium">/ {stats.dataPlanLimit} GB</span>
          </div>
        </DashboardCard>

        <DashboardCard 
          title={t('remaining')} 
          subtitle={t('days_left')} 
          icon={<Clock className="text-orange-500" />}
        >
          <div className="mt-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.daysRemaining}</span>
            <span className="text-slate-400 dark:text-slate-500 ml-1 font-medium">{t('days_left')}</span>
          </div>
        </DashboardCard>

        <DashboardCard 
          title={t('roaming')} 
          subtitle={t('status')} 
          icon={<AlertCircle className={stats.isRoaming ? "text-red-500" : "text-slate-400"} />}
        >
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.isRoaming ? t('active') : t('offline')}
            </span>
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard title={t('data_usage_gb')} className="lg:col-span-2">
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('data_plan')}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('gb_of_gb').replace('{used}', stats.dataPlanUsed.toFixed(1)).replace('{limit}', stats.dataPlanLimit.toString())}</p>
                </div>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">{usagePercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercentage}%` }}
                  className={`h-full rounded-full ${usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 75 ? 'bg-yellow-500' : 'bg-blue-600'}`}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>0 GB</span>
                <span>{stats.dataPlanLimit / 2} GB</span>
                <span>{stats.dataPlanLimit} GB</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">
                  <ArrowDownCircle className="w-3 h-3 text-blue-500" /> {t('total_download')}
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">8.4 GB</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">
                  <ArrowUpCircle className="w-3 h-3 text-purple-500" /> {t('total_upload')}
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">4.0 GB</div>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title={t('usage_by_app')}>
          <div className="mt-6 space-y-4">
            {stats.apps.map((app, index) => (
              <div key={app.name} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-slate-900 dark:text-white">{app.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400">{app.usage.toFixed(1)} GB</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(app.usage / stats.dataPlanUsed) * 100}%` }}
                    className="h-full rounded-full bg-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </motion.div>
  );
};

export default MobileDataView;
