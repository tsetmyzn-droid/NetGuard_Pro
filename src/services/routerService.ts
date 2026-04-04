import { Device, NetworkStats, ConnectionEvent, RouterSettings } from '../types';

class MockRouterService {
  private devices: Device[] = [
    { id: '1', name: 'iPhone 15 Pro', ip: '192.168.1.15', mac: 'AA:BB:CC:DD:EE:01', type: 'mobile', status: 'online', uploadSpeed: 2.4, downloadSpeed: 45.2, currentUsage: 12.5 },
    { id: '2', name: 'MacBook Pro M3', ip: '192.168.1.22', mac: 'AA:BB:CC:DD:EE:02', type: 'laptop', status: 'online', uploadSpeed: 15.1, downloadSpeed: 120.5, currentUsage: 45.8 },
    { id: '3', name: 'Smart TV 4K', ip: '192.168.1.10', mac: 'AA:BB:CC:DD:EE:03', type: 'smart-tv', status: 'online', uploadSpeed: 0.5, downloadSpeed: 25.0, currentUsage: 88.2 },
    { id: '4', name: 'Smart Fridge', ip: '192.168.1.45', mac: 'AA:BB:CC:DD:EE:04', type: 'iot', status: 'online', uploadSpeed: 0.1, downloadSpeed: 0.2, currentUsage: 0.5 },
    { id: '5', name: 'Gaming PC', ip: '192.168.1.100', mac: 'AA:BB:CC:DD:EE:05', type: 'desktop', status: 'offline', uploadSpeed: 0, downloadSpeed: 0, currentUsage: 156.0 },
  ];

  private settings: RouterSettings = {
    ssid: 'NetGuard_Pro_Home',
    guestSsid: 'NetGuard_Guest',
    guestEnabled: false,
    channel: 6,
    securityMode: 'WPA3-SAE',
  };

  async getDevices(): Promise<Device[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...this.devices]), 500));
  }

  async getNetworkStats(): Promise<NetworkStats> {
    return {
      currentDownload: Math.random() * 200 + 50,
      currentUpload: Math.random() * 50 + 10,
      activeDevices: this.devices.filter(d => d.status === 'online').length,
      uptime: '12d 4h 32m',
      cpuUsage: Math.floor(Math.random() * 40) + 10,
      ramUsage: Math.floor(Math.random() * 30) + 20,
    };
  }

  async getLogs(): Promise<ConnectionEvent[]> {
    return [
      { id: 'l1', timestamp: new Date().toISOString(), device: 'iPhone 15 Pro', event: 'joined' },
      { id: 'l2', timestamp: new Date(Date.now() - 3600000).toISOString(), device: 'Gaming PC', event: 'left' },
      { id: 'l3', timestamp: new Date(Date.now() - 7200000).toISOString(), device: 'Unknown Device', event: 'blocked' },
    ];
  }

  async rebootRouter(): Promise<boolean> {
    console.log('SSH: reboot command sent');
    return new Promise((resolve) => setTimeout(() => resolve(true), 2000));
  }

  async toggleGuestWifi(enabled: boolean): Promise<boolean> {
    this.settings.guestEnabled = enabled;
    console.log(`SSH: guest wifi ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  }

  async blockDevice(id: string): Promise<boolean> {
    const device = this.devices.find(d => d.id === id);
    if (device) {
      device.status = 'blocked';
      return true;
    }
    return false;
  }

  async updateSettings(newSettings: Partial<RouterSettings>): Promise<RouterSettings> {
    this.settings = { ...this.settings, ...newSettings };
    return this.settings;
  }

  getSettings(): RouterSettings {
    return { ...this.settings };
  }
}

export const routerService = new MockRouterService();
