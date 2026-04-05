import React, { useState, useEffect } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCw, 
  Wifi, 
  Smartphone, 
  Cpu, 
  HardDrive,
  ShieldCheck
} from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { routerService } from '../services/routerService';
import { NetworkStats } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [speedData, setSpeedData] = useState<any[]>([]);
  const [isRebooting, setIsRebooting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [showScanSuccess, setShowScanSuccess] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
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
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleReboot = async () => {
    setIsRebooting(true);
    await routerService.rebootRouter();
    setIsRebooting(false);
  };

  const handleSecurityScan = async () => {
    setIsScanning(true);
    setShowScanSuccess(false);
    
    const steps = [
      'Initializing Deep Scan...',
      'Checking Firewall Rules...',
      'Scanning Open Ports...',
      'Verifying WPA3 Encryption...',
      'Analyzing Device Behavior...',
      'Finalizing Report...'
    ];

    for (const step of steps) {
      setScanStep(step);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setIsScanning(false);
    setShowScanSuccess(true);
    setTimeout(() => setShowScanSuccess(false), 5000);
  };

  if (!stats) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Network Overview</h2>
          <p className="text-slate-500">Real-time status of your NetGuard Pro router</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleReboot}
            disabled={isRebooting}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={isRebooting ? "animate-spin w-4 h-4" : "w-4 h-4"} />
            {isRebooting ? "Rebooting..." : "Reboot Router"}
          </button>
          <div className="px-4 py-2 bg-green-50 text-green-600 rounded-2xl font-medium flex items-center gap-2 border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Online
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Download" 
          subtitle="Current speed" 
          icon={<ArrowDownCircle className="text-blue-500" />}
        >
          <div className="mt-2">
            <span className="text-3xl font-bold text-slate-900">{stats.currentDownload.toFixed(1)}</span>
            <span className="text-slate-400 ml-1 font-medium">Mbps</span>
          </div>
        </DashboardCard>

        <DashboardCard 
          title="Upload" 
          subtitle="Current speed" 
          icon={<ArrowUpCircle className="text-purple-500" />}
        >
          <div className="mt-2">
            <span className="text-3xl font-bold text-slate-900">{stats.currentUpload.toFixed(1)}</span>
            <span className="text-slate-400 ml-1 font-medium">Mbps</span>
          </div>
        </DashboardCard>

        <DashboardCard 
          title="Devices" 
          subtitle="Connected now" 
          icon={<Smartphone className="text-orange-500" />}
        >
          <div className="mt-2">
            <span className="text-3xl font-bold text-slate-900">{stats.activeDevices}</span>
            <span className="text-slate-400 ml-1 font-medium">Active</span>
          </div>
        </DashboardCard>

        <DashboardCard 
          title="Uptime" 
          subtitle="System stability" 
          icon={<Wifi className="text-green-500" />}
        >
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{stats.uptime}</span>
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard title="Real-time Traffic" className="lg:col-span-2">
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
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
          <DashboardCard title="System Performance">
            <div className="space-y-6 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> CPU Load
                  </span>
                  <span className="text-slate-900">{stats.cpuUsage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.cpuUsage}%` }}
                    className="bg-blue-500 h-2 rounded-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-600 flex items-center gap-2">
                    <HardDrive className="w-4 h-4" /> RAM Usage
                  </span>
                  <span className="text-slate-900">{stats.ramUsage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.ramUsage}%` }}
                    className="bg-purple-500 h-2 rounded-full"
                  />
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button className="p-4 bg-slate-50 rounded-2xl text-center hover:bg-blue-50 hover:text-blue-600 transition-all group">
                <Wifi className="w-6 h-6 mx-auto mb-2 text-slate-400 group-hover:text-blue-500" />
                <span className="text-xs font-semibold">Guest Wi-Fi</span>
              </button>
              <button 
                onClick={handleSecurityScan}
                disabled={isScanning}
                className="p-4 bg-slate-50 rounded-2xl text-center hover:bg-blue-50 hover:text-blue-600 transition-all group disabled:opacity-50"
              >
                <ShieldCheck className={cn("w-6 h-6 mx-auto mb-2 text-slate-400 group-hover:text-blue-500", isScanning && "animate-pulse text-blue-500")} />
                <span className="text-xs font-semibold">{isScanning ? "Scanning..." : "Security Scan"}</span>
              </button>
            </div>
          </DashboardCard>
        </div>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-blue-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Security Scan in Progress</h3>
              <p className="text-slate-500 text-sm mb-6 h-5">{scanStep}</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1/2 bg-blue-500 h-full rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {showScanSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6"
          >
            <div className="bg-green-600 text-white p-4 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="font-bold">Scan Complete</div>
                <div className="text-xs text-green-100">No threats detected. Your network is secure.</div>
              </div>
              <button 
                onClick={() => setShowScanSuccess(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
