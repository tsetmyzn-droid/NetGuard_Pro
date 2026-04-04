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
  ArrowDown
} from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { routerService } from '../services/routerService';
import { Device } from '../types';
import { cn } from '../lib/utils';

const DeviceList: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDevices = async () => {
      const data = await routerService.getDevices();
      setDevices(data);
    };
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

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.ip.includes(searchQuery)
  );

  const handleBlock = async (id: string) => {
    await routerService.blockDevice(id);
    const updated = await routerService.getDevices();
    setDevices(updated);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Device Management</h2>
          <p className="text-slate-500">{devices.length} devices discovered on your network</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </header>

      <DashboardCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Device</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">IP / MAC Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Current Speed</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map((device) => (
                <tr key={device.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        device.status === 'blocked' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                      )}>
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{device.name}</div>
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
                        onClick={() => handleBlock(device.id)}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
};

export default DeviceList;
