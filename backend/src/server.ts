import "dotenv/config";
import app from "./app.js";
import { connectMongo } from "./config/mongo.js";
import { startSeatExpirationJob } from "./jobs/seatExpiration.job.js";
import { initRedis } from './lib/redis.client.js';


await initRedis();

const PORT = Number(process.env.PORT) || 3000;

/**
 * Arranca el servidor SOLO si Mongo conecta.
 * MongoDB TTL se encarga de liberar asientos.
 */
const startServer = async () => {
  try {
    await connectMongo();
    // después de conectar Mongo
    startSeatExpirationJob();
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 [Server] API corriendo en el puerto:${PORT}`);
    });

    server.on("error", (err: any) => {
      console.error("❌ [Server] Error al iniciar", err.message);
      process.exit(1);
    });
  } catch (err) {
    console.error("❌ [Server] No se pudo iniciar el backend");
    process.exit(1);
  }
};

startServer();
