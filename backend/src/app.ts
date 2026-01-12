// ===============================
// IMPORTS PRINCIPALES
// ===============================

// Express es el framework HTTP.
// Se encarga de recibir requests y enviar responses.
import express from "express";

// CORS permite que clientes externos (Expo, Web, Postman)
// puedan consumir esta API sin bloqueos del navegador.
import cors from "cors";

// ⚠️ Este import NO se guarda en una variable.
// Solo se ejecuta el archivo.
// Su responsabilidad es conectarse a MongoDB.
// Si la conexión falla, la app debería fallar.
import "./config/mongo.js";

// ===============================
// IMPORTACIÓN DE RUTAS (MAPA DE LA API)
// ===============================

// Cada uno de estos archivos define un grupo de endpoints.
// Este archivo NO conoce la lógica interna,
// solo los registra bajo una URL base.

import authRoutes from "./routes/auth.routes.js";       // Login, registro, auth
import ticketRoutes from "./routes/ticket.routes.js";   // Compra y consulta de tickets
import tripRoutes from "./routes/trip.routes.js";       // Viajes
import companyRoutes from "./routes/company.routes.js"; // Empresas
import routeRoutes from "./routes/route.routes.js";     // Rutas fluviales
import reportRoutes from "./routes/report.routes.js";   // Reportes
import scheduleRoutes from "./routes/schedule.routes.js"; 
// 👆 Calendarios / horarios de viajes

// ===============================
// CREACIÓN DE LA APLICACIÓN
// ===============================

// Aquí se crea la instancia principal del servidor.
// A partir de aquí se configuran middlewares y rutas.
const app = express();

// ===============================
// CONFIGURACIÓN DE CORS
// ===============================
/**
 * ✔️ Compatible con:
 * - Expo (mobile)
 * - Web
 * - ngrok
 * - Postman
 *
 * Esta configuración es flexible y pensada
 * para desarrollo y testing.
 */
app.use(
  cors({
    // origin indica desde dónde viene la request
    origin: (origin, callback) => {
      // Si NO hay origin (Postman, apps móviles)
      // se permite la petición
      if (!origin) return callback(null, true);

      // Si hay origin, se permite tal cual
      return callback(null, origin);
    },

    // Permite envío de cookies o headers de auth
    credentials: true,

    // Métodos HTTP permitidos
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

    // Headers permitidos (JWT, ngrok, etc)
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
      "bypass-tunnel-reminder",
    ],
  })
);

// ===============================
// RESPUESTA A PREFLIGHT (OPTIONS)
// ===============================

// Esto permite que el navegador confirme
// si puede hacer una petición antes de enviarla.
// Sin esto, muchas apps web fallan.
app.options("*", cors());

// ===============================
// MIDDLEWARES GLOBALES
// ===============================

// Convierte automáticamente el body JSON
// en un objeto accesible vía req.body
app.use(express.json());

// ===============================
// HEALTH CHECK
// ===============================

// Endpoint simple para verificar
// que la API está viva y respondiendo.
app.get("/", (_req, res) => {
  res.status(200).send("API OK");
});

// ===============================
// REGISTRO DE RUTAS DE LA API
// ===============================

// Cada app.use define una URL base.
// Todo lo que esté dentro del router
// se monta debajo de esa ruta.

app.use("/api/auth", authRoutes);           // /api/auth/*
app.use("/api/companies", companyRoutes);   // /api/companies/*
app.use("/api/routes", routeRoutes);        // /api/routes/*
app.use("/api/trips", tripRoutes);          // /api/trips/*
app.use("/api/tickets", ticketRoutes);      // /api/tickets/*
app.use("/api/reports", reportRoutes);      // /api/reports/*
app.use("/api/schedules", scheduleRoutes);  // /api/schedules/*

// ===============================
// MANEJO GLOBAL DE 404
// ===============================

// Si ninguna ruta anterior coincide,
// se responde con error 404.
app.use((_req, res) => {
  res.status(404).json({
    message: "Endpoint no encontrado",
  });
});

// ===============================
// EXPORTACIÓN DE LA APP
// ===============================

// Se exporta la app para poder:
// - Levantar el servidor en otro archivo
// - Hacer testing
// - Separar configuración de ejecución
export default app;

// import express from "express";
// import cors from "cors";
// import "./config/mongo.js";

// // ================= ROUTES =================
// import authRoutes from "./routes/auth.routes.js";
// import ticketRoutes from "./routes/ticket.routes.js";
// import tripRoutes from "./routes/trip.routes.js";
// import companyRoutes from "./routes/company.routes.js";
// import routeRoutes from "./routes/route.routes.js";
// import reportRoutes from "./routes/report.routes.js";

// const app = express();

// /* ================= CORS ================= */
// /**
//  * ✔️ Compatible con:
//  * - Expo (exp.direct)
//  * - ngrok
//  * - Web
//  * - Postman
//  */
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Permite requests sin origin (Postman, mobile)
//       if (!origin) return callback(null, true);

//       return callback(null, origin);
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//       "ngrok-skip-browser-warning",
//       "bypass-tunnel-reminder",
//     ],
//   })
// );

// // 🔥 RESPONDER PRE-FLIGHT
// app.options("*", cors());

// /* ================= MIDDLEWARES ================= */

// // JSON parser
// app.use(express.json());

// /* ================= HEALTH CHECK ================= */

// app.get("/", (_req, res) => {
//   res.status(200).send("API OK");
// });

// /* ================= API ROUTES ================= */

// app.use("/api/auth", authRoutes);
// app.use("/api/companies", companyRoutes);
// app.use("/api/routes", routeRoutes);
// app.use("/api/trips", tripRoutes);
// app.use("/api/tickets", ticketRoutes);
// app.use("/api/reports", reportRoutes); // 👈 Nuevas rutas de reportes (Pro)

// /* ================= 404 ================= */

// app.use((_req, res) => {
//   res.status(404).json({
//     message: "Endpoint no encontrado",
//   });
// });

// export default app;
