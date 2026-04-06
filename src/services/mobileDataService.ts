import { MobileDataStats, ConnectionType } from '../types';

class MobileDataService {
  private stats: MobileDataStats = {
    connectionType: 'wifi',
    operatorName: 'Vodafone EG',
    signalStrength: 85,
    dataPlanLimit: 20,
    dataPlanUsed: 12.4,
    daysRemaining: 12,
    isRoaming: false,
    apps: [
      { name: 'YouTube', usage: 4.2 },
      { name: 'TikTok', usage: 3.5 },
      { name: 'Instagram', usage: 2.1 },
      { name: 'WhatsApp', usage: 0.8 },
      { name: 'Chrome', usage: 1.8 }
    ]
  };

  async getStats(): Promise<MobileDataStats> {
    // Simulate network delay and dynamic data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          ...this.stats,
          signalStrength: Math.floor(Math.random() * 40) + 60, // 60-100
          dataPlanUsed: this.stats.dataPlanUsed + (Math.random() * 0.1), // Simulate small usage increase
          apps: this.stats.apps.map(app => ({
            ...app,
            usage: app.usage + (Math.random() * 0.05)
          }))
        });
      }, 500);
    });
  }

  async getConnectionType(): Promise<ConnectionType> {
    return this.stats.connectionType;
  }

  async setConnectionType(type: ConnectionType): Promise<void> {
    this.stats.connectionType = type;
  }

  async updateDataPlan(limit: number): Promise<void> {
    this.stats.dataPlanLimit = limit;
  }
}

export const mobileDataService = new MobileDataService();
