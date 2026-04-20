import ping from 'ping';
import { logToSystem } from './logger.ts';

interface DeviceStatus {
  ip: string;
  name: string;
  status: 'online' | 'offline' | 'issue';
  lastChecked: string;
  latency?: number;
}

let devices: DeviceStatus[] = [
  { ip: '192.168.1.1', name: 'Primary Router', status: 'online', lastChecked: new Date().toISOString() },
  { ip: '1.1.1.1', name: 'External Gateway (Cloudflare)', status: 'online', lastChecked: new Date().toISOString() },
  { ip: '8.8.8.8', name: 'DNS Interface (Google)', status: 'online', lastChecked: new Date().toISOString() }
];

let ioInstance: any = null;

export function setStatusIo(io: any) {
  ioInstance = io;
}

export function getDevices() {
  return devices;
}

export async function checkDeviceStatus() {
  const results = await Promise.all(
    devices.map(async (device) => {
      try {
        const res = await ping.promise.probe(device.ip, {
          timeout: 2,
        });
        
        const prevStatus = device.status;
        const newStatus = res.alive ? 'online' : 'offline';
        
        device.status = newStatus;
        device.latency = res.time !== 'unknown' ? parseFloat(res.time) : undefined;
        device.lastChecked = new Date().toISOString();

        if (prevStatus !== newStatus) {
          logToSystem(newStatus === 'online' ? 'INFO' : 'WARN', `Node ${device.name} (${device.ip}) is now ${newStatus.toUpperCase()}`);
        }

        return device;
      } catch (error) {
        device.status = 'issue';
        return device;
      }
    })
  );

  devices = results;
  
  if (ioInstance) {
    ioInstance.emit('devices:update', devices);
  }
}

let isMonitorRunning = false;

export function startStatusMonitor() {
  if (isMonitorRunning) return;
  isMonitorRunning = true;
  logToSystem('INFO', 'Starting real-time network node monitor...');
  // Initial check
  checkDeviceStatus();
  // Poll every 10 seconds
  setInterval(checkDeviceStatus, 10000);
}
