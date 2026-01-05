import express from "express";
import cors from "cors";
import "./config/mongo.js";

// ================= ROUTES =================
import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import companyRoutes from "./routes/company.routes.js";
import routeRoutes from "./routes/route.routes.js";

const app = express();

/* ================= CORS ================= */
/**
 * ✔️ Funciona en:
 * - Render
 * - Web
 * - Expo móvil
 * - Postman
 */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ================= MIDDLEWARES ================= */

// JSON parser
app.use(express.json());

/* ================= HEALTH CHECK ================= */

app.get("/", (_req, res) => {
  res.status(200).send("API OK");
});

/* ================= API ROUTES ================= */

// Auth (login / register)
app.use("/api/auth", authRoutes);

// Companies (OWNER)
// crear empresa, listar empresas del owner (luego)
app.use("/api/companies", companyRoutes);

// Routes (OWNER / PUBLIC)
// crear rutas, listar rutas por empresa
app.use("/api/routes", routeRoutes);

// Trips
// listar viajes (public)
// crear viaje (OWNER)
app.use("/api/trips", tripRoutes);

// Tickets
// comprar ticket
// historial usuario
app.use("/api/tickets", ticketRoutes);


// app.use("/api/companies", companyRoutes);

/* ================= 404 HANDLER ================= */

app.use((_req, res) => {
  res.status(404).json({
    message: "Endpoint no encontrado",
  });
});

export default app;




// import express from "express";
// import cors from "cors";
// import "./config/mongo.js";

// // Routes
// import authRoutes from "./routes/auth.routes.js";
// import ticketRoutes from "./routes/ticket.routes.js";
// import tripRoutes from "./routes/trip.routes.js";

// const app = express();

// /* ================= CORS ================= */
// /**
//  * ✔️ Funciona en:
//  * - Render
//  * - Web
//  * - Expo móvil
//  * - Postman
//  */
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// /* ================= MIDDLEWARES ================= */

// // JSON parser
// app.use(express.json());

// /* ================= HEALTH CHECK ================= */

// app.get("/", (_req, res) => {
//   res.status(200).send("API OK");
// });

// /* ================= API ROUTES ================= */

// // Auth
// app.use("/api/auth", authRoutes);

// // Tickets
// app.use("/api/tickets", ticketRoutes);

// // Trips (crea viaje + crea/reutiliza ruta)
// app.use("/api/trips", tripRoutes);

// /* ================= 404 HANDLER ================= */

// app.use((_req, res) => {
//   res.status(404).json({
//     message: "Endpoint no encontrado",
//   });
// });

// export default app;
