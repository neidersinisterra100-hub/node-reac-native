import { Router } from "express";
import {
  createRoute,
  getCompanyRoutes,
} from "../controllers/route.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwner } from "../middlewares/requireOwner.js";

const router = Router();

/* ================= PROTECTED ================= */

// LISTAR RUTAS DE UNA EMPRESA (OWNER)
router.get(
  "/company/:companyId",
  requireAuth,
  requireOwner,
  getCompanyRoutes
);

// CREAR RUTA → SOLO OWNER
router.post(
  "/",
  requireAuth,
  requireOwner,
  createRoute
);

export default router;




// import { Router } from "express";
// import {
//   createRoute,
//   getCompanyRoutes,
// } from "../controllers/route.controller.js";
// import { requireAuth } from "../middlewares/requireAuth.js";
// import { requireOwner } from "../middlewares/requireOwner.js";

// const router = Router();

// /* ================= PUBLIC ================= */

// // LISTAR RUTAS DE UNA EMPRESA (PÚBLICO)
// router.get(
//   "/company/:companyId",
//   getCompanyRoutes
// );

// /* ================= PROTECTED ================= */

// // CREAR RUTA → SOLO OWNER
// router.post(
//   "/",
//   requireAuth,
//   requireOwner,
//   createRoute
// );

// export default router;
