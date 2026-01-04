import { Router } from "express";
import {
  getTrips,
  createTrip,
} from "../controllers/trip.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwner } from "../middlewares/requireOwner.js";

const router = Router();

/* ================= PUBLIC ================= */

// LISTAR VIAJES
router.get("/", getTrips);

/* ================= PROTECTED ================= */

// CREAR VIAJE → SOLO OWNER
router.post(
  "/",
  requireAuth,
  requireOwner,
  createTrip
);

export default router;



// import { Router } from "express";
// import { createTrip, getTrips } from "../controllers/trip.controller.js";
// import { requireAuth } from "../middlewares/requireAuth.js";
// import { requireRole } from "../middlewares/requireRole.js";

// const router = Router();

// // /* ================= PUBLIC ================= */
// router.get("/", getTrips);

// // /* ================= PROTECTED ================= */
// router.post(
//   "/",
//   requireAuth,
//   requireRole("admin", "owner"),
//   createTrip
// );

// export default router;
