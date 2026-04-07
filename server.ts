import express from 'express';
import path from 'path';
import sqlite3 from 'sqlite3';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize SQLite Database
  const dbPath = process.env.NODE_ENV === 'production' 
    ? path.join('/tmp', 'netguard_data.db')
    : path.join(process.cwd(), 'netguard_data.db');

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database opening error:', err);
    else console.log(`Connected to database at ${dbPath}`);
  });

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usage_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      download REAL,
      upload REAL,
      total REAL
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mac TEXT UNIQUE,
      name TEXT,
      ip TEXT,
      status TEXT,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });

  // API Routes
  app.post('/api/router/connect', async (req, res) => {
    const { ip, username, password } = req.body;
    try {
      // Router detection and login logic
      // This is a generic implementation that tries to identify the router
      const response = await axios.get(`http://${ip}`, { timeout: 5000 });
      const html = response.data;
      const $ = cheerio.load(html);
      
      let routerType = 'Unknown';
      if (html.includes('Huawei') || html.includes('HG630')) routerType = 'Huawei';
      else if (html.includes('ZTE') || html.includes('ZXHN')) routerType = 'ZTE';
      else if (html.includes('TP-LINK')) routerType = 'TP-Link';

      // Simulate login and data extraction for now
      // In a real scenario, we would perform the specific login flow for each router
      res.json({ 
        success: true, 
        routerType,
        message: `Connected to ${routerType} router at ${ip}`
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Please check your connection and credentials' });
    }
  });

  app.get('/api/usage/history', (req, res) => {
    db.all('SELECT * FROM usage_history ORDER BY date DESC LIMIT 30', (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(rows);
    });
  });

  app.post('/api/usage/record', (req, res) => {
    const { date, download, upload, total } = req.body;
    db.run(
      'INSERT OR REPLACE INTO usage_history (date, download, upload, total) VALUES (?, ?, ?, ?)',
      [date, download, upload, total],
      (err) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true });
      }
    );
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
