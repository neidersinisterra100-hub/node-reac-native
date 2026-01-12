import { Router } from "express";
import {
  createCompany,
  createCompanyWithAdmin, // <--- Nueva función importada
  getMyCompanies,
  toggleCompanyActive,
  deleteCompany,
  getCompanyAdmins       // <--- Nueva función importada
} from "../controllers/company.controller.js";
import { getCompanyRoutes } from "../controllers/route.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireOwner } from "../middlewares/requireOwner.js";

const router = Router();

/* ================= PUBLIC ================= */

// Listar empresas PÚBLICAS (activas)

/* ================= OWNER ================= */

// Crear empresa simple (solo OWNER)
router.post(
  "/",
  requireAuth,
  requireOwner,
  createCompany
);

// NUEVA RUTA: Crear Empresa + Admin (Transaccional)
router.post(
  "/with-admin",
  requireAuth,
  requireOwner,
  createCompanyWithAdmin
);

// Listar mis empresas (OWNER & ADMIN)
// Nota: El controlador getMyCompanies ya maneja la lógica de roles internamente
router.get(
  "/my",
  requireAuth,
  getMyCompanies
);

// Toggle Activo (OWNER & ADMIN)
router.patch(
  "/:companyId",
  requireAuth,
  toggleCompanyActive
);

// ELIMINAR EMPRESA (solo OWNER)
router.delete(
  "/:companyId",
  requireAuth,
  requireOwner,
  deleteCompany
);

// Nested Routes: Get routes for a company (OWNER & ADMIN)
router.get(
  "/:companyId/routes",
  // requireAuth, // Puedes descomentar si quieres protegerla
  getCompanyRoutes
);

// NUEVA RUTA: Obtener Admins de una empresa (Para el calendario)
router.get(
  "/:companyId/admins",
  requireAuth,
  getCompanyAdmins
);

export default router;



// import { Router } from "express";
// import {
//   createCompany,
//   getMyCompanies,
//   getAllCompanies,
//   toggleCompanyActive,
//   deleteCompany
// } from "../controllers/company.controller.js";
// import { getCompanyRoutes } from "../controllers/route.controller.js";
// import { requireAuth } from "../middlewares/requireAuth.js";
// import { requireOwner } from "../middlewares/requireOwner.js";

// const router = Router();

// /* ================= PUBLIC ================= */

// // Listar empresas PÚBLICAS (activas)
// router.get("/", getAllCompanies);

// /* ================= OWNER ================= */

// // Crear empresa (solo OWNER)
// router.post(
//   "/",
//   requireAuth,
//   requireOwner,
//   createCompany
// );

// // Listar mis empresas (OWNER & ADMIN)
// router.get(
//   "/my",
//   requireAuth,
//   getMyCompanies
// );

// // Toggle Activo (OWNER & ADMIN)
// router.patch(
//   "/:companyId",
//   requireAuth,
//   toggleCompanyActive
// );

// // ELIMINAR EMPRESA (OWNER)
// router.delete(
//   "/:companyId",
//   requireAuth,
//   requireOwner,
//   deleteCompany
// );

// // Nested Routes: Get routes for a company (OWNER & ADMIN)
// router.get(
//   "/:companyId/routes",
//   // requireAuth,
//   getCompanyRoutes
// );

// export default router;
