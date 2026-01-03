import express from "express";
import cors from "cors";
import "./config/mongo.js";

import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";

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
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ================= MIDDLEWARES ================= */

app.use(express.json());

/* ================= ROUTES ================= */

app.get("/", (_req, res) => {
  res.send("API OK");
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

export default app;



// import express from "express";
// import cors from "cors";
// import "./config/mongo";

// import authRoutes from "./routes/auth.routes";
// import ticketRoutes from "./routes/ticket.routes";


// const app = express();

// app.use(
//   cors({
//     origin: true, // 👈 permite cualquier origen dinámicamente
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//     ],
//   })
// );

// // 👇 MUY IMPORTANTE
// app.options("*", cors());


// // app.use(cors({
// //   origin: "*", // en desarrollo
// //   credentials: true,
// // }));

// app.use(express.json());

// app.use("/api/tickets", ticketRoutes);
// app.use("/api/auth", authRoutes);

// export default app;
