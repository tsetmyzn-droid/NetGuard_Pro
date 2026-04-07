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
  Activity,
  LogOut,
  Info,
  History,
  Lock
} from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { routerService } from '../services/routerService';
import { routerServiceV2 } from '../services/routerServiceV2';
import { mobileDataService } from '../services/mobileDataService';
import { securityService } from '../services/securityService';
import { cn } from '../lib/utils';
import { NetworkStats, ConnectionType } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../contexts/LanguageContext';
import MobileDataView from './MobileDataView';
import config from '../config.json';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [speedData, setSpeedData] = useState<any[]>([]);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [isRebooting, setIsRebooting] = useState(false);
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [speedResult, setSpeedResult] = useState<{download: number, upload: number} | null>(null);
  const [connectionType, setConnectionType] = useState<ConnectionType>('wifi');
  const [showLogs, setShowLogs] = useState(false);
  const [showRebootModal, setShowRebootModal] = useState(false);
  const [securityScanResult, setSecurityScanResult] = useState<any>(null);
  const [isScanningSecurity, setIsScanningSecurity] = useState(false);
  const [mobileUsage, setMobileUsage] = useState<any>(null);

  const brand = routerService.getBrand();
  const isConnected = routerService.isConnected();
  const isAdminMode = routerService.isAdminMode();
  const sessionLogs = routerService.getSessionLogs();

  const fetchUsageHistory = async () => {
    try {
      const response = await fetch('/api/usage/history');
      const data = await response.json();
      setUsageHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  useEffect(() => {
    fetchUsageHistory();
    
    // Fetch mobile data usage
    const fetchMobileUsage = async () => {
      const data = await mobileDataService.getUsage();
      setMobileUsage(data);
    };
    fetchMobileUsage();

    const fetchStats = async () => {
      if (connectionType === 'wifi') {
        try {
          if (isConnected && !isAdminMode) {
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

            // Record daily usage to DB
            const today = new Date().toISOString().split('T')[0];
            fetch('/api/usage/record', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                date: today,
                download: data.totalDownload,
                upload: data.totalUpload,
                total: data.totalDownload + data.totalUpload
              })
            });
          }
        } catch (err: any) {
          console.error('Stats fetch error:', err);
          // If connection fails during monitoring
          if (err.message === 'CHECK_HOME_WIFI') {
            // We could show a toast or a small banner
          }
        }
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [connectionType, isConnected]);

  const handleReboot = async () => {
    setShowRebootModal(false);
    setIsRebooting(true);
    await routerService.rebootRouter();
    setIsRebooting(false);
  };

  const runSpeedTest = async () => {
    setIsTestingSpeed(true);
    const result = await routerService.runSpeedTest();
    setSpeedResult(result);
    setIsTestingSpeed(false);
  };

  const handleSpeedTest = async () => {
    setIsTestingSpeed(true);
    setSpeedResult(null);
    try {
      const response = await fetch('/api/speedtest');
      const data = await response.json();
      if (data.success) {
        setSpeedResult({ download: data.download, upload: data.upload });
      }
    } catch (err) {
      console.error('Speed test error:', err);
    } finally {
      setIsTestingSpeed(false);
    }
  };

  const handleSecurityScan = async () => {
    setIsScanningSecurity(true);
    try {
      const result = await securityService.scanForThreats();
      setSecurityScanResult(result);
    } catch (err) {
      console.error('Security scan error:', err);
    } finally {
      setIsScanningSecurity(false);
    }
  };

  const handleLogout = () => {
    routerService.logout();
    onLogout();
  };

  const profiles = routerServiceV2.getProfiles();

  if (!isConnected && connectionType === 'wifi') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Wifi className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {t('no_router_connected')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
          {t('connect_instruction')}
        </p>
        <button 
          onClick={handleLogout}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" /> {t('back_to_login')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 transition-colors duration-300">
      {isAdminMode && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-slate-900 to-blue-900 rounded-[32px] text-white shadow-2xl border border-blue-500/30"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <ShieldCheck className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">{t('master_supervisor_mode')}</h2>
                <p className="text-blue-300 text-sm font-medium">{t('global_infrastructure')}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl font-bold transition-all flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" /> {t('exit_master_mode')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-blue-300 text-xs font-black uppercase tracking-widest mb-1">{t('total_connections')}</p>
              <p className="text-3xl font-black">{sessionLogs.length}</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-blue-300 text-xs font-black uppercase tracking-widest mb-1">{t('unique_brands')}</p>
              <p className="text-3xl font-black">{new Set(sessionLogs.map(l => l.brand)).size}</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-blue-300 text-xs font-black uppercase tracking-widest mb-1">{t('system_status')}</p>
              <p className="text-3xl font-black text-green-400">{t('optimal')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" /> {t('connected_router_history')}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {sessionLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-black text-lg">{log.brand}</div>
                      <div className="text-sm text-blue-300 font-mono">{log.ip} • {t('device')}: {log.user}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 mb-1">{new Date(log.timestamp).toLocaleString()}</div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black rounded-full border border-green-500/30 uppercase">{t('verified')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!isAdminMode && (
        <>
          {/* Unlimited Internet Campaign Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-[40px] text-white shadow-2xl relative overflow-hidden border border-white/10"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-white/20">
                  <Globe className="w-3 h-3" /> {t('unlimited_internet_campaign') || 'حملة إنترنت غير محدود في مصر'}
                </div>
                <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4 tracking-tighter">
                  {t('your_quota_status') || 'حالة باقتك الآن'}
                  <span className="block text-sm opacity-50 mt-2 font-mono">{config.version}</span>
                </h2>
                <p className="text-blue-100 text-lg font-medium max-w-md mb-8 opacity-90">
                  {t('quota_desc') || 'نحن نراقب استهلاكك بدقة لنضمن لك أفضل تجربة إنترنت ومواجهة أي تلاعب.'}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="px-6 py-3 bg-white text-blue-600 rounded-2xl font-black shadow-lg cursor-pointer hover:bg-blue-50 transition-colors">
                    {t('renew_now') || 'تجديد الباقة'}
                  </div>
                  <div className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black cursor-pointer hover:bg-white/20 transition-colors" onClick={handleSpeedTest}>
                    {isTestingSpeed ? t('testing') : t('speed_test')}
                  </div>
                </div>
                
                {speedResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between"
                  >
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-blue-200 uppercase">{t('download')}</p>
                      <p className="text-xl font-black">{speedResult.download} <span className="text-xs font-normal">Mbps</span></p>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-blue-200 uppercase">{t('upload')}</p>
                      <p className="text-xl font-black">{speedResult.upload} <span className="text-xs font-normal">Mbps</span></p>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-blue-200 uppercase">Ping</p>
                      <p className="text-xl font-black">12 <span className="text-xs font-normal">ms</span></p>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 border border-white/20 shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-blue-100">{t('total_consumption_today') || 'استهلاكك اليوم'}</span>
                  <span className="text-2xl font-black">
                    {stats ? (stats.totalDownload + stats.totalUpload).toFixed(1) : '0.0'} 
                    <span className="text-sm font-normal ml-1">GB</span>
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4 mb-4 overflow-hidden p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: stats ? `${Math.min(((stats.totalDownload + stats.totalUpload) / 10) * 100, 100)}%` : '0%' }}
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full shadow-lg shadow-blue-400/20"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-black text-blue-200 uppercase tracking-widest">
                  <span>{t('used') || 'مستهلك'}: {stats ? (stats.totalDownload + stats.totalUpload).toFixed(1) : '0.0'} GB</span>
                  <span>{t('estimated_limit') || 'الهدف اليومي'}: 10.0 GB</span>
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-6">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-blue-200 uppercase mb-1">{t('download')}</p>
                    <p className="text-2xl font-black">{stats ? stats.currentDownload.toFixed(1) : '0.0'} <span className="text-xs font-normal opacity-70">Mbps</span></p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-blue-200 uppercase mb-1">{t('upload')}</p>
                    <p className="text-2xl font-black">{stats ? stats.currentUpload.toFixed(1) : '0.0'} <span className="text-xs font-normal opacity-70">Mbps</span></p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Supervisor Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">{t('total_routers')}</p>
              <p className="text-2xl font-black">{profiles.length}</p>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard className="bg-white dark:bg-slate-900 group hover:border-blue-500 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
              securityScanResult?.bruteForce?.detected || securityScanResult?.mitm?.detected
                ? "bg-red-50 dark:bg-red-900/20 text-red-500 scale-110"
                : "bg-green-50 dark:bg-green-900/20 text-green-500"
            )}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">{t('security_shield')}</p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {isScanningSecurity ? t('scanning') : (securityScanResult ? (securityScanResult.bruteForce.detected ? t('threats_detected') : t('system_online')) : t('security_shield_active'))}
                </p>
                <button 
                  onClick={handleSecurityScan}
                  disabled={isScanningSecurity}
                  className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-widest"
                >
                  {t('scan_now') || 'SCAN'}
                </button>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-2xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">{t('total_traffic')}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{routerServiceV2.getQuotaStatus().used.toFixed(2)} GB</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard 
          onClick={() => setShowLogs(true)}
          className="bg-white dark:bg-slate-900 cursor-pointer hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-2xl flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">{t('session_logs')}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{sessionLogs.length} {t('entries')}</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {connectionType === 'wifi' ? `${brand} ${t('dashboard')}` : t('mobile_data')}
            {isConnected && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">{t('live')}</span>}
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
                {isTestingSpeed ? t('testing') : t('speed_test')}
              </button>
              <button 
                onClick={() => setShowRebootModal(true)}
                disabled={isRebooting}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={isRebooting ? "animate-spin w-4 h-4" : "w-4 h-4"} />
                {isRebooting ? t('rebooting') : t('reboot_router')}
              </button>
              <button 
                onClick={handleLogout}
                className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                title={t('logout')}
              >
                <LogOut className="w-5 h-5" />
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
            <p className="text-xs text-blue-100 uppercase font-bold mb-1">{t('download_mbps')}</p>
            <p className="text-3xl font-black">{speedResult.download.toFixed(2)} <span className="text-sm font-normal">Mbps</span></p>
          </div>
          <div className="text-center">
            <p className="text-xs text-blue-100 uppercase font-bold mb-1">{t('upload_mbps')}</p>
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
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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

                  <DashboardCard title={t('daily_usage_history') || 'تاريخ الاستهلاك اليومي'} className="lg:col-span-3">
                    <div className="h-[200px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <AreaChart data={usageHistory}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorTotal)" 
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
      </>)}
      {/* Parental Control Section */}
      {!isAdminMode && (
        <DashboardCard title={t('parental_control_title')}>
          <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
              <Lock className="w-8 h-8" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                {t('content_filter')}
                <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-black rounded-full uppercase tracking-tighter">
                  <Info className="w-3 h-3" /> {t('under_development')}
                </span>
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {t('content_filtering_desc')}
              </p>
            </div>
            <button disabled className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-2xl font-bold cursor-not-allowed">
              {t('configure')}
            </button>
          </div>
        </DashboardCard>
      )}

      <AnimatePresence>
        {showRebootModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-sm p-8 text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('reboot_router')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                {t('confirm_reboot')}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowRebootModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleReboot}
                  className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  {t('reboot_router')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showLogs && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-500" /> {t('session_logs')}
                </h3>
                <button 
                  onClick={() => setShowLogs(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {sessionLogs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">{t('no_logs_found')}</div>
                ) : (
                  sessionLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                          <Globe className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{log.ip}</div>
                          <div className="text-xs text-slate-500">{log.user} • {log.brand}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-400">{new Date(log.timestamp).toLocaleString()}</div>
                        <div className="text-[10px] text-green-500 font-black uppercase">{t('success')}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 text-center">
                <button 
                  onClick={() => setShowLogs(false)}
                  className="px-8 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-bold"
                >
                  {t('close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
