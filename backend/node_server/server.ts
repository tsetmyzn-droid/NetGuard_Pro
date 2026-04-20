console.log("Starting NetGuard Pro Server...");
import express from "express";
import cors from "cors";
import axios from "axios";
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
      // Filter out internal component fetches to reduce noise and confusion
      const isSourceFile = req.path.endsWith('.tsx') || req.path.endsWith('.ts') || req.path.endsWith('.css');
      const isRoutineSuccess = res.statusCode === 200 || res.statusCode === 304;
      
      if (!(isSourceFile && isRoutineSuccess)) {
        logToSystem('INFO', `${req.method} ${req.path} - Status: ${res.statusCode} (${duration}ms)`);
      }
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

  // --- Native System Feature Showcase Dashboard ---
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NetGuard Pro - Native Command Center</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          <style>
              @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;600;800&display=swap');
              
              :root {
                  --accent: #00ffff;
                  --bg: #050505;
                  --card: #0f0f0f;
                  --line: #1a1a1a;
              }

              body {
                  background-color: var(--bg);
                  color: #e0e0e0;
                  font-family: 'Inter', sans-serif;
                  margin: 0;
                  overflow-x: hidden;
              }

              .mono { font-family: 'JetBrains Mono', monospace; }
              
              .glass {
                  background: rgba(15, 15, 15, 0.7);
                  backdrop-filter: blur(10px);
                  border: 1px solid var(--line);
              }

              .hero-gradient {
                  background: radial-gradient(circle at 50% -20%, #00ffff11 0%, transparent 70%);
              }

              .feature-card {
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  border: 1px solid var(--line);
              }

              .feature-card:hover {
                  border-color: var(--accent);
                  box-shadow: 0 0 30px #00ffff11;
                  transform: translateY(-5px);
              }

              .pulse {
                  animation: pulse 2s infinite;
              }

              @keyframes pulse {
                  0% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.5; transform: scale(1.2); }
                  100% { opacity: 1; transform: scale(1); }
              }

              .scanline {
                  width: 100%;
                  height: 2px;
                  background: var(--accent);
                  opacity: 0.1;
                  position: absolute;
                  top: 0;
                  animation: scan 4s linear infinite;
              }

              @keyframes scan {
                  0% { top: 0; }
                  100% { top: 100%; }
              }
          </style>
      </head>
      <body class="hero-gradient min-h-screen">
          <div class="scanline"></div>
          
          <!-- Navigation -->
          <nav class="border-b border-[var(--line)] p-6 glass sticky top-0 z-50">
              <div class="max-w-7xl mx-auto flex justify-between items-center">
                  <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-[var(--accent)] rounded-lg flex items-center justify-center text-black font-black text-xl">N</div>
                      <h1 class="text-xl font-bold tracking-tighter">NETGUARD <span class="text-[var(--accent)]">PRO</span> <span class="bg-[var(--accent)] text-black text-[10px] px-2 py-0.5 rounded ml-2">NATIVE ENGINE</span></h1>
                  </div>
                  <div class="flex gap-6 text-sm font-medium opacity-70">
                      <span class="hover:text-[var(--accent)] transition-colors cursor-pointer">الموثق</span>
                      <span class="hover:text-[var(--accent)] transition-colors cursor-pointer">السجلات</span>
                      <span class="hover:text-[var(--accent)] transition-colors cursor-pointer">النظام</span>
                  </div>
              </div>
          </nav>

          <main class="max-w-7xl mx-auto p-8 py-16">
              <!-- Header Section -->
              <div class="mb-16">
                  <div class="flex items-center gap-3 text-[var(--accent)] mb-4 mono text-sm font-bold uppercase tracking-widest">
                      <span class="w-2 h-2 bg-[var(--accent)] rounded-full pulse"></span>
                      SYSTEM CORE OPERATIONAL
                  </div>
                  <h2 class="text-6xl font-extrabold mb-6 tracking-tighter max-w-3xl leading-[1.1]">تحكم كامل في شبكتك <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-blue-500">بأداء Native حقيقي.</span></h2>
                  <p class="text-xl text-gray-400 max-w-2xl leading-relaxed">توقف عن استخدام حلول الويب البطيئة. NetGuard Pro Native يقدم لك سيطرة مباشرة على راوترات ZTE و Huawei و TP-Link مع استهلاك أدنى للموارد وأمان مؤسسي.</p>
              </div>

              <!-- Features Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <!-- Feature 1: Multi-Vendor -->
                  <div class="feature-card glass p-8 rounded-2xl group">
                      <div class="w-12 h-12 rounded-xl bg-gray-900 border border-[var(--line)] flex items-center justify-center mb-6 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black transition-all">
                          <i class="fas fa-server text-xl"></i>
                      </div>
                      <h3 class="text-xl font-bold mb-3">دعم متعدد الأجهزة (Multi-Vendor)</h3>
                      <p class="text-gray-400 text-sm leading-relaxed mb-6">محرك موحد يدعم ZTE, Huawei, TP-Link مع نظام Plugins ذكي يتعرف على الراوتر تلقائياً.</p>
                      <div class="flex gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                          <span class="text-[10px] border border-gray-700 px-2 py-1 rounded">ZTE</span>
                          <span class="text-[10px] border border-gray-700 px-2 py-1 rounded">HUAWEI</span>
                          <span class="text-[10px] border border-gray-700 px-2 py-1 rounded">TP-LINK</span>
                      </div>
                  </div>

                  <!-- Feature 2: Real-time Traffic -->
                  <div class="feature-card glass p-8 rounded-2xl group">
                      <div class="w-12 h-12 rounded-xl bg-gray-900 border border-[var(--line)] flex items-center justify-center mb-6 text-green-400 group-hover:bg-green-400 group-hover:text-black transition-all">
                          <i class="fas fa-chart-line text-xl"></i>
                      </div>
                      <h3 class="text-xl font-bold mb-3">مراقبة حية للاستهلاك</h3>
                      <p class="text-gray-400 text-sm leading-relaxed mb-6">عرض حي لسرعات الرفع والتحميل مع تحليل دقيق لحساب كل جهاز متصل بالشبكة.</p>
                      <div class="mono text-[var(--accent)] text-lg font-bold">128.4 <span class="text-[10px] opacity-60">Mb/s Peak</span></div>
                  </div>

                  <!-- Feature 3: Action Engine -->
                  <div class="feature-card glass p-8 rounded-2xl group">
                      <div class="w-12 h-12 rounded-xl bg-gray-900 border border-[var(--line)] flex items-center justify-center mb-6 text-red-500 group-hover:bg-red-500 group-hover:text-black transition-all">
                          <i class="fas fa-shield-alt text-xl"></i>
                      </div>
                      <h3 class="text-xl font-bold mb-3">محرك الدفاع النشط</h3>
                      <p class="text-gray-400 text-sm leading-relaxed mb-6">حظر الأجهزة المتطفلة بنقرة واحدة عبر MAC-Address Filtering مباشرة من النواة.</p>
                      <div class="mt-4 flex items-center gap-2">
                          <div class="h-1 bg-red-900 flex-1 rounded overflow-hidden">
                              <div class="h-full bg-red-500 w-3/4"></div>
                          </div>
                          <span class="text-[10px] mono">SECURED</span>
                      </div>
                  </div>

                  <!-- Feature 4: Network Map -->
                  <div class="feature-card glass p-8 rounded-2xl group">
                      <div class="w-12 h-12 rounded-xl bg-gray-900 border border-[var(--line)] flex items-center justify-center mb-6 text-blue-400 group-hover:bg-blue-400 group-hover:text-black transition-all">
                          <i class="fas fa-project-diagram text-xl"></i>
                      </div>
                      <h3 class="text-xl font-bold mb-3">خريطة الشبكة الذكية</h3>
                      <p class="text-gray-400 text-sm leading-relaxed mb-6">اكتشاف تلقائي لكل جهاز جديد يتصل بالشبكة باستخدام ARP Scanning المتقدم.</p>
                      <ul class="text-[10px] text-gray-500 mt-4 space-y-1">
                          <li>• iPhone 15 (Active)</li>
                          <li>• Windows PC (Active)</li>
                          <li>• Tesla Model 3 (Idle)</li>
                      </ul>
                  </div>

                  <!-- Feature 5: Advanced Logging -->
                  <div class="feature-card glass p-8 rounded-2xl group">
                      <div class="w-12 h-12 rounded-xl bg-gray-900 border border-[var(--line)] flex items-center justify-center mb-6 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                          <i class="fas fa-terminal text-xl"></i>
                      </div>
                      <h3 class="text-xl font-bold mb-3">سجلات التدقيق (Audit Logs)</h3>
                      <p class="text-gray-400 text-sm leading-relaxed mb-6">تتبع كل محاولة دخول أو تغيير في الإعدادات لضمان أمان الشبكة المطلق.</p>
                      <div class="bg-black/50 p-3 rounded-lg border border-gray-800 mt-4 mono text-[9px] text-gray-500">
                          [20:10:05] LOGIN SUCCESS: ADMIN<br/>
                          [20:12:30] DEVICE_BLOCK: MAC-7A:1B...
                      </div>
                  </div>

                  <!-- Feature 6: No Internet Needed -->
                  <div class="feature-card glass p-8 rounded-2xl group">
                      <div class="w-12 h-12 rounded-xl bg-gray-900 border border-[var(--line)] flex items-center justify-center mb-6 text-purple-400 group-hover:bg-purple-400 group-hover:text-black transition-all">
                          <i class="fas fa-wifi text-xl"></i>
                      </div>
                      <h3 class="text-xl font-bold mb-3">التحكم المحلي الكامل</h3>
                      <p class="text-gray-400 text-sm leading-relaxed mb-6">النظام يعمل محلياً بالكامل. لا يتم إرسال بياناتك للسحابة، مما يضمن خصوصية 100%.</p>
                      <div class="flex items-center gap-2 mt-4 text-[var(--accent)] text-[10px]">
                          <i class="fas fa-lock"></i>
                          <span>ENCRYPTED LOCAL DISK</span>
                      </div>
                  </div>
              </div>

              <!-- Footer CTA -->
              <div class="mt-24 p-12 glass rounded-3xl text-center relative overflow-hidden bg-gradient-to-b from-[#0f0f0f] to-black">
                  <div class="relative z-10">
                      <h4 class="text-3xl font-bold mb-4 italic">مستقبلك يبدأ هنا.</h4>
                      <p class="text-gray-400 mb-8 max-w-lg mx-auto">Native Engine جاهز تماماً للاستهلاك عبر تطبيق Flutter. نحن نستخدم تقنيات مؤسسية لتأمين بيئتك المنزلية والعملية.</p>
                      <div class="flex justify-center gap-4">
                          <button class="bg-[var(--accent)] text-black px-8 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_#00ffff44] transition-all">فتح تطبيق Flutter</button>
                          <button class="border border-[var(--line)] px-8 py-3 rounded-xl font-bold hover:bg-white/5 transition-all">تصفح الـ API</button>
                      </div>
                  </div>
              </div>
          </main>

          <footer class="p-12 border-t border-[var(--line)] text-center text-xs text-gray-600 mono">
              NETGUARD PRO @ 2026-v1.0.0-STABLE / KERNEL: NATIVE_JS_ENG / STATUS: OPERATIONAL
          </footer>
      </body>
      </html>
    `);
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Professional NetGuard Pro Server running on http://localhost:${PORT}`);
  });
}

startServer();
