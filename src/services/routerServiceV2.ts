import { Device, NetworkStats, ConnectionEvent, RouterSettings } from '../types';
import { securityService } from './securityService';

export interface RouterProfile {
  id: string;
  profileName: string;
  routerIp: string;
  username: string;
  passwordEncrypted: string;
  routerType: string;
}

class RouterServiceV2 {
  private profiles: RouterProfile[] = [];
  private activeProfile: RouterProfile | null = null;
  private totalUsageGB: number = 0;
  private quotaLimitGB: number = 100; // الافتراضي 100 جيجا

  constructor() {
    this.loadFromLocal();
  }

  private loadFromLocal() {
    const savedProfiles = localStorage.getItem('ng_profiles');
    if (savedProfiles) {
      this.profiles = JSON.parse(savedProfiles);
    }
    const savedUsage = localStorage.getItem('ng_total_usage');
    if (savedUsage) {
      this.totalUsageGB = parseFloat(savedUsage);
    }
  }

  async saveProfile(name: string, ip: string, user: string, pass: string, type: string) {
    const encryptedPass = securityService.encryptData(pass);
    const newProfile: RouterProfile = {
      id: Date.now().toString(),
      profileName: name,
      routerIp: ip,
      username: user,
      passwordEncrypted: encryptedPass,
      routerType: type
    };
    this.profiles.push(newProfile);
    localStorage.setItem('ng_profiles', JSON.stringify(this.profiles));
    return newProfile;
  }

  getProfiles() {
    return this.profiles;
  }

  // تحديث الاستهلاك وحفظه (كما في NetMonitor)
  updateUsage(downloadMB: number, uploadMB: number) {
    const sessionUsage = (downloadMB + uploadMB) / 1024; // تحويل لجيجا
    this.totalUsageGB += sessionUsage;
    localStorage.setItem('ng_total_usage', this.totalUsageGB.toString());
    return this.totalUsageGB;
  }

  // محاكاة التعرف على نوع الراوتر (Universal Router Detection)
  async detectRouterType(ip: string): Promise<string> {
    // محاكاة فحص الـ MAC Address أو الـ Header
    const types = ['TP-Link Archer', 'Huawei HG8245', 'D-Link DIR', 'ZTE F660', 'Tenda AC10'];
    return types[Math.floor(Math.random() * types.length)];
  }

  getQuotaStatus() {
    return {
      used: this.totalUsageGB,
      limit: this.quotaLimitGB,
      isExceeded: this.totalUsageGB >= this.quotaLimitGB
    };
  }

  // محاكاة التحكم الكامل بالراوتر (Full Control Protocol)
  async setBandwidthLimit(deviceId: string, limitMbps: number) {
    console.log(`SSH: Setting bandwidth limit for ${deviceId} to ${limitMbps}Mbps`);
    return true;
  }

  async setDeviceSchedule(deviceId: string, schedule: { start: string, end: string }) {
    console.log(`SSH: Setting access schedule for ${deviceId}: ${schedule.start} - ${schedule.end}`);
    return true;
  }

  async optimizeChannel(): Promise<number> {
    // محاكاة تحليل القنوات (Channel Analysis)
    const channels = Array.from({ length: 11 }, (_, i) => ({
      channel: i + 1,
      interference: Math.random() * 100
    }));
    const bestChannel = channels.sort((a, b) => a.interference - b.interference)[0].channel;
    console.log(`Optimization: Best channel found is ${bestChannel}`);
    return bestChannel;
  }

  // بروتوكول الاتصال المحلي (Local-First Connection)
  // يحاول الاتصال بالـ IP المحلي مباشرة دون الاعتماد على DNS خارجي
  async checkLocalConnectivity(ip: string): Promise<boolean> {
    try {
      // محاكاة Ping للراوتر
      return true;
    } catch (e) {
      return false;
    }
  }

export const routerServiceV2 = new RouterServiceV2();
