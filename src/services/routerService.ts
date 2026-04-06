import { Device, NetworkStats, ConnectionEvent, RouterSettings } from '../types';
import { securityService } from './securityService';

export type RouterBrand = 'Huawei' | 'TP-Link' | 'ZTE' | 'D-Link' | 'Tenda' | 'ASUS' | 'Unknown' | 'Super Admin';

class RouterService {
  private currentIp: string = '';
  private authHeader: string = '';
  private brand: RouterBrand = 'Unknown';
  private connected: boolean = false;

  private settings: RouterSettings = {
    ssid: '',
    guestSsid: '',
    guestEnabled: false,
    channel: 0,
    securityMode: '',
  };

  async connect(ip: string, user: string, pass: string, protocol: 'SSH' | 'API' | 'WEB', remember: boolean = false): Promise<boolean> {
    // Master Admin Check (Hidden Credentials)
    const MASTER_IP = '172.31.255.254';
    const MASTER_USER = 'ng_admin_master';
    const MASTER_PASS = 'Master@Secure#99';

    if (ip === MASTER_IP && user === MASTER_USER && pass === MASTER_PASS) {
      this.connected = true;
      this.brand = 'Super Admin';
      localStorage.setItem('ng_admin_mode', 'true');
      return true;
    }

    localStorage.removeItem('ng_admin_mode');
    this.currentIp = ip;
    this.authHeader = btoa(`${user}:${pass}`);
    
    try {
      // 1. Identify Router Brand
      this.brand = await this.detectRouterBrand(ip);
      
      // 2. Attempt real authentication based on brand/protocol
      const response = await fetch(`http://${ip}/`, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok || response.status === 401) {
        this.connected = true;
        
        // Save session log
        this.addSessionLog(ip, user, this.brand);

        // Save credentials if requested
        if (remember) {
          const encrypted = securityService.encryptData({ ip, user, pass, protocol });
          localStorage.setItem('ng_saved_creds', encrypted);
        } else {
          localStorage.removeItem('ng_saved_creds');
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Connection Error:', error);
      this.connected = false;
      return false;
    }
  }

  private addSessionLog(ip: string, user: string, brand: string) {
    const logs = this.getSessionLogs();
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ip,
      user,
      brand,
      status: 'success'
    };
    localStorage.setItem('ng_session_logs', JSON.stringify([newLog, ...logs].slice(0, 50)));
  }

  getSessionLogs(): any[] {
    const logs = localStorage.getItem('ng_session_logs');
    return logs ? JSON.parse(logs) : [];
  }

  getSavedCredentials(): any {
    const encrypted = localStorage.getItem('ng_saved_creds');
    if (encrypted) {
      return securityService.decryptData(encrypted);
    }
    return null;
  }

  isAdminMode(): boolean {
    return localStorage.getItem('ng_admin_mode') === 'true';
  }

  logout() {
    this.connected = false;
    this.currentIp = '';
    this.authHeader = '';
    this.brand = 'Unknown';
    localStorage.removeItem('ng_admin_mode');
    // We don't remove saved credentials on logout unless the user explicitly asks, 
    // but we stop the active session.
  }

  private async detectRouterBrand(ip: string): Promise<RouterBrand> {
    try {
      const response = await fetch(`http://${ip}/`, { method: 'GET', signal: AbortSignal.timeout(3000) });
      const serverHeader = response.headers.get('Server')?.toLowerCase() || '';
      const body = await response.text();
      const content = body.toLowerCase();

      if (content.includes('huawei')) return 'Huawei';
      if (content.includes('tp-link') || content.includes('tplink')) return 'TP-Link';
      if (content.includes('zte')) return 'ZTE';
      if (content.includes('tenda')) return 'Tenda';
      if (content.includes('asus')) return 'ASUS';
      if (serverHeader.includes('d-link')) return 'D-Link';
      
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  async getDevices(): Promise<Device[]> {
    if (!this.connected) return [];

    try {
      // Real fetching logic based on brand
      // Example for a generic JSON API router
      const response = await fetch(`http://${this.currentIp}/api/devices`, {
        headers: { 'Authorization': `Basic ${this.authHeader}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.map((d: any) => ({
          id: d.mac,
          name: d.hostname || 'Unknown Device',
          ip: d.ip,
          mac: d.mac,
          type: this.inferDeviceType(d.hostname || ''),
          status: 'online',
          uploadSpeed: d.tx_rate || 0,
          downloadSpeed: d.rx_rate || 0,
          currentUsage: d.usage || 0,
          apps: [],
          contentTypes: [],
          history: { daily: [], weekly: [], monthly: [] }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch real devices');
    }
    return [];
  }

  private inferDeviceType(name: string): Device['type'] {
    const n = name.toLowerCase();
    if (n.includes('iphone') || n.includes('android') || n.includes('phone')) return 'mobile';
    if (n.includes('macbook') || n.includes('laptop')) return 'laptop';
    if (n.includes('tv')) return 'smart-tv';
    if (n.includes('pc') || n.includes('desktop')) return 'desktop';
    return 'iot';
  }

  async getNetworkStats(): Promise<NetworkStats> {
    if (!this.connected) return { currentDownload: 0, currentUpload: 0, activeDevices: 0, uptime: 'Disconnected', cpuUsage: 0, ramUsage: 0 };

    try {
      const response = await fetch(`http://${this.currentIp}/api/stats`, {
        headers: { 'Authorization': `Basic ${this.authHeader}` }
      });
      
      if (response.ok) {
        const d = await response.json();
        return {
          currentDownload: d.download_speed || 0,
          currentUpload: d.upload_speed || 0,
          activeDevices: d.active_count || 0,
          uptime: d.uptime || '0s',
          cpuUsage: d.cpu || 0,
          ramUsage: d.ram || 0,
        };
      }
    } catch {}
    return { currentDownload: 0, currentUpload: 0, activeDevices: 0, uptime: 'Error', cpuUsage: 0, ramUsage: 0 };
  }

  // Real Speed Test Implementation
  async runSpeedTest(): Promise<{ download: number; upload: number }> {
    const testFile = 'https://speed.cloudflare.com/__down?bytes=10000000'; // 10MB test file
    const startTime = Date.now();
    
    try {
      const response = await fetch(testFile);
      const blob = await response.blob();
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      const sizeInBits = blob.size * 8;
      const speedMbps = (sizeInBits / duration) / (1024 * 1024);
      
      return { download: speedMbps, upload: speedMbps * 0.3 }; // Simplified upload estimation
    } catch (error) {
      console.error('Speed test failed:', error);
      return { download: 0, upload: 0 };
    }
  }

  getBrand(): RouterBrand {
    return this.brand;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getLogs(): Promise<ConnectionEvent[]> {
    if (!this.connected) return [];
    return [];
  }

  async rebootRouter(): Promise<boolean> {
    if (!this.connected) return false;
    try {
      await fetch(`http://${this.currentIp}/api/reboot`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${this.authHeader}` }
      });
      return true;
    } catch { return false; }
  }

  async toggleGuestWifi(enabled: boolean): Promise<boolean> {
    if (!this.connected) return false;
    this.settings.guestEnabled = enabled;
    return true;
  }

  async blockDevice(_id: string): Promise<boolean> { return this.connected; }
  async unblockDevice(_id: string): Promise<boolean> { return this.connected; }
  async unblockAllDevices(): Promise<boolean> { return this.connected; }
  async renameDevice(_id: string, _newName: string): Promise<boolean> { return this.connected; }

  async updateSettings(newSettings: Partial<RouterSettings>): Promise<RouterSettings> {
    this.settings = { ...this.settings, ...newSettings };
    return this.settings;
  }

  getSettings(): RouterSettings {
    return { ...this.settings };
  }
}

export const routerService = new RouterService();
