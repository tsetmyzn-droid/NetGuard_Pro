export interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: 'mobile' | 'laptop' | 'desktop' | 'iot' | 'smart-tv';
  status: 'online' | 'offline' | 'blocked';
  uploadSpeed: number; // in Mbps
  downloadSpeed: number; // in Mbps
  usageLimit?: number; // in GB
  currentUsage: number; // in GB
}

export interface NetworkStats {
  currentDownload: number;
  currentUpload: number;
  activeDevices: number;
  uptime: string;
  cpuUsage: number;
  ramUsage: number;
}

export interface ConnectionEvent {
  id: string;
  timestamp: string;
  device: string;
  event: 'joined' | 'left' | 'blocked' | 'unblocked';
}

export interface RouterSettings {
  ssid: string;
  guestSsid: string;
  guestEnabled: boolean;
  channel: number;
  securityMode: string;
}
