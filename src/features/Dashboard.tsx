import React, { useState, useEffect } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCw, 
  Wifi, 
  Smartphone, 
  Cpu, 
  HardDrive,
  ShieldCheck,
  Globe,
  Signal,
  Database,
  Activity
} from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { routerService } from '../services/routerService';
import { routerServiceV2 } from '../services/routerServiceV2';
import { mobileDataService } from '../services/mobileDataService';
import { cn } from '../lib/utils';
import { NetworkStats, ConnectionType } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../contexts/LanguageContext';
import MobileDataView from './MobileDataView';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [speedData, setSpeedData] = useState<any[]>([]);
  const [isRebooting, setIsRebooting] = useState(false);
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [speedResult, setSpeedResult] = useState<{download: number, upload: number} | null>(null);
  const [connectionType, setConnectionType] = useState<ConnectionType>('wifi');

  const brand = routerService.getBrand();
  const isConnected = routerService.isConnected();

  useEffect(() => {
    const fetchStats = async () => {
      if (connectionType === 'wifi' && isConnected) {
        const data = await routerService.getNetworkStats();
        setStats(data);
        
        setSpeedData(prev => {
          const newData = [...prev, { 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            download: data.currentDownload,
            upload: data.currentUpload
          }].slice(-10);
          return newData;
        });
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [connectionType, isConnected]);

  const handleReboot = async () => {
    if (window.confirm(t('confirm_reboot') || 'Are you sure you want to reboot?')) {
      setIsRebooting(true);
      await routerService.rebootRouter();
      setIsRebooting(false);
    }
  };

  const runSpeedTest = async () => {
    setIsTestingSpeed(true);
    const result = await routerService.runSpeedTest();
    setSpeedResult(result);
    setIsTestingSpeed(false);
  };

  const profiles = routerServiceV2.getProfiles();

  if (!isConnected && connectionType === 'wifi') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Wifi className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {t('no_router_connected') || 'No Router Connected'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
          {t('connect_instruction') || 'Please login with your router credentials to access the admin panel.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 transition-colors duration-300">
      {/* Supervisor Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total Routers</p>
              <p className="text-2xl font-black">{profiles.length}</p>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard className="bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Active Gateway</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{isConnected ? brand : 'None'}</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-2xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Total Traffic</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{routerServiceV2.getQuotaStatus().used.toFixed(2)} GB</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {connectionType === 'wifi' ? `${brand} Admin Panel` : t('mobile_data')}
            {isConnected && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Live</span>}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">{t('real_time_status')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setConnectionType('wifi')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                connectionType === 'wifi' 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              <Wifi className="w-3.5 h-3.5" /> {t('wifi')}
            </button>
            <button 
              onClick={() => setConnectionType('cellular')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                connectionType === 'cellular' 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              <Signal className="w-3.5 h-3.5" /> {t('cellular')}
            </button>
          </div>

          {connectionType === 'wifi' && (
            <div className="flex items-center gap-3">
              <button 
                onClick={runSpeedTest}
                disabled={isTestingSpeed}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Globe className={isTestingSpeed ? "animate-spin w-4 h-4" : "w-4 h-4"} />
                {isTestingSpeed ? "Testing..." : "Speed Test"}
              </button>
              <button 
                onClick={handleReboot}
                disabled={isRebooting}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={isRebooting ? "animate-spin w-4 h-4" : "w-4 h-4"} />
                {isRebooting ? "Rebooting..." : t('reboot_router')}
              </button>
            </div>
          )}
        </div>
      </header>

      {speedResult && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4 p-6 bg-blue-600 text-white rounded-[32px] shadow-xl shadow-blue-500/20"
        >
          <div className="text-center border-r border-white/20">
            <p className="text-xs text-blue-100 uppercase font-bold mb-1">Download</p>
            <p className="text-3xl font-black">{speedResult.download.toFixed(2)} <span className="text-sm font-normal">Mbps</span></p>
          </div>
          <div className="text-center">
            <p className="text-xs text-blue-100 uppercase font-bold mb-1">Upload</p>
            <p className="text-3xl font-black">{speedResult.upload.toFixed(2)} <span className="text-sm font-normal">Mbps</span></p>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {connectionType === 'wifi' ? (
          <motion.div 
            key="wifi-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <DashboardCard 
                    title={t('download')} 
                    subtitle={t('current_speed')} 
                    icon={<ArrowDownCircle className="text-blue-500" />}
                  >
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.currentDownload.toFixed(1)}</span>
                      <span className="text-slate-400 dark:text-slate-500 ml-1 font-medium">Mbps</span>
                    </div>
                  </DashboardCard>

                  <DashboardCard 
                    title={t('upload')} 
                    subtitle={t('current_speed')} 
                    icon={<ArrowUpCircle className="text-purple-500" />}
                  >
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.currentUpload.toFixed(1)}</span>
                      <span className="text-slate-400 dark:text-slate-500 ml-1 font-medium">Mbps</span>
                    </div>
                  </DashboardCard>

                  <DashboardCard 
                    title={t('devices')} 
                    subtitle={t('connected_now')} 
                    icon={<Smartphone className="text-orange-500" />}
                  >
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeDevices}</span>
                      <span className="text-slate-400 dark:text-slate-500 ml-1 font-medium">{t('active')}</span>
                    </div>
                  </DashboardCard>

                  <DashboardCard 
                    title={t('uptime')} 
                    subtitle={t('system_stability')} 
                    icon={<Wifi className="text-green-500" />}
                  >
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.uptime}</span>
                    </div>
                  </DashboardCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <DashboardCard title={t('real_time_traffic')} className="lg:col-span-2">
                    <div className="h-[300px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={speedData}>
                          <defs>
                            <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                          <XAxis dataKey="time" hide />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '16px', 
                              border: 'none', 
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                              backgroundColor: 'var(--color-dark-card, #1E293B)',
                              color: '#fff'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="download" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorDownload)" 
                            animationDuration={1000}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="upload" 
                            stroke="#a855f7" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorUpload)" 
                            animationDuration={1000}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </DashboardCard>

                  <div className="space-y-6">
                    <DashboardCard title={t('system_performance')}>
                      <div className="space-y-6 mt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <Cpu className="w-4 h-4" /> {t('cpu_load')}
                            </span>
                            <span className="text-slate-900 dark:text-white">{stats.cpuUsage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${stats.cpuUsage}%` }}
                              className="bg-blue-500 h-2 rounded-full"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <HardDrive className="w-4 h-4" /> {t('ram_usage')}
                            </span>
                            <span className="text-slate-900 dark:text-white">{stats.ramUsage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${stats.ramUsage}%` }}
                              className="bg-purple-500 h-2 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </DashboardCard>

                    <DashboardCard title={t('quick_actions')}>
                      <div className="grid grid-cols-1 gap-3 mt-4">
                        <button className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all group">
                          <Wifi className="w-6 h-6 mx-auto mb-2 text-slate-400 dark:text-slate-500 group-hover:text-blue-500" />
                          <span className="text-xs font-semibold dark:text-slate-300">{t('guest_wifi')}</span>
                        </button>
                      </div>
                    </DashboardCard>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="cellular-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MobileDataView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
