import { RequestHandler } from "express";
import { RouteModel } from "../models/route.model.js";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* ================= CREATE ROUTE (OWNER ONLY) ================= */

export const createRoute: RequestHandler = async (
  req,
  res
) => {
  try {
    const authReq = req as AuthRequest;

    /* 🔒 AUTH */
    if (!authReq.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    /* 🔒 ROLE */
    if (authReq.user.role !== "owner") {
      return res.status(403).json({
        message: "Solo los owners pueden crear rutas",
      });
    }

    const { origin, destination, companyId } = req.body;

    /* 🔒 VALIDACIÓN */
    if (
      !origin ||
      !destination ||
      !companyId ||
      typeof origin !== "string" ||
      typeof destination !== "string"
    ) {
      return res.status(400).json({
        message: "origin, destination y companyId son obligatorios",
      });
    }

    /* ================= COMPANY ================= */

    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    /* 🔒 OWNER DE LA EMPRESA */
    if (company.owner.toString() !== authReq.user.id) {
      return res.status(403).json({
        message: "No eres owner de esta empresa",
      });
    }

    /* ================= ROUTE ================= */

    // Evitar rutas duplicadas en la misma empresa
    const exists = await RouteModel.findOne({
      origin: origin.trim(),
      destination: destination.trim(),
      company: companyId,
    });

    if (exists) {
      return res.status(409).json({
        message: "La ruta ya existe para esta empresa",
      });
    }

    const route = await RouteModel.create({
      origin: origin.trim(),
      destination: destination.trim(),
      company: companyId,
       createdBy: authReq.user.id, // ✅ Faltaba esto
    });

    return res.status(201).json(route);
  } catch (error) {
    console.error("❌ Error createRoute:", error);
    return res.status(500).json({
      message: "Error al crear la ruta",
    });
  }
};

/* ================= LIST ROUTES BY COMPANY ================= */

export const getCompanyRoutes: RequestHandler = async (
  req,
  res
) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        message: "companyId es requerido",
      });
    }

    const routes = await RouteModel.find({
      company: companyId,
    })
      .sort({ createdAt: -1 });

    res.json(routes);
  } catch (error) {
    console.error("❌ Error getCompanyRoutes:", error);
    res.status(500).json({
      message: "Error al obtener rutas",
    });
  }
};




// import { RequestHandler } from "express";
// import { RouteModel } from "../models/route.model.js";
// import { CompanyModel } from "../models/company.model.js";
// import { AuthRequest } from "../middlewares/requireAuth.js";

// /* ================= CREATE ROUTE (OWNER ONLY) ================= */

// export const createRoute: RequestHandler = async (
//   req,
//   res
// ) => {
//   try {
//     const authReq = req as AuthRequest;

//     /* 🔒 AUTH */
//     if (!authReq.user) {
//       return res.status(401).json({
//         message: "No autenticado",
//       });
//     }

//     /* 🔒 ROLE */
//     if (authReq.user.role !== "owner") {
//       return res.status(403).json({
//         message: "Solo los owners pueden crear rutas",
//       });
//     }

//     const { origin, destination, companyId } = req.body;

//     /* 🔒 VALIDACIÓN */
//     if (!origin || !destination || !companyId) {
//       return res.status(400).json({
//         message: "origin, destination y companyId son obligatorios",
//       });
//     }

//     /* ================= COMPANY ================= */

//     const company = await CompanyModel.findById(companyId);

//     if (!company) {
//       return res.status(404).json({
//         message: "Empresa no encontrada",
//       });
//     }

//     /* 🔒 OWNER DE LA EMPRESA */
//     if (company.owner.toString() !== authReq.user.id) {
//       return res.status(403).json({
//         message: "No eres owner de esta empresa",
//       });
//     }

//     /* ================= ROUTE ================= */

//     // Evitar rutas duplicadas en la misma empresa
//     const exists = await RouteModel.findOne({
//       origin,
//       destination,
//       company: companyId,
//     });

//     if (exists) {
//       return res.status(409).json({
//         message: "La ruta ya existe para esta empresa",
//       });
//     }

//     const route = await RouteModel.create({
//       origin,
//       destination,
//       company: companyId,
//     });

//     return res.status(201).json(route);
//   } catch (error) {
//     console.error("❌ Error createRoute:", error);
//     return res.status(500).json({
//       message: "Error al crear la ruta",
//     });
//   }
// };

// /* ================= LIST ROUTES BY COMPANY ================= */

// export const getCompanyRoutes: RequestHandler = async (
//   req,
//   res
// ) => {
//   try {
//     const { companyId } = req.params;

//     if (!companyId) {
//       return res.status(400).json({
//         message: "companyId es requerido",
//       });
//     }

//     const routes = await RouteModel.find({
//       company: companyId,
//     }).sort({ createdAt: -1 });

//     res.json(routes);
//   } catch (error) {
//     console.error("❌ Error getCompanyRoutes:", error);
//     res.status(500).json({
//       message: "Error al obtener rutas",
//     });
//   }
// };
