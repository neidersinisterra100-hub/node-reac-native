import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectMongo } from "./config/mongo.js";
import { startSeatExpirationJob } from "./jobs/seatExpiration.job.js";
import { initRedis } from './lib/redis.client.js';
import { initChatGateway } from './sockets/chat.gateway.js';

await initRedis();

const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await connectMongo();
    startSeatExpirationJob();

    // Wrap Express with http.Server so Socket.IO can share the same port
    const httpServer = http.createServer(app);

    // Initialize Socket.IO chat gateway — MUST await before listen
    await initChatGateway(httpServer);

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 [Server] API + WebSocket corriendo en el puerto:${PORT}`);
    });

    httpServer.on("error", (err: any) => {
      console.error("❌ [Server] Error al iniciar", err.message);
      process.exit(1);
    });
  } catch (err) {
    console.error("❌ [Server] No se pudo iniciar el backend");
    process.exit(1);
  }
};

startServer();
