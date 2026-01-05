import { RequestHandler } from "express";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* ================= CREATE COMPANY (OWNER ONLY) ================= */

export const createCompany: RequestHandler = async (
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

    /* 🔒 ROLE → SOLO OWNER (normalizado) */
    if (authReq.user.role.toLowerCase() !== "owner") {
      return res.status(403).json({
        message: "Solo los owners pueden crear empresas",
      });
    }

    const { name } = req.body;

    /* 🔒 VALIDACIÓN */
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        message: "El nombre de la empresa es obligatorio",
      });
    }

    /* ================= CREATE ================= */

    const company = await CompanyModel.create({
      name: name.trim(),
      owner: authReq.user.id,
      balance: 0,
    });

    return res.status(201).json(company);
  } catch (error) {
    console.error("❌ Error createCompany:", error);
    return res.status(500).json({
      message: "Error al crear la empresa",
    });
  }
};

/* ================= GET MY COMPANIES (OWNER ONLY) ================= */

export const getMyCompanies: RequestHandler = async (
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

    /* 🔒 ROLE → SOLO OWNER (normalizado) */
    if (authReq.user.role.toLowerCase() !== "owner") {
      return res.status(403).json({
        message: "Solo los owners pueden ver sus empresas",
      });
    }

    /* ================= QUERY ================= */

    const companies = await CompanyModel.find({
      owner: authReq.user.id,
    }).sort({ createdAt: -1 });

    return res.json(companies);
  } catch (error) {
    console.error("❌ Error getMyCompanies:", error);
    return res.status(500).json({
      message: "Error al obtener empresas",
    });
  }
};



// import { RequestHandler } from "express";
// import { CompanyModel } from "../models/company.model.js";
// import { AuthRequest } from "../middlewares/requireAuth.js";

// /* ================= CREATE COMPANY (OWNER ONLY) ================= */

// export const createCompany: RequestHandler = async (
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

//     /* 🔒 ROLE → SOLO OWNER */
//     if (authReq.user.role !== "owner") {
//       return res.status(403).json({
//         message: "Solo los owners pueden crear empresas",
//       });
//     }

//     const { name } = req.body;

//     /* 🔒 VALIDACIÓN */
//     if (!name || typeof name !== "string") {
//       return res.status(400).json({
//         message: "El nombre de la empresa es obligatorio",
//       });
//     }

//     /* ================= CREATE ================= */

//     const company = await CompanyModel.create({
//       name,
//       owner: authReq.user.id,
//       balance: 0,
//     });

//     return res.status(201).json(company);
//   } catch (error) {
//     console.error("❌ Error createCompany:", error);
//     return res.status(500).json({
//       message: "Error al crear la empresa",
//     });
//   }
// };


