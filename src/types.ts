export type View = 'login' | 'dashboard' | 'logs' | 'ai-lab';
export type Language = 'ar' | 'en';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: 'mobile' | 'pc' | 'router' | 'iot';
  status: 'online' | 'offline';
  usage: string;
}
