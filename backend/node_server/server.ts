import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn } from "child_process";
import path from "path";

const app = express();
const PORT = 3000;
const PYTHON_PORT = 8000;

// --- 🚀 تشغيل نواة البايثون (Python Kernel) في الخلفية ---
const pythonProcess = spawn("python3", ["backend/python_server/main.py"], {
    stdio: "inherit",
    env: { ...process.env, PYTHONUNBUFFERED: "1" }
});

pythonProcess.on("error", (err) => {
    console.error("[CRITICAL] Failed to start Python Kernel:", err);
});

// --- 🛡️ الوكيل الشفاف (Transparent Proxy) ---
// هذا الجزء لا يحتوي على أي "منطق برمجي"، فقط يمرر الطلبات للبايثون
app.use(cors());

app.use("/api", createProxyMiddleware({
    target: `http://127.0.0.1:${PYTHON_PORT}`,
    changeOrigin: true,
    logLevel: "debug"
}));

// تمرير الصفحة الرئيسية (Bridge) من البايثون أيضاً
app.get("*all", createProxyMiddleware({
    target: `http://127.0.0.1:${PYTHON_PORT}`,
    changeOrigin: true
}));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DEPLOYMENT BRIDGE] Operating on Port ${PORT}`);
    console.log(`[LOGIC SOURCE] Forwarding all traffic to Python on Port ${PYTHON_PORT}`);
});
