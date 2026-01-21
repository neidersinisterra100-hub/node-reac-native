import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import companyRoutes from "./routes/company.routes.js";
import routeRoutes from "./routes/route.routes.js";
import reportRoutes from "./routes/report.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

/* =========================================================
   CORS
   ========================================================= */
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "bypass-tunnel-reminder",
      "ngrok-skip-browser-warning",
    ],
  })
);

app.options("*", cors());
app.use(express.json());

/* =========================================================
   HEALTH CHECK
   ========================================================= */
app.get("/", (_req, res) => {
  res.status(200).send("API OK");
});

/* =========================================================
   LOGGER SIMPLE
   ========================================================= */
app.use((req, _res, next) => {
  console.log("➡️", req.method, req.originalUrl);
  next();
});

/* =========================================================
   ROUTES
   ========================================================= */
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/schedules", scheduleRoutes);

/* =========================================================
   404 — ENDPOINT NO ENCONTRADO
   ========================================================= */
app.use((_req, res) => {
  res.status(404).json({
    message: "Endpoint no encontrado",
  });
});

/* =========================================================
   ERROR HANDLER GLOBAL (ESCUDO FINAL)
   ========================================================= */
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("🔥 ERROR GLOBAL:", err);

    // Error lanzado manualmente con status
    if (err.status && err.message) {
      return res.status(err.status).json({
        message: err.message,
      });
    }

    // Error de JSON malformado
    if (err instanceof SyntaxError) {
      return res.status(400).json({
        message: "JSON inválido",
      });
    }

    // Fallback seguro (NUNCA filtra stack)
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
);

/* ...todas las rutas arriba... */

// 404 ya esta arriba
// app.use((_req, res) => {
//   res.status(404).json({ message: "Endpoint no encontrado" });
// });

// ❗️SIEMPRE AL FINAL
app.use(errorHandler);

export default app;



// // ===============================
// // IMPORTS PRINCIPALES
// // ===============================

// import "dotenv/config";
// import express from "express";
// import cors from "cors";

// // ✔️ SOLO UNA CONEXIÓN A MONGO
// import "./config/mongo.js";

// // ===============================
// // IMPORTACIÓN DE RUTAS
// // ===============================

// import authRoutes from "./routes/auth.routes.js";
// import ticketRoutes from "./routes/ticket.routes.js";
// import tripRoutes from "./routes/trip.routes.js";
// import companyRoutes from "./routes/company.routes.js";
// import routeRoutes from "./routes/route.routes.js";
// import reportRoutes from "./routes/report.routes.js";
// import scheduleRoutes from "./routes/schedule.routes.js";

// // ===============================
// // CREACIÓN DE LA APP
// // ===============================

// const app = express();

// // ===============================
// // CORS
// // ===============================

// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//       "bypass-tunnel-reminder",
//       "ngrok-skip-browser-warning",
//     ],
//   })
// );

// app.options("*", cors());

// // ===============================
// // MIDDLEWARES
// // ===============================

// app.use(express.json());

// // ===============================
// // HEALTH
// // ===============================

// app.get("/", (_req, res) => {
//   res.status(200).send("API OK");
// });

// // ===============================
// // LOGGER
// // ===============================

// app.use((req, _res, next) => {
//   console.log("➡️", req.method, req.originalUrl);
//   next();
// });

// // ===============================
// // RUTAS
// // ===============================

// app.use("/api/auth", authRoutes);
// app.use("/api/companies", companyRoutes);
// app.use("/api/routes", routeRoutes);
// app.use("/api/trips", tripRoutes);
// app.use("/api/tickets", ticketRoutes);
// app.use("/api/reports", reportRoutes);
// app.use("/api/schedules", scheduleRoutes);

// // ===============================
// // 404
// // ===============================

// app.use((_req, res) => {
//   res.status(404).json({ message: "Endpoint no encontrado" });
// });

// export default app;
