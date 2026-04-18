import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { logToSystem, setIoInstance } from "./logger.ts";

export function setupSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  setIoInstance(io);

  io.on("connection", (socket) => {
    logToSystem('INFO', `Client connected to real-time bridge: ${socket.id}`);
    
    // Periodically emit mock network pulse for real-time graphs if no hardware connected
    const interval = setInterval(() => {
      socket.emit("network:pulse", {
        upload: Math.random() * 10,
        download: Math.random() * 50,
        timestamp: Date.now()
      });
    }, 2000);

    socket.on("disconnect", () => {
      logToSystem('INFO', `Client disconnected: ${socket.id}`);
      clearInterval(interval);
    });
  });

  return io;
}
