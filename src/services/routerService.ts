import { Device, NetworkStats, ConnectionEvent, RouterSettings } from '../types';

class MockRouterService {
  private devices: Device[] = [
    { 
      id: '1', name: 'iPhone 15 Pro', ip: '192.168.1.15', mac: 'AA:BB:CC:DD:EE:01', type: 'mobile', status: 'online', uploadSpeed: 2.4, downloadSpeed: 45.2, currentUsage: 12.5,
      apps: [
        { name: 'YouTube', usage: 5.2 },
        { name: 'Instagram', usage: 3.1 },
        { name: 'WhatsApp', usage: 1.2 },
        { name: 'Netflix', usage: 3.0 }
      ],
      contentTypes: [
        { type: 'Video', usage: 8.2 },
        { type: 'Social', usage: 3.1 },
        { type: 'Messaging', usage: 1.2 }
      ],
      history: {
        daily: [
          { date: '2026-04-01', usage: 1.2 },
          { date: '2026-04-02', usage: 1.5 },
          { date: '2026-04-03', usage: 2.1 },
          { date: '2026-04-04', usage: 1.8 },
          { date: '2026-04-05', usage: 2.5 },
          { date: '2026-04-06', usage: 3.4 }
        ],
        weekly: [
          { date: 'Week 12', usage: 15.2 },
          { date: 'Week 13', usage: 12.5 }
        ],
        monthly: [
          { date: 'March', usage: 45.2 },
          { date: 'April', usage: 12.5 }
        ]
      }
    },
    { 
      id: '2', name: 'MacBook Pro M3', ip: '192.168.1.22', mac: 'AA:BB:CC:DD:EE:02', type: 'laptop', status: 'online', uploadSpeed: 15.1, downloadSpeed: 120.5, currentUsage: 45.8,
      apps: [
        { name: 'Chrome', usage: 25.2 },
        { name: 'VS Code', usage: 5.1 },
        { name: 'Slack', usage: 2.2 },
        { name: 'Zoom', usage: 13.3 }
      ],
      contentTypes: [
        { type: 'Web Browsing', usage: 25.2 },
        { type: 'Work', usage: 7.3 },
        { type: 'Video Call', usage: 13.3 }
      ],
      history: {
        daily: [
          { date: '2026-04-06', usage: 8.4 }
        ],
        weekly: [
          { date: 'Week 13', usage: 45.8 }
        ],
        monthly: [
          { date: 'April', usage: 45.8 }
        ]
      }
    },
    { 
      id: '3', name: 'Smart TV 4K', ip: '192.168.1.10', mac: 'AA:BB:CC:DD:EE:03', type: 'smart-tv', status: 'online', uploadSpeed: 0.5, downloadSpeed: 25.0, currentUsage: 88.2,
      apps: [
        { name: 'Netflix', usage: 55.2 },
        { name: 'Prime Video', usage: 20.1 },
        { name: 'YouTube', usage: 12.9 }
      ],
      contentTypes: [
        { type: 'Video Streaming', usage: 88.2 }
      ],
      history: {
        daily: [
          { date: '2026-04-06', usage: 12.2 }
        ],
        weekly: [
          { date: 'Week 13', usage: 88.2 }
        ],
        monthly: [
          { date: 'April', usage: 88.2 }
        ]
      }
    },
    { 
      id: '4', name: 'Smart Fridge', ip: '192.168.1.45', mac: 'AA:BB:CC:DD:EE:04', type: 'iot', status: 'online', uploadSpeed: 0.1, downloadSpeed: 0.2, currentUsage: 0.5,
      apps: [
        { name: 'System', usage: 0.5 }
      ],
      contentTypes: [
        { type: 'IoT Data', usage: 0.5 }
      ],
      history: {
        daily: [{ date: '2026-04-06', usage: 0.1 }],
        weekly: [{ date: 'Week 13', usage: 0.5 }],
        monthly: [{ date: 'April', usage: 0.5 }]
      }
    },
    { 
      id: '5', name: 'Gaming PC', ip: '192.168.1.100', mac: 'AA:BB:CC:DD:EE:05', type: 'desktop', status: 'offline', uploadSpeed: 0, downloadSpeed: 0, currentUsage: 156.0,
      apps: [
        { name: 'Steam', usage: 120.5 },
        { name: 'Discord', usage: 5.5 },
        { name: 'Chrome', usage: 30.0 }
      ],
      contentTypes: [
        { type: 'Gaming', usage: 120.5 },
        { type: 'Social', usage: 5.5 },
        { type: 'Web Browsing', usage: 30.0 }
      ],
      history: {
        daily: [{ date: '2026-04-06', usage: 0 }],
        weekly: [{ date: 'Week 13', usage: 156.0 }],
        monthly: [{ date: 'April', usage: 156.0 }]
      }
    },
  ];

  // Simulated Protocol Support
  async connectViaSSH(ip: string, user: string, pass: string): Promise<boolean> {
    console.log(`Paramiko (SSH): Connecting to ${ip} as ${user}...`);
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  }

  async connectViaAPI(ip: string, user: string, pass: string): Promise<boolean> {
    console.log(`Requests (HTTP API): Fetching data from http://${ip}/api/stats...`);
    return new Promise(resolve => setTimeout(() => resolve(true), 800));
  }

  async connectViaWeb(ip: string, user: string, pass: string): Promise<boolean> {
    console.log(`Selenium (Web Scraping): Navigating to http://${ip}/login.html...`);
    return new Promise(resolve => setTimeout(() => resolve(true), 2000));
  }

  private settings: RouterSettings = {
    ssid: import.meta.env.PROD ? 'NetGuard_Pro_Secure' : 'NetGuard_Default_Router',
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

  async unblockDevice(id: string): Promise<boolean> {
    const device = this.devices.find(d => d.id === id);
    if (device) {
      device.status = 'online';
      return true;
    }
    return false;
  }

  async unblockAllDevices(): Promise<boolean> {
    this.devices.forEach(d => {
      if (d.status === 'blocked') d.status = 'online';
    });
    return true;
  }

  async renameDevice(id: string, newName: string): Promise<boolean> {
    const device = this.devices.find(d => d.id === id);
    if (device) {
      device.name = newName;
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
