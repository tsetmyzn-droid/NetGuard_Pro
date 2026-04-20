console.log("Starting NetGuard Pro Server...");
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { createServer } from "http";
import { createServer as createViteServer } from "vite";

import { setupSocket } from "./websocket.ts";
import detectorRouter from "./routes/router.routes.ts";
import { logToSystem, getSystemLogs, setIoInstance } from "./logger.ts";
import { startStatusMonitor, getDevices, setStatusIo } from "./statusService.ts";
import { performArpScan } from "./networkScanner.ts";
import { startTrafficMonitor, setTrafficIo } from "./trafficMonitor.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.set('trust proxy', true);

  const httpServer = createServer(app);
  const io = setupSocket(httpServer);
  
  setIoInstance(io);
  setStatusIo(io);
  setTrafficIo(io);

  startStatusMonitor();
  setInterval(() => performArpScan(), 30000);
  // startTrafficMonitor(); // Managed by socket connections now

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => (req.headers['x-forwarded-for'] as string) || req.ip || 'anonymous',
  });

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use("/api/router", detectorRouter);
  app.get("/api/devices", (req, res) => res.json(getDevices()));
  app.get("/api/system/logs", (req, res) => res.send(getSystemLogs()));
  app.get("/api/stats", (req, res) => res.json({ download: "12.4 Mb/s", upload: "2.1 Mb/s", ping: "14 ms" }));

  // Efficiency Audit: Traffic Monitor control
  io.on('connection', (socket) => {
    logToSystem('INFO', `Client connected: ${socket.id}`);
    startTrafficMonitor(); // Ensure running when a client connects
  });

  // --- Vite Middleware (Development) ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: process.cwd(),
      mode: 'development',
      server: { middlewareMode: true },
      appType: "spa",
      optimizeDeps: { disabled: true }, // Disable to avoid OOM or conversion errors
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
    }
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    logToSystem('INFO', `NetGuard Pro Kernel Operational on port ${PORT}`);
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
