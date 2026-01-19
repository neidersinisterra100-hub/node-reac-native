import "dotenv/config";
import mongoose from "mongoose";

/* =========================================================
   CONFIGURACIÓN GLOBAL DE MONGOOSE
   ========================================================= */

// ❗ Evita buffering infinito de queries
mongoose.set("bufferCommands", false);

/* =========================================================
   VALIDACIÓN DE URI
   ========================================================= */

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ MONGO_URI no definida");
  process.exit(1);
}

/* =========================================================
   CONEXIÓN A MONGO (REPLICA SET)
   ========================================================= */

export const connectMongo = async () => {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ [Mongo] Conectado correctamente");
  } catch (err: any) {
    console.error("❌ [Mongo] Error de conexión");
    console.error(err?.message || err);
    throw err; // ❗ importante
  }
};

export default mongoose;


// // import mongoose from "mongoose";
// // import dotenv from "dotenv";

// // dotenv.config();

// // /* =========================================================
// //    VALIDACIÓN DE ENV (TYPE-SAFE)
// //    ========================================================= */

// // const rawUri = process.env.MONGO_URI;

// // if (!rawUri) {
// //   throw new Error("❌ MONGO_URI no definida en .env");
// // }

// // /**
// //  * 🔐 CLAVE:
// //  * Creamos una NUEVA constante tipada como string
// //  * para que TypeScript NO tenga dudas
// //  */
// // const MONGO_URI: string = rawUri;

// // /* =========================================================
// //    CONFIGURACIÓN
// //    ========================================================= */

// // const RETRY_INTERVAL_MS = 5000;
// // const SERVER_SELECTION_TIMEOUT = 10000;

// // /* =========================================================
// //    FUNCIÓN DE CONEXIÓN (REINTENTO)
// //    ========================================================= */

// // async function connectMongo() {
// //   try {
// //     console.log("⏳ [Mongo] Intentando conexión a MongoDB...");

// //     await mongoose.connect(MONGO_URI, {
// //       serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT,
// //     });

// //     console.log("✅ [Mongo] Conectado a MongoDB Atlas");
// //   } catch (err: any) {
// //     console.error("❌ [Mongo] Error de conexión");
// //     console.error("📛 Código:", err?.code ?? "N/A");
// //     console.error("📛 Mensaje:", err?.message ?? err);

// //     console.log(
// //       `🔁 [Mongo] Reintentando conexión en ${
// //         RETRY_INTERVAL_MS / 1000
// //       }s...\n`
// //     );

// //     setTimeout(connectMongo, RETRY_INTERVAL_MS);
// //   }
// // }

// // /* =========================================================
// //    INICIAR CONEXIÓN (NO BLOQUEA EL SERVER)
// //    ========================================================= */

// // connectMongo();

// // export default mongoose;


// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import { URL } from "url";

// dotenv.config();

// const uri = process.env.MONGO_URI;

// if (!uri) {
//   throw new Error("❌ MONGO_URI no definida en .env");
// }

// /* =========================================================
//    LOGS DE DIAGNÓSTICO (CLAVE)
//    ========================================================= */

// try {
//   const parsed = new URL(uri.replace("mongodb+srv://", "mongodb://"));
//   // console.log("🌍 [Mongo] Host:", parsed.hostname);
//   // console.log("📦 [Mongo] Database:", parsed.pathname.replace("/", ""));
//   // console.log(
//   //   "🔗 [Mongo] Tipo de conexión:",
//   //   uri.startsWith("mongodb+srv://") ? "SRV (DNS)" : "Directa"
//   // );
// } catch {
//   // console.log("⚠️ [Mongo] No se pudo parsear la URI");
// }

// // console.log("⏳ [Mongo] Intentando conexión a MongoDB...");

// /* =========================================================
//    CONEXIÓN (CON TIMEOUT CONTROLADO)
//    ========================================================= */

// mongoose
//   .connect(uri, {
//     serverSelectionTimeoutMS: 10000, // ⏱️ no colgar indefinidamente
//   })
//   .then(() => {
//     console.log("✅ [Mongo] Conectado a MongoDB Atlas");
//   })
//   .catch((err) => {
//     console.error("❌ [Mongo] Error de conexión");
//     console.error("📛 Código:", err.code);
//     console.error("📛 Mensaje:", err.message);
//     console.error("📛 Host:", err.hostname || "N/A");

//     /**
//      * ⚠️ ERROR ESPECÍFICO QUE TÚ TIENES
//      */
//     if (err.code === "ETIMEOUT" || err.message?.includes("queryTxt")) {
//       console.error(
//         "🚨 [Mongo] Falla DNS/SRV. Cloudflare Tunnel NO resuelve mongodb+srv"
//       );
//       console.error(
//         "👉 SOLUCIÓN: usar URI mongodb:// directa (no +srv)"
//       );
//     }

//     process.exit(1); // 🔴 Fallar rápido (mejor que seguir roto)
//   });

// export default mongoose;







// // import mongoose from "mongoose";
// // import dotenv from "dotenv";

// // dotenv.config();

// // const uri = process.env.MONGO_URI;

// // if (!uri) {
// //   throw new Error("❌ MONGO_URI no definida en .env");
// // }

// // mongoose
// //   .connect(uri)
// //   .then(() => console.log("✅ Conectado a MongoDB Atlas"))
// //   .catch((err) =>
// //     console.error("❌ Error MongoDB:", err)
// //   );

// // export default mongoose;
