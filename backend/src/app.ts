import express from "express";
import cors from "cors";

/* ===============================
   ROUTES
   =============================== */
import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import companyRoutes from "./routes/company.routes.js";
import routeRoutes from "./routes/route.routes.js";
import reportRoutes from "./routes/report.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import seatRoutes from "./routes/seat.routes.js";
import cityRoutes from "./routes/city.routes.js";
import municipioRoutes from "./routes/municipio.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import rideRoutes from "./routes/ride.routes.js";

/* ===============================
   MIDDLEWARES
   =============================== */
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
   ROUTES
   ========================================================= */
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/municipios", municipioRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/rides", rideRoutes);

/* =========================================================
   404
   ========================================================= */
app.use((_req, res) => {
   res.status(404).json({
      message: "Endpoint no encontrado",
   });
});

/* =========================================================
   ERROR HANDLER GLOBAL
   ========================================================= */
app.use(errorHandler);

export default app;
