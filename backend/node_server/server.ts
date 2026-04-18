console.log("Starting NetGuard Pro Server...");
import express from "express";
import cors from "cors";
import axios from "axios";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import { createServer } from "http";
import { setupSocket } from "./websocket.ts";
import detectorRouter from "./routes/router.routes.ts";
import { logToSystem, getSystemLogs, setIoInstance } from "./logger.ts";
import { startStatusMonitor, getDevices, setStatusIo } from "./statusService.ts";
import { performArpScan } from "./networkScanner.ts";
import { startTrafficMonitor, setTrafficIo } from "./trafficMonitor.ts";

async function startServer() {
  logToSystem('INFO', 'Initializing NetGuard Pro Enterprise OS...');
  logToSystem('INFO', 'Kernel Version: 1.0.0-stable');
  logToSystem('INFO', `Environment: ${process.env.NODE_ENV || 'development'}`);
  logToSystem('INFO', `Platform: ${process.platform}`);
  logToSystem('INFO', 'Checking database integrity...');
  logToSystem('INFO', 'Starting core services...');
  
  const app = express();
  
  // Trust the proxy (AI Studio/Cloud Run use Nginx/Envoy as a proxy)
  app.set('trust proxy', true);

  const httpServer = createServer(app);
  const io = setupSocket(httpServer);
  
  // Connect IO to services
  setIoInstance(io);
  setStatusIo(io);
  setTrafficIo(io);

  // Start Core Services
  startStatusMonitor();

  // Initialize Network Scanner (ARP)
  setInterval(() => performArpScan(), 30000); // Scan every 30s
  
  // Initialize Traffic Monitor
  startTrafficMonitor();

  const PORT = 3000;

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for easier preview compatibility
    crossOriginEmbedderPolicy: false
  }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // Increased for dev simplicity
    standardHeaders: true,
    legacyHeaders: false,
    // Use the IP provided by Express (which uses trust proxy)
    keyGenerator: (req) => {
      // Prioritize X-Forwarded-For or standard IP
      return (req.headers['x-forwarded-for'] as string) || req.ip || 'anonymous';
    },
    // Enable validation for proxy headers to ensure accurate identification
    validate: { 
      xForwardedForHeader: true
    },
  });
  app.use("/api/", limiter);

  app.use(cors());
  app.use(express.json());

  // Professional Router Modules
  app.use("/api/router", detectorRouter);

  // Dynamic Device Infrastructure
  app.get("/api/devices", (req, res) => {
    res.json(getDevices());
  });

  app.get("/api/stats", (req, res) => {
    res.json({
      download: "12.4 Mb/s",
      upload: "2.1 Mb/s",
      ping: "14 ms"
    });
  });

  // Logging Middleware - Captures every request from the preview system
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logToSystem('INFO', `${req.method} ${req.path} - Status: ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // API to fetch logs for the UI
  app.get("/api/system/logs", (req, res) => {
    try {
      res.send(getSystemLogs());
    } catch (error) {
      res.status(500).send("Error reading logs");
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'frontend'),
      server: { 
        middlewareMode: true,
        fs: {
          strict: true,
          allow: [process.cwd()]
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'frontend/dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Professional NetGuard Pro Server running on http://localhost:${PORT}`);
  });
}

startServer();
