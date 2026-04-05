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
  Filter
} from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { routerService } from '../services/routerService';
import { Device } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const DeviceList: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'blocked'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
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
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Device Management</h2>
          <p className="text-slate-500">Manage and secure {devices.length} devices on your network</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: devices.length, icon: Wifi, color: 'blue' },
          { label: 'Online', value: devices.filter(d => d.status === 'online').length, icon: ShieldCheck, color: 'green' },
          { label: 'Blocked', value: blockedCount, icon: Ban, color: 'red' },
          { label: 'Offline', value: devices.filter(d => d.status === 'offline').length, icon: Smartphone, color: 'slate' },
        ].map((stat) => (
          <DashboardCard key={stat.label} className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-500 flex items-center justify-center`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              <div className="text-xl font-bold text-slate-900">{stat.value}</div>
            </div>
          </DashboardCard>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-slate-100 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'all' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            All Devices
          </button>
          <button 
            onClick={() => setActiveTab('blocked')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'blocked' ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Blocked
            {blockedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] flex items-center justify-center">
                {blockedCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'blocked' && blockedCount > 0 && (
          <button 
            onClick={handleUnblockAll}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all font-bold text-sm"
          >
            <Unlock className="w-4 h-4" />
            Unblock All
          </button>
        )}
      </div>

      <DashboardCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Device</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Signal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">IP / MAC Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Speed</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={device.id} 
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                            device.status === 'blocked' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
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
                                  className="text-sm font-semibold text-slate-900 border-b border-blue-500 focus:outline-none bg-transparent w-full"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-slate-900 truncate">{device.name}</div>
                                <button 
                                  onClick={() => { setEditingId(device.id); setNewName(device.name); }}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-500 transition-all"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            <div className="text-xs text-slate-500 capitalize">{device.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                          device.status === 'online' ? "bg-green-50 text-green-600" : 
                          device.status === 'offline' ? "bg-slate-100 text-slate-500" : 
                          "bg-red-50 text-red-600"
                        )}>
                          {device.status === 'online' && <ShieldCheck className="w-3 h-3" />}
                          {device.status === 'blocked' && <ShieldAlert className="w-3 h-3" />}
                          {device.status}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5">
                          <Signal className={cn(
                            "w-4 h-4",
                            device.status === 'offline' ? "text-slate-200" : "text-green-500"
                          )} />
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                device.status === 'offline' ? "w-0" : "w-[85%] bg-green-500"
                              )}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-slate-700">{device.ip}</div>
                        <div className="text-[10px] font-mono text-slate-400">{device.mac}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-blue-600 font-medium text-sm">
                            <ArrowDown className="w-3 h-3" /> {device.downloadSpeed}
                          </div>
                          <div className="flex items-center gap-1 text-purple-600 font-medium text-sm">
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
                                ? "bg-green-50 text-green-600 hover:bg-green-100" 
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            )}
                          >
                            {device.status === 'blocked' ? 'Unblock' : 'Block'}
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
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
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                          <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <div className="text-slate-900 font-bold">No devices found</div>
                        <p className="text-slate-500 text-sm max-w-[240px]">
                          {activeTab === 'blocked' 
                            ? "Great! You haven't blocked any devices yet." 
                            : "Try searching for a different name or IP address."}
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
    </div>
  );
};

export default DeviceList;
