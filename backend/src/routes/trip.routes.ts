import { Router } from "express";
import {
  createTrip,
  getTrips,
} from "../controllers/trip.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = Router();

// LISTAR VIAJES (PÚBLICO)
router.get("/", getTrips);

// CREAR VIAJE (ADMIN)
router.post(
  "/",
  requireAuth,
  requireAdmin,
  createTrip
);

export default router;



// import { Router } from "express";
// import { createTrip } from "../controllers/trip.controller.js";
// import { validate } from "../middlewares/validate.js";
// import { createTripSchema } from "../schemas/trip.schema.js";
// import { requireAuth } from "../middlewares/requireAuth.js";
// import { requireAdmin } from "../middlewares/requireAdmin.js";

// const router = Router();

// router.post(
//   "/",
//   requireAuth,
//   requireAdmin,
//   validate({ body: createTripSchema }),
//   createTrip
// );

// export default router;
