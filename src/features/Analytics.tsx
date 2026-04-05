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
import { ConnectionEvent } from '../types';
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
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  
  const consumptionData = {
    day: [
      { time: '00:00', usage: 2.1 }, { time: '04:00', usage: 1.5 }, { time: '08:00', usage: 5.8 },
      { time: '12:00', usage: 8.2 }, { time: '16:00', usage: 12.5 }, { time: '20:00', usage: 15.4 }
    ],
    week: [
      { name: 'Mon', usage: 45.2 }, { name: 'Tue', usage: 52.8 }, { name: 'Wed', usage: 38.5 },
      { name: 'Thu', usage: 65.1 }, { name: 'Fri', usage: 88.4 }, { name: 'Sat', usage: 120.5 }, { name: 'Sun', usage: 95.2 }
    ],
    month: [
      { name: 'Week 1', usage: 320 }, { name: 'Week 2', usage: 450 }, { name: 'Week 3', usage: 380 }, { name: 'Week 4', usage: 510 }
    ]
  };

  const appUsageData = [
    { name: 'YouTube', value: 45, icon: <Youtube className="w-4 h-4" />, color: '#ef4444' },
    { name: 'Netflix', value: 25, icon: <Globe className="w-4 h-4" />, color: '#e11d48' },
    { name: 'Gaming', value: 15, icon: <Gamepad2 className="w-4 h-4" />, color: '#8b5cf6' },
    { name: 'Social', value: 10, icon: <MessageSquare className="w-4 h-4" />, color: '#3b82f6' },
    { name: 'Others', value: 5, icon: <Activity className="w-4 h-4" />, color: '#94a3b8' },
  ];

  const deviceUsageData = [
    { name: 'iPhone 15 Pro', usage: 125.4, apps: ['YouTube', 'Instagram'] },
    { name: 'MacBook Pro', usage: 245.8, apps: ['Chrome', 'VS Code', 'Zoom'] },
    { name: 'Smart TV', usage: 180.2, apps: ['Netflix', 'Prime Video'] },
    { name: 'PlayStation 5', usage: 95.6, apps: ['Warzone', 'Fifa 24'] },
  ];

  const contentUsageData = [
    { name: 'Video Streaming', value: 65, color: '#3b82f6' },
    { name: 'Social Media', value: 15, color: '#ec4899' },
    { name: 'Gaming', value: 12, color: '#8b5cf6' },
    { name: 'System Updates', value: 8, color: '#10b981' },
  ];

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await routerService.getLogs();
      setLogs(data);
    };
    fetchLogs();
  }, []);

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
              <BarChart data={consumptionData[timeRange]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis 
                  dataKey={timeRange === 'day' ? 'time' : 'name'} 
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
                  {consumptionData[timeRange].map((entry: any, index: number) => (
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
                      {app.icon}
                    </div>
                    <span className="text-slate-900 dark:text-white">{app.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400">{app.value}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${app.value}%` }}
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
            {deviceUsageData.map((device) => (
              <div key={device.name} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{device.name}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {device.apps.join(' • ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white">{device.usage} GB</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Total Data</div>
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
                    {log.device} <span className="text-slate-400 dark:text-slate-500 font-normal">has {log.event}</span>
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
