import express from "express";
import cors from "cors";
import axios from "axios";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- Router Drivers (Node.js Implementation) ---
  
  // Huawei Driver Logic
  app.post("/api/router/login", async (req, res) => {
    const { ip, user, password } = req.body;
    try {
      // Simple detection and login simulation for now
      // In a real scenario, we'd use axios to call the router API
      const response = await axios.get(`http://${ip}`, { timeout: 3000 }).catch(() => null);
      let brand = "Generic";
      if (response && response.data.toLowerCase().includes("huawei")) brand = "Huawei";
      
      res.json({ success: true, brand, message: `Connected to ${brand} Gateway` });
    } catch (error) {
      res.status(500).json({ success: false, message: "Connection failed" });
    }
  });

  app.get("/api/router/devices", async (req, res) => {
    // Helper to generate mock chart data
    const genChartData = (isRouter: boolean) => {
      const base = isRouter ? 100 : 10;
      return {
        day: Array.from({ length: 24 }, (_, i) => ({ 
          label: `${i.toString().padStart(2, '0')}:00`, 
          value: Math.floor(Math.random() * base * 5) 
        })),
        week: Array.from({ length: 7 }, (_, i) => ({ 
          label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i], 
          value: Math.floor(Math.random() * base * 20) 
        })),
        month: Array.from({ length: 30 }, (_, i) => ({ 
          label: `${i + 1}`, 
          value: Math.floor(Math.random() * base * 50) 
        }))
      };
    };

    // Mocking real data retrieval for the preview
    const devices = [
      { 
        id: "1", ip: "192.168.1.1", name: "Huawei Gateway", type: "router", mac: "00:11:22:33:44:55", os: "RouterOS", usage: "142.8 GB", status: "online",
        stats: { daily: "4.2 GB", weekly: "28.5 GB", monthly: "142.8 GB", chartData: genChartData(true) }
      },
      { 
        id: "2", ip: "192.168.1.5", name: "Samsung Galaxy S23", type: "mobile", mac: "AA:BB:CC:DD:EE:FF", os: "Android 14", usage: "1.2 GB", status: "online",
        stats: { daily: "150 MB", weekly: "1.2 GB", monthly: "4.5 GB", chartData: genChartData(false) }
      },
      { 
        id: "3", ip: "192.168.1.12", name: "iPhone 15 Pro", type: "mobile", mac: "11:22:33:AA:BB:CC", os: "iOS 17", usage: "850 MB", status: "online",
        stats: { daily: "200 MB", weekly: "850 MB", monthly: "3.2 GB", chartData: genChartData(false) }
      },
      { 
        id: "4", ip: "192.168.1.45", name: "Windows Desktop", type: "pc", mac: "66:77:88:99:00:11", os: "Windows 11", usage: "4.5 GB", status: "online",
        stats: { daily: "1.1 GB", weekly: "4.5 GB", monthly: "18.4 GB", chartData: genChartData(false) }
      },
      { 
        id: "5", ip: "192.168.1.100", name: "Sony Smart TV", type: "media", mac: "CC:DD:EE:FF:00:11", os: "Android TV", usage: "12.8 GB", status: "online",
        stats: { daily: "2.4 GB", weekly: "12.8 GB", monthly: "54.2 GB", chartData: genChartData(false) }
      },
    ];
    res.json(devices);
  });

  app.get("/api/router/traffic", async (req, res) => {
    res.json({
      categories: [
        { name: "Streaming", value: 45, color: "#FF0000" },
        { name: "Social", value: 25, color: "#1877F2" },
        { name: "Gaming", value: 15, color: "#00FF00" },
        { name: "Downloads", value: 10, color: "#FFA500" },
        { name: "Others", value: 5, color: "#888888" }
      ],
      top_apps: [
        { name: "YouTube", usage: "1.2 GB", percentage: 35 },
        { name: "TikTok", usage: "850 MB", percentage: 20 },
        { name: "Facebook", usage: "400 MB", percentage: 12 },
        { name: "Windows Update", usage: "350 MB", percentage: 10 },
        { name: "WhatsApp", usage: "150 MB", percentage: 5 }
      ]
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
