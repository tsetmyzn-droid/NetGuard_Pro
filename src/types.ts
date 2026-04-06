export interface AppUsage {
  name: string;
  usage: number; // in GB
  icon?: string;
  color?: string;
}

export interface ContentUsage {
  type: string; // e.g., 'Video', 'Social', 'Gaming'
  usage: number; // in GB
}

export interface UsageHistory {
  date: string;
  usage: number;
}

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
  apps: AppUsage[];
  contentTypes: ContentUsage[];
  history: {
    daily: UsageHistory[];
    weekly: UsageHistory[];
    monthly: UsageHistory[];
  };
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

export type ConnectionType = 'wifi' | 'cellular' | 'none';

export interface MobileDataStats {
  connectionType: ConnectionType;
  operatorName: string;
  signalStrength: number; // 0-100
  dataPlanLimit: number; // in GB
  dataPlanUsed: number; // in GB
  daysRemaining: number;
  isRoaming: boolean;
  apps: AppUsage[];
}
