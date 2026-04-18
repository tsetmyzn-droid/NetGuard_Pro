import { logToSystem } from './logger.ts';

interface ScannedDevice {
  ip: string;
  mac: string;
  vendor: string;
  name: string;
  status: 'online' | 'offline';
  lastSeen: string;
  blocked: boolean;
  type: 'mobile' | 'pc' | 'iot';
}

let discoveredDevices: ScannedDevice[] = [
  { 
    ip: '192.168.1.5', 
    mac: 'BC:D0:74:12:34:56', 
    vendor: 'Apple Inc.', 
    name: 'iPhone 15 Pro', 
    status: 'online', 
    lastSeen: new Date().toISOString(),
    blocked: false,
    type: 'mobile'
  },
  { 
    ip: '192.168.1.12', 
    mac: '00:1A:2B:3C:4D:5E', 
    vendor: 'Samsung Electronics', 
    name: 'SM-G991B', 
    status: 'online', 
    lastSeen: new Date().toISOString(),
    blocked: false,
    type: 'mobile'
  },
  { 
    ip: '192.168.1.100', 
    mac: 'A0:B1:C2:D3:E4:F5', 
    vendor: 'Microsoft Corp.', 
    name: 'Surface-Laptop-4', 
    status: 'online', 
    lastSeen: new Date().toISOString(),
    blocked: false,
    type: 'pc'
  }
];

export function getDiscoveredDevices() {
  return discoveredDevices;
}

export function toggleDeviceBlock(mac: string) {
  const device = discoveredDevices.find(d => d.mac === mac);
  if (device) {
    device.blocked = !device.blocked;
    logToSystem('INFO', `Security Policy Update: Device ${device.name} (${mac}) is now ${device.blocked ? 'BLOCKED' : 'UNBLOCKED'}`);
    return true;
  }
  return false;
}

// In a real environment, this would run node-libnmap or local-devices
export async function performArpScan() {
  logToSystem('INFO', 'Initiating ARP Subnet Scan [192.168.1.0/24]...');
  
  // Simulate finding a new device occasionally
  if (Math.random() > 0.8) {
     const newIp = `192.168.1.${Math.floor(Math.random() * 254)}`;
     if (!discoveredDevices.find(d => d.ip === newIp)) {
        discoveredDevices.push({
           ip: newIp,
           mac: 'XX:XX:XX:XX:XX:XX'.replace(/X/g, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]),
           vendor: 'Detected Hardware',
           name: 'New Node Found',
           status: 'online',
           lastSeen: new Date().toISOString(),
           blocked: false,
           type: 'iot'
        });
        logToSystem('WARN', `Intrusion detection alert: New device detected at ${newIp}`);
     }
  }

  // Update last seen
  discoveredDevices.forEach(d => {
    if (d.status === 'online') d.lastSeen = new Date().toISOString();
  });

  return discoveredDevices;
}
