import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { DashboardCard } from '../components/DashboardCard';
import { routerService } from '../services/routerService';
import { ConnectionEvent, Device } from '../types';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity, 
  Clock, 
  Calendar,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  UserMinus,
  Smartphone,
  Globe,
  Youtube,
  Gamepad2,
  MessageSquare,
  Filter
} from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

const Analytics: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const [logs, setLogs] = useState<ConnectionEvent[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  
  useEffect(() => {
    const fetchData = async () => {
      const [logsData, devicesData] = await Promise.all([
        routerService.getLogs(),
        routerService.getDevices()
      ]);
      setLogs(logsData);
      setDevices(devicesData);
    };
    fetchData();
  }, []);

  const consumptionData = {
    day: [
      { name: '00:00', usage: 2.1 }, { name: '04:00', usage: 1.5 }, { name: '08:00', usage: 5.8 },
      { name: '12:00', usage: 8.2 }, { name: '16:00', usage: 12.5 }, { name: '20:00', usage: 15.4 }
    ],
    week: [
      { name: 'Mon', usage: 45.2 }, { name: 'Tue', usage: 52.8 }, { name: 'Wed', usage: 38.5 },
      { name: 'Thu', usage: 65.1 }, { name: 'Fri', usage: 88.4 }, { name: 'Sat', usage: 120.5 }, { name: 'Sun', usage: 95.2 }
    ],
    month: [
      { name: 'Week 1', usage: 320 }, { name: 'Week 2', usage: 450 }, { name: 'Week 3', usage: 380 }, { name: 'Week 4', usage: 510 }
    ]
  };

  // Process dynamic history from devices if available
  const getAggregatedHistory = (range: 'day' | 'week' | 'month') => {
    const historyMap: Record<string, number> = {};
    devices.forEach(d => {
      const data = range === 'day' ? d.history.daily : range === 'week' ? d.history.weekly : d.history.monthly;
      data.forEach(h => {
        historyMap[h.date] = (historyMap[h.date] || 0) + h.usage;
      });
    });
    
    if (Object.keys(historyMap).length === 0) return consumptionData[range];
    
    return Object.entries(historyMap).map(([name, usage]) => ({ name, usage }));
  };

  const activeConsumptionData = getAggregatedHistory(timeRange);

  // Aggregate app usage from all devices
  const allApps = devices.flatMap(d => d.apps);
  const appUsageMap = allApps.reduce((acc, app) => {
    acc[app.name] = (acc[app.name] || 0) + app.usage;
    return acc;
  }, {} as Record<string, number>);

  const appUsageData = Object.entries(appUsageMap)
    .map(([name, usage]) => ({
      name,
      value: usage as number,
      color: name === 'YouTube' ? '#ef4444' : name === 'Netflix' ? '#e11d48' : name === 'Chrome' ? '#3b82f6' : '#8b5cf6'
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Aggregate content types
  const allContentTypes = devices.flatMap(d => d.contentTypes);
  const contentUsageMap: Record<string, number> = allContentTypes.reduce((acc, ct) => {
    acc[ct.type] = (acc[ct.type] || 0) + ct.usage;
    return acc;
  }, {} as Record<string, number>);

  const contentUsageData = Object.entries(contentUsageMap)
    .map(([name, value]) => ({
      name,
      value: value as number,
      color: name.includes('Video') ? '#3b82f6' : name.includes('Social') ? '#ec4899' : '#8b5cf6'
    }))
    .sort((a, b) => b.value - a.value);

  const getEventIcon = (event: ConnectionEvent['event']) => {
    switch (event) {
      case 'joined': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'left': return <UserMinus className="w-4 h-4 text-slate-400" />;
      case 'blocked': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'unblocked': return <ShieldCheck className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('analytics')}</h2>
          <p className="text-slate-500 dark:text-slate-400">{t('recent_events')}</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          {(['day', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                timeRange === range 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {t(range)}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard title={t('timeline')} subtitle={t('data_usage_gb')} className="lg:col-span-2">
          <div className="h-[350px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeConsumptionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
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
                <Bar 
                  dataKey="usage" 
                  radius={[8, 8, 0, 0]} 
                  barSize={timeRange === 'month' ? 60 : 40}
                >
                  {activeConsumptionData.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.usage > 100 ? '#ef4444' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <div className="space-y-6">
          <DashboardCard title={t('quick_stats')}>
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <ArrowDownLeft className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-200">{t('total_download')}</span>
                </div>
                <span className="font-bold text-blue-900 dark:text-blue-200">456.2 GB</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-200">{t('total_upload')}</span>
                </div>
                <span className="font-bold text-purple-900 dark:text-purple-200">82.5 GB</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Activity className="text-slate-600 dark:text-slate-400 w-5 h-5" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('peak_usage')}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-200">12.5 Mbps</span>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title={t('usage_by_content')}>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {contentUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      backgroundColor: 'var(--color-dark-card, #1E293B)',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {contentUsageData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title={t('usage_by_app')}>
          <div className="mt-6 space-y-4">
            {appUsageData.map((app) => (
              <div key={app.name} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-slate-900 dark:text-white">{app.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400">{(app.value as number).toFixed(1)} GB</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((app.value as number) / (Object.values(appUsageMap).reduce((a, b) => (a as number) + (b as number), 0) as number || 1)) * 100}%` }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: app.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title={t('device_consumption')}>
          <div className="mt-6 space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{device.name}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {device.apps.map(a => a.name).join(' • ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white">{device.currentUsage} GB</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">{t('total_traffic')}</div>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title={t('connection_logs')} subtitle={t('recent_events')}>
        <div className="mt-6 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center">
                  {getEventIcon(log.event)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {log.device} <span className="text-slate-400 dark:text-slate-500 font-normal">{t(log.event)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    <Clock className="w-3 h-3" /> {format(new Date(log.timestamp), 'HH:mm:ss')}
                    <Calendar className="w-3 h-3 ml-2" /> {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <span className="text-xs font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">Event ID: {log.id}</span>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
};

export default Analytics;
