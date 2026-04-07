import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Laptop, 
  Monitor, 
  Tv, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  MoreVertical,
  Search,
  ArrowUp,
  ArrowDown,
  Ban,
  Unlock,
  Download,
  Edit2,
  Signal,
  Wifi,
  Filter,
  X,
  Activity,
  Globe,
  Youtube,
  Gamepad2,
  MessageSquare
} from 'lucide-react';
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
  AreaChart,
  Area
} from 'recharts';
import { DashboardCard } from '../components/DashboardCard';
import { routerService } from '../services/routerService';
import { Device } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../contexts/LanguageContext';

const DeviceList: React.FC = () => {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'blocked'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [newName, setNewName] = useState('');

  const fetchDevices = async () => {
    const data = await routerService.getDevices();
    setDevices(data);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'laptop': return <Laptop className="w-5 h-5" />;
      case 'desktop': return <Monitor className="w-5 h-5" />;
      case 'smart-tv': return <Tv className="w-5 h-5" />;
      default: return <Cpu className="w-5 h-5" />;
    }
  };

  const filteredDevices = devices.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.ip.includes(searchQuery);
    const matchesTab = activeTab === 'all' ? true : d.status === 'blocked';
    return matchesSearch && matchesTab;
  });

  const handleToggleBlock = async (id: string, currentStatus: string) => {
    if (currentStatus === 'blocked') {
      await routerService.unblockDevice(id);
    } else {
      await routerService.blockDevice(id);
    }
    fetchDevices();
  };

  const handleUnblockAll = async () => {
    await routerService.unblockAllDevices();
    fetchDevices();
  };

  const handleRename = async (id: string) => {
    if (newName.trim()) {
      await routerService.renameDevice(id, newName);
      setEditingId(null);
      setNewName('');
      fetchDevices();
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Status', 'IP', 'MAC', 'Type'];
    const rows = devices.map(d => [d.name, d.status, d.ip, d.mac, d.type]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "netguard_devices.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const blockedCount = devices.filter(d => d.status === 'blocked').length;

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 transition-colors duration-300">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('device_management')}</h2>
          <p className="text-slate-500 dark:text-slate-400">{t('manage_secure_devices').replace('{count}', devices.length.toString())}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            />
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            {t('export')}
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('total'), value: devices.length, icon: Wifi, color: 'blue' },
          { label: t('online'), value: devices.filter(d => d.status === 'online').length, icon: ShieldCheck, color: 'green' },
          { label: t('blocked'), value: blockedCount, icon: Ban, color: 'red' },
          { label: t('offline'), value: devices.filter(d => d.status === 'offline').length, icon: Smartphone, color: 'slate' },
        ].map((stat) => (
          <DashboardCard key={stat.label} className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-500 dark:text-${stat.color}-400 flex items-center justify-center`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
            </div>
          </DashboardCard>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'all' ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            {t('all_devices')}
          </button>
          <button 
            onClick={() => setActiveTab('blocked')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'blocked' ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            {t('blocked')}
            {blockedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] flex items-center justify-center">
                {blockedCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'blocked' && blockedCount > 0 && (
          <button 
            onClick={handleUnblockAll}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-all font-bold text-sm"
          >
            <Unlock className="w-4 h-4" />
            {t('unblock_all')}
          </button>
        )}
      </div>

      <DashboardCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('device')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('status')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('signal')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('ip_mac')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('speed')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence mode="popLayout">
                {filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={device.id} 
                      onClick={() => setSelectedDevice(device)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                            device.status === 'blocked' ? "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400" : "bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400"
                          )}>
                            {getDeviceIcon(device.type)}
                          </div>
                          <div className="flex-1 min-w-[120px]">
                            {editingId === device.id ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  autoFocus
                                  value={newName}
                                  onChange={(e) => setNewName(e.target.value)}
                                  onBlur={() => handleRename(device.id)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleRename(device.id)}
                                  className="text-sm font-semibold text-slate-900 dark:text-white border-b border-blue-500 focus:outline-none bg-transparent w-full"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-slate-900 dark:text-white truncate">{device.name}</div>
                                <button 
                                  onClick={() => { setEditingId(device.id); setNewName(device.name); }}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-500 transition-all"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{device.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                          device.status === 'online' ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : 
                          device.status === 'offline' ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" : 
                          "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                        )}>
                          {device.status === 'online' && <ShieldCheck className="w-3 h-3" />}
                          {device.status === 'blocked' && <ShieldAlert className="w-3 h-3" />}
                          {t(device.status)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5">
                          <Signal className={cn(
                            "w-4 h-4",
                            device.status === 'offline' ? "text-slate-200 dark:text-slate-700" : "text-green-500 dark:text-green-400"
                          )} />
                          <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                device.status === 'offline' ? "w-0" : "w-[85%] bg-green-500 dark:bg-green-400"
                              )}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{device.ip}</div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{device.mac}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium text-sm">
                            <ArrowDown className="w-3 h-3" /> {device.downloadSpeed}
                          </div>
                          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium text-sm">
                            <ArrowUp className="w-3 h-3" /> {device.uploadSpeed}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleToggleBlock(device.id, device.status)}
                            className={cn(
                              "px-4 py-1.5 rounded-xl text-xs font-bold transition-all",
                              device.status === 'blocked' 
                                ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40" 
                                : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                            )}
                          >
                            {device.status === 'blocked' ? t('unblock') : t('block')}
                          </button>
                          <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                          <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <div className="text-slate-900 dark:text-white font-bold">{t('no_devices_found')}</div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[240px]">
                          {activeTab === 'blocked' 
                            ? t('no_blocked_devices') 
                            : t('try_searching_different')}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {/* Device Details Modal */}
      <AnimatePresence>
        {selectedDevice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-4xl shadow-2xl relative my-auto"
            >
              <button 
                onClick={() => setSelectedDevice(null)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded-full transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                  <div className={cn(
                    "w-20 h-20 rounded-[28px] flex items-center justify-center shadow-lg",
                    selectedDevice.status === 'blocked' ? "bg-red-500 text-white shadow-red-500/20" : "bg-blue-600 text-white shadow-blue-600/20"
                  )}>
                    {React.cloneElement(getDeviceIcon(selectedDevice.type) as React.ReactElement, { className: "w-10 h-10" })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedDevice.name}</h3>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        selectedDevice.status === 'online' ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                      )}>
                        {selectedDevice.status}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {selectedDevice.ip}</div>
                      <div className="flex items-center gap-1.5 font-mono"><Activity className="w-4 h-4" /> {selectedDevice.mac}</div>
                      <div className="flex items-center gap-1.5 capitalize"><Smartphone className="w-4 h-4" /> {selectedDevice.type}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Consumption History */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">{t('consumption_history')}</h4>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold">{t('daily')}</span>
                        </div>
                      </div>
                      <div className="h-[240px] w-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <AreaChart data={selectedDevice.history.daily}>
                            <defs>
                              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />
                            <XAxis dataKey="date" hide />
                            <YAxis hide />
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* App Usage */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{t('usage_by_application')}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedDevice.apps.map((app) => (
                          <div key={app.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                                <Activity className="w-4 h-4 text-blue-500" />
                              </div>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{app.name}</span>
                            </div>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{app.usage} GB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Content Types */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{t('content_distribution')}</h4>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <PieChart>
                            <Pie
                              data={selectedDevice.contentTypes}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="usage"
                            >
                              {selectedDevice.contentTypes.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][index % 4]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2">
                        {selectedDevice.contentTypes.map((type, index) => (
                          <div key={type.type} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][index % 4] }} />
                              <span className="font-bold text-slate-600 dark:text-slate-400">{type.type}</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{type.usage} GB</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
                      <h4 className="font-bold">{t('device_control')}</h4>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleBlock(selectedDevice.id, selectedDevice.status); setSelectedDevice(null); }}
                        className={cn(
                          "w-full py-3 rounded-xl font-bold transition-all",
                          selectedDevice.status === 'blocked' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                        )}
                      >
                        {selectedDevice.status === 'blocked' ? t('unblock_device') : t('block_device')}
                      </button>
                      <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">
                        {t('limit_usage')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeviceList;
