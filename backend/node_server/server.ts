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
import { logToSystem, getSystemLogs } from "./logger.ts";

async function startServer() {
  const app = express();
  
  // Trust the proxy (AI Studio/Cloud Run use Nginx/Envoy as a proxy)
  // This resolves express-rate-limit validation errors regarding X-Forwarded-For
  app.set('trust proxy', true);

  const httpServer = createServer(app);
  const io = setupSocket(httpServer);
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
      xForwardedForHeader: true,
      // Also ignore the 'Forwarded' header warning if we are prioritizing X-Forwarded-For
      forwardedHeader: false 
    },
  });
  app.use("/api/", limiter);

  app.use(cors());
  app.use(express.json());

  // Professional Router Modules
  app.use("/api/router", detectorRouter);

  // Requested trial endpoints
  app.get("/api/devices", (req, res) => {
    res.json([
      { name: "Huawei HG630", status: "Connected", ip: "192.168.1.1" },
      { name: "iPhone 15 Pro", status: "Active", ip: "192.168.1.5" },
      { name: "Windows PC", status: "Connected", ip: "192.168.1.10" }
    ]);
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
