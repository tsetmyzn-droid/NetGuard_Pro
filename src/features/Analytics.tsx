import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { DashboardCard } from '../components/DashboardCard';
import { routerService } from '../services/routerService';
import { ConnectionEvent } from '../types';
import { format } from 'date-fns';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity, 
  Clock, 
  Calendar,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  UserMinus
} from 'lucide-react';

const Analytics: React.FC = () => {
  const [logs, setLogs] = useState<ConnectionEvent[]>([]);
  
  const consumptionData = [
    { day: 'Mon', usage: 45.2, color: '#3b82f6' },
    { day: 'Tue', usage: 52.8, color: '#3b82f6' },
    { day: 'Wed', usage: 38.5, color: '#3b82f6' },
    { day: 'Thu', usage: 65.1, color: '#3b82f6' },
    { day: 'Fri', usage: 88.4, color: '#3b82f6' },
    { day: 'Sat', usage: 120.5, color: '#3b82f6' },
    { day: 'Sun', usage: 95.2, color: '#3b82f6' },
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
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Network Analytics</h2>
        <p className="text-slate-500">Monitor your data consumption and connection history</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard title="Weekly Consumption" subtitle="Data usage in GB" className="lg:col-span-2">
          <div className="h-[350px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
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
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="usage" 
                  radius={[8, 8, 0, 0]} 
                  barSize={40}
                >
                  {consumptionData.map((entry, index) => (
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
          <DashboardCard title="Quick Stats">
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <ArrowDownLeft className="text-blue-600 w-5 h-5" />
                  <span className="text-sm font-medium text-blue-900">Total Download</span>
                </div>
                <span className="font-bold text-blue-900">456.2 GB</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="text-purple-600 w-5 h-5" />
                  <span className="text-sm font-medium text-purple-900">Total Upload</span>
                </div>
                <span className="font-bold text-purple-900">82.5 GB</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Activity className="text-slate-600 w-5 h-5" />
                  <span className="text-sm font-medium text-slate-900">Peak Usage</span>
                </div>
                <span className="font-bold text-slate-900">12.5 Mbps</span>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Network Health">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * 0.05} className="text-green-500" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">95%</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Excellent</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 text-center">Your network is performing optimally with minimal interference.</p>
            </div>
          </DashboardCard>
        </div>
      </div>

      <DashboardCard title="Connection Logs" subtitle="Recent network events">
        <div className="mt-6 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center">
                  {getEventIcon(log.event)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    {log.device} <span className="text-slate-400 font-normal">has {log.event}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <Clock className="w-3 h-3" /> {format(new Date(log.timestamp), 'HH:mm:ss')}
                    <Calendar className="w-3 h-3 ml-2" /> {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Event ID: {log.id}</span>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
};

export default Analytics;
