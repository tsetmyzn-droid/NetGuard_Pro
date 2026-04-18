export type View = 'login' | 'dashboard' | 'logs' | 'build_logs' | 'settings' | 'about';
export type Language = 'ar' | 'en';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface UsageStats {
  daily: string;
  weekly: string;
  monthly: string;
  chartData: {
    day: { label: string; value: number }[];
    week: { label: string; value: number }[];
    month: { label: string; value: number }[];
  };
}

export interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: 'mobile' | 'pc' | 'router' | 'iot' | 'media';
  status: 'online' | 'offline';
  usage: string;
  os?: string;
  stats?: UsageStats;
}
