import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'build_logs');
const SYSTEM_LOG = path.join(LOG_DIR, 'system.log');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

export const logToSystem = (level: 'INFO' | 'ERROR' | 'WARN', message: string) => {
  const entry = `[${new Date().toISOString()}] [${level}] ${message}\n`;
  try {
    fs.appendFileSync(SYSTEM_LOG, entry);
  } catch (err) {
    console.error("Failed to write to system log:", err);
  }
  console.log(entry.trim());
};

export const getSystemLogs = () => {
  if (fs.existsSync(SYSTEM_LOG)) {
    return fs.readFileSync(SYSTEM_LOG, 'utf-8');
  }
  return "No logs recorded yet.";
};
