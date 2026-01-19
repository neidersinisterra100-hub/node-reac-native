import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import companyRoutes from "./routes/company.routes.js";
import routeRoutes from "./routes/route.routes.js";
import reportRoutes from "./routes/report.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";

const app = express();

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

app.get("/", (_req, res) => {
  res.status(200).send("API OK");
});

app.use((req, _res, next) => {
  console.log("➡️", req.method, req.originalUrl);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/schedules", scheduleRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Endpoint no encontrado" });
});

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
