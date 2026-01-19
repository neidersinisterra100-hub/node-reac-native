// ===============================
// SERVER ENTRYPOINT
// ===============================

import "dotenv/config";
import app from "./app.js";
import { connectMongo } from "./config/mongo.js";

const PORT = Number(process.env.PORT) || 3000;

/**
 * Arranca el servidor SOLO si Mongo conecta.
 * Evita:
 * - restart loops
 * - EADDRINUSE
 * - estados inconsistentes
 */
const startServer = async () => {
  try {
    await connectMongo();

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


// import "dotenv/config";
// import app from "./app.js";
// import { connectMongo } from "./config/mongo.js";

// const PORT = Number(process.env.PORT) || 3000;

// const startServer = async () => {
//   await connectMongo();

//   app.listen(PORT, "0.0.0.0", () => {
//     console.log(`🚀 [Server] API corriendo en el puerto:${PORT}`);
//   });
// };

// startServer();
