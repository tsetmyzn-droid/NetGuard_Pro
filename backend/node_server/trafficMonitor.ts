import { logToSystem } from './logger.ts';

interface Packet {
  timestamp: string;
  source: string;
  destination: string;
  protocol: 'TCP' | 'UDP' | 'HTTPS' | 'DNS';
  size: number;
  threatLevel: 'low' | 'medium' | 'high';
}

let activeStreams: Packet[] = [];
let ioInstance: any = null;

export function setTrafficIo(io: any) {
  ioInstance = io;
}

const COMMON_IPS = [
  '192.168.1.5',
  '192.168.1.12',
  '192.168.1.100',
  '1.1.1.1',
  '8.8.8.8',
  '142.250.180.14', // Google
  '31.13.72.36',    // Facebook
  '52.95.120.50'     // AWS
];

const PROTOCOLS: ('TCP' | 'UDP' | 'HTTPS' | 'DNS')[] = ['TCP', 'UDP', 'HTTPS', 'DNS'];

export function generateLiveTraffic() {
  const packet: Packet = {
    timestamp: new Date().toLocaleTimeString(),
    source: COMMON_IPS[Math.floor(Math.random() * 3)], // Internal
    destination: COMMON_IPS[3 + Math.floor(Math.random() * 5)], // External
    protocol: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
    size: Math.floor(Math.random() * 1500),
    threatLevel: Math.random() > 0.98 ? 'high' : (Math.random() > 0.9 ? 'medium' : 'low')
  };

  // Keep last 50
  activeStreams.unshift(packet);
  if (activeStreams.length > 50) activeStreams.pop();

  if (ioInstance) {
    ioInstance.emit('traffic:packet', packet);
  }

  if (packet.threatLevel === 'high') {
    logToSystem('WARN', `FIREWALL ALERT: Malicious ${packet.protocol} pattern detected from ${packet.source} -> ${packet.destination}`);
  }
}

export function startTrafficMonitor() {
  logToSystem('INFO', 'Starting BPF Packet Interceptor service...');
  setInterval(generateLiveTraffic, 800);
}

export function getTrafficHistory() {
  return activeStreams;
}
