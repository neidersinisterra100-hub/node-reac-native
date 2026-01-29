import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";

// ===============================
// MODELOS
// ===============================
import { CompanyModel } from "../models/company.model.js";
import { UserModel } from "../models/user.model.js";
import { RouteModel } from "../models/route.model.js";
import { TripModel } from "../models/trip.model.js";

// ===============================
// DOMINIO
// ===============================
import { CompanyDomainService } from "../domain/company/company.domain.service.js";

// ===============================
// TIPOS
// ===============================
import type { CompanyDocument } from "../models/company.model.js";

/* =========================================================
   DTO (Data Transfer Object)
   ---------------------------------------------------------
   - Define la forma en que exponemos la empresa al frontend
   - Evita filtrar campos internos o sensibles
   ========================================================= */

export interface CompanyDTO {
  id: string;
  name: string;
  isActive: boolean;
  plan: "free" | "pro" | "enterprise";
  subscriptionStatus: "active" | "inactive" | "past_due" | "cancelled";
  createdAt: Date;
}

/**
 * Convierte un documento de Mongoose en un DTO limpio
 */
function toCompanyDTO(company: CompanyDocument): CompanyDTO {
  return {
    id: company._id.toString(),
    name: company.name,
    isActive: company.isActive,
    plan: company.plan,
    subscriptionStatus: company.subscriptionStatus,
    createdAt: company.createdAt,
  };
}

/* =========================================================
   CREATE COMPANY
   ---------------------------------------------------------
   - Solo un OWNER puede crear empresas
   - Se asocia automáticamente la empresa al usuario
   - El ownership real empieza aquí
   ========================================================= */

export const createCompany: RequestHandler = async (req, res) => {
  try {
    // requireAuth ya se ejecutó antes
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    // Solo owners pueden crear empresas
    if (req.user.role !== "owner") {
      return res.status(403).json({ message: "Solo owners" });
    }

    // Crear la empresa
    const company = await CompanyModel.create({
      ...req.body,
      owner: new Types.ObjectId(req.user.id),
      isActive: true,
      admins: [],
    });

    // Vincular la empresa al usuario owner
    await UserModel.findByIdAndUpdate(req.user.id, {
      $set: { companyId: company._id },
    });

    return res.status(201).json(toCompanyDTO(company));
  } catch (error) {
    console.error("❌ createCompany error:", error);
    return res.status(500).json({ message: "Error al crear empresa" });
  }
};

/* =========================================================
   LIST MY COMPANIES
   ---------------------------------------------------------
   - OWNER → ve todas sus empresas
   - ADMIN → ve solo la empresa asignada
   ========================================================= */

export const getMyCompanies: RequestHandler = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const { role, id, companyId } = req.user;

  const companies =
    role === "owner"
      ? await CompanyModel.find({ owner: id })
      : role === "admin" && companyId
      ? await CompanyModel.find({ _id: companyId })
      : [];

  res.json(companies.map(toCompanyDTO));
};

/* =========================================================
   GET COMPANY
   ---------------------------------------------------------
   - ownershipGuard ya validó permisos
   - La empresa viene inyectada en req.company
   ========================================================= */

export const getCompany: RequestHandler = async (req, res) => {
  if (!req.company) {
    return res.status(500).json({
      message: "Empresa no inyectada (ownershipGuard faltante)",
    });
  }

  res.json(toCompanyDTO(req.company));
};

/* =========================================================
   TOGGLE COMPANY ACTIVE
   ---------------------------------------------------------
   - Activa / desactiva una empresa
   - Si se desactiva:
     - Se desactivan TODAS las rutas
     - Se desactivan TODOS los viajes
   - Todo ocurre dentro de una transacción
   ========================================================= */

export const toggleCompanyActive: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.company) {
      await session.abortTransaction();
      return res.status(500).json({
        message: "Empresa no inyectada (ownershipGuard faltante)",
      });
    }

    const company = req.company;

    // Toggle del estado
    company.isActive = !company.isActive;
    company.deactivatedAt = company.isActive ? undefined : new Date();

    await company.save({ session });

    // 🔥 Cascada descendente
    if (!company.isActive) {
      await RouteModel.updateMany(
        { companyId: company._id },
        { $set: { isActive: false, deactivatedAt: new Date() } },
        { session }
      );

      await TripModel.updateMany(
        { companyId: company._id },
        { $set: { isActive: false, deactivatedAt: new Date() } },
        { session }
      );
    }

    await session.commitTransaction();
    res.json(toCompanyDTO(company));
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ toggleCompanyActive error:", error);
    res.status(500).json({ message: "Error al cambiar estado" });
  } finally {
    session.endSession();
  }
};

/* =========================================================
   DELETE COMPANY (LÓGICO)
   ---------------------------------------------------------
   - No borra físicamente
   - Aplica reglas de dominio
   - Mantiene integridad histórica
   ========================================================= */

export const deleteCompany: RequestHandler = async (req, res) => {
  if (!req.company) {
    return res.status(500).json({
      message: "Empresa no inyectada (ownershipGuard faltante)",
    });
  }

  await CompanyDomainService.deactivateCompany(
    req.company._id.toString()
  );

  res.json({ message: "Empresa eliminada" });
};



// import { RequestHandler } from "express";
// import mongoose, { Types } from "mongoose";
// import { z } from "zod";
// import bcrypt from "bcryptjs"; // ✅ Corrected import

// import { CompanyModel } from "../models/company.model.js";
// import { UserModel } from "../models/user.model.js";
// import { RouteModel } from "../models/route.model.js";
// import { TripModel } from "../models/trip.model.js";
// import { CityModel } from "../models/city.model.js"; // Added CityModel import
// import { AuthRequest } from "../middlewares/requireAuth.js";
// import { CompanyDomainService } from "../domain/company/company.domain.service.js";
// import type { CompanyDocument } from "../models/company.model.js";

// /* =========================================================
//    DTO (API CONTRACT)
//    ========================================================= */

// export interface CompanyDTO {
//   id: string;
//   name: string;
//   isActive: boolean;
//   plan: "free" | "pro" | "enterprise";
//   subscriptionStatus: "active" | "inactive" | "past_due" | "cancelled";
//   createdAt: Date;
// }

// /* =========================================================
//    MAPPER (_id → id)
//    ========================================================= */

// function toCompanyDTO(company: CompanyDocument): CompanyDTO {
//   return {
//     id: company._id.toString(),
//     name: company.name,
//     isActive: company.isActive,
//     plan: company.plan,
//     subscriptionStatus: company.subscriptionStatus,
//     createdAt: company.createdAt,
//   };
// }

// /* =========================================================
//    ZOD SCHEMA (CREATE)
//    ========================================================= */

// /* =========================================================
//    ZOD SCHEMA (CREATE)
//    ========================================================= */

// const createCompanySchema = z.object({
//   name: z.string().min(2).transform((v) => v.trim()),
//   nit: z.string().optional().default(""),
//   legalRepresentative: z.string().optional().default(""),
//   licenseNumber: z.string().optional().default(""),
//   insurancePolicyNumber: z.string().optional().default(""),
//   // ✅ Location Fields
//   departmentId: z.string().min(1, "Departamento requerido"),
//   municipioId: z.string().min(1, "Municipio requerido"),
//   cityId: z.string().min(1, "Ciudad requerida"),
//   compliance: z
//     .object({
//       hasLegalConstitution: z.boolean().optional(),
//       hasTransportLicense: z.boolean().optional(),
//       hasVesselRegistration: z.boolean().optional(),
//       hasCrewLicenses: z.boolean().optional(),
//       hasInsurance: z.boolean().optional(),
//       hasSafetyProtocols: z.boolean().optional(),
//     })
//     .optional(),
// });

// /* =========================================================
//    CREAR EMPRESA (SOLO OWNER)
//    ========================================================= */

// export const createCompany: RequestHandler = async (req, res) => {
//   try {
//     const authReq = req as AuthRequest;

//     if (!authReq.user) {
//       return res.status(401).json({ message: "No autenticado" });
//     }

//     if (authReq.user.role !== "owner") {
//       return res
//         .status(403)
//         .json({ message: "Solo los owners pueden crear empresas" });
//     }

//     const parsed = createCompanySchema.safeParse(req.body);

//     if (!parsed.success) {
//       return res.status(400).json({
//         message: "Datos inválidos",
//         errors: parsed.error.flatten().fieldErrors,
//       });
//     } 

//     const {
//       name,
//       nit,
//       legalRepresentative,
//       licenseNumber,
//       insurancePolicyNumber,
//       departmentId,
//       municipioId,
//       cityId,
//       compliance,
//     } = parsed.data;

//     const company = await CompanyModel.create({
//       name,
//       owner: new Types.ObjectId(authReq.user.id),
//       balance: 0,
//       isActive: true, // ✅ CORRECTO
//       admins: [],
//       nit,
//       legalRepresentative,
//       licenseNumber,
//       insurancePolicyNumber,
//       departmentId,
//       municipioId,
//       cityId,
//       compliance: {
//         hasLegalConstitution: compliance?.hasLegalConstitution ?? false,
//         hasTransportLicense: compliance?.hasTransportLicense ?? false,
//         hasVesselRegistration: compliance?.hasVesselRegistration ?? false,
//         hasCrewLicenses: compliance?.hasCrewLicenses ?? false,
//         hasInsurance: compliance?.hasInsurance ?? false,
//         hasSafetyProtocols: compliance?.hasSafetyProtocols ?? false,
//       },
//     });

//     await UserModel.findByIdAndUpdate(authReq.user.id, {
//       $set: { companyId: company._id },
//     });

//     return res.status(201).json(toCompanyDTO(company));
//   } catch (error) {
//     console.error("❌ [createCompany] Error:", error);
//     return res.status(500).json({ message: "Error al crear la empresa" });
//   }
// };

// /* =========================================================
//    CREAR EMPRESA + ADMIN (Transaccional)
//    ========================================================= */

// export const createCompanyWithAdmin: RequestHandler = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const authReq = req as AuthRequest;

//     console.log("🔍 [createCompanyWithAdmin] Body received:", JSON.stringify(req.body, null, 2));

//     if (!authReq.user) {
//       await session.abortTransaction();
//       return res.status(401).json({ message: "No autenticado" });
//     }

//     if (authReq.user.role !== "owner") {
//       await session.abortTransaction();
//       return res.status(403).json({ message: "Solo owners" });
//     }

//     // Extract both company and admin data
//     const {
//       adminName,
//       adminEmail,
//       adminPassword,
//       ...companyDataRaw
//     } = req.body;

//     // Validate Company Data (reusing schema logic roughly or allowing partial if frontend sends proper structure)
//     // Ideally use Zod here too, but for speed, let's assume body is mostly correct or catch validation error from Mongoose.

//     // Ensure location fields are present in raw data
//     if (!companyDataRaw.departmentId || !companyDataRaw.municipioId || !companyDataRaw.cityId) {
//       await session.abortTransaction();
//       return res.status(400).json({ message: "Ubicación requerida (Departamento, Municipio, Ciudad)" });
//     }

//     // 1. Create Company
//     const company = new CompanyModel({
//       ...companyDataRaw,
//       owner: new Types.ObjectId(authReq.user.id),
//       isActive: true,
//       admins: []
//     });

//     // Explicit location assignment to ensure types match
//     company.departmentId = new Types.ObjectId(companyDataRaw.departmentId);
//     company.municipioId = new Types.ObjectId(companyDataRaw.municipioId);
//     company.cityId = new Types.ObjectId(companyDataRaw.cityId);

//     await company.save({ session });

//     // 2. Handle Admin User
//     if (adminEmail && adminPassword) {
//       let admin = await UserModel.findOne({ email: adminEmail }).session(session);

//       if (!admin) {
//         // Create New Admin
//         const hashedPassword = await bcrypt.hash(adminPassword, 10);
//         admin = new UserModel({
//           name: adminName || "Admin",
//           email: adminEmail,
//           password: hashedPassword,
//           role: "admin",
//           companyId: company._id,
//           isActive: true
//         });
//         await admin.save({ session });
//       } else {
//         // Link Existing User (Update role if needed? Let's check permissions or just link)
//         // Careful with taking over existing accounts. Usually verify ownership.
//         // For this MVP, we link and set role/companyId.
//         admin.companyId = company._id;
//         admin.role = "admin"; // Promote/Force role
//         await admin.save({ session });
//       }

//       // Link back to company
//       company.admins.push(admin._id);
//       await company.save({ session });
//     }

//     await session.commitTransaction();
//     return res.status(201).json({
//       company: toCompanyDTO(company),
//       message: "Empresa y administrador creados correctamente"
//     });

//   } catch (error: any) {
//     await session.abortTransaction();
//     console.error("❌ [createCompanyWithAdmin] Error:", error);
//     // Explicitly returning error details can help debug mobile side
//     return res.status(500).json({
//       message: "Error al crear empresa con admin",
//       error: error.message
//     });
//   } finally {
//     session.endSession();
//   }
// };

// /* =========================================================
//    LISTAR MIS EMPRESAS (OWNER / ADMIN)
//    ========================================================= */

// export const getMyCompanies: RequestHandler = async (req, res) => {
//   const authReq = req as AuthRequest;

//   if (!authReq.user) {
//     return res.status(401).json({ message: "No autenticado" });
//   }

//   const { role, id, companyId } = authReq.user;

//   let companies: CompanyDocument[] = [];

//   if (role === "owner") {
//     companies = await CompanyModel.find({ owner: id });
//   }

//   if (role === "admin" && companyId) {
//     companies = await CompanyModel.find({ _id: companyId });
//   }

//   return res.json(companies.map(toCompanyDTO));
// };

// export const getCompany = async (req, res) => {
//   res.json(req.company);
// };


// /* =========================================================
//    TOGGLE EMPRESA (CON CASCADA)
//    ========================================================= */

//    export const toggleCompanyActive: RequestHandler = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const company = req.company;

//     const newStatus = !company.isActive;
//     company.isActive = newStatus;
//     company.deactivatedAt = newStatus ? undefined : new Date();

//     await company.save({ session });

//     if (!newStatus) {
//       await RouteModel.updateMany(
//         { companyId: company._id },
//         { $set: { isActive: false, deactivatedAt: new Date() } },
//         { session }
//       );

//       await TripModel.updateMany(
//         { companyId: company._id },
//         { $set: { isActive: false, deactivatedAt: new Date() } },
//         { session }
//       );
//     }

//     await session.commitTransaction();
//     res.json(toCompanyDTO(company));
//   } catch (error) {
//     await session.abortTransaction();
//     res.status(500).json({ message: "Error al cambiar estado" });
//   } finally {
//     session.endSession();
//   }
// };

// // export const toggleCompanyActive: RequestHandler = async (req, res) => {
// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     const authReq = req as AuthRequest;
// //     const { companyId } = req.params;

// //     if (!authReq.user) {
// //       await session.abortTransaction();
// //       return res.status(401).json({ message: "No autenticado" });
// //     }

// //     const company = await CompanyModel.findById(companyId).session(session);
// //     if (!company) {
// //       await session.abortTransaction();
// //       return res.status(404).json({ message: "Empresa no encontrada" });
// //     }

// //     const isOwner = company.owner.toString() === authReq.user.id;
// //     const isAdmin =
// //       authReq.user.role === "admin" &&
// //       authReq.user.companyId === company._id.toString();

// //     if (!isOwner && !isAdmin) {
// //       await session.abortTransaction();
// //       return res.status(403).json({ message: "No autorizado" });
// //     }

// //     // Toggle estado
// //     const newStatus = !company.isActive;
// //     company.isActive = newStatus;

// //     if (!newStatus) {
// //       company.deactivatedAt = new Date();
// //     } else {
// //       company.deactivatedAt = undefined;
// //     }

// //     await company.save({ session });

// //     // 🔥 CASCADA: Si se desactiva la empresa, desactivar rutas y viajes
// //     if (!newStatus) {
// //       // 1. Desactivar Rutas
// //       await RouteModel.updateMany(
// //         { companyId: company._id }, // ✅ FK Correcta
// //         { $set: { isActive: false, deactivatedAt: new Date() } },
// //         { session }
// //       );

// //       // 2. Desactivar Viajes
// //       await TripModel.updateMany(
// //         { companyId: company._id }, // ✅ FK Correcta
// //         { $set: { isActive: false, deactivatedAt: new Date() } },
// //         { session }
// //       );
// //     }
// //     // Nota: Si se reactiva la empresa, NO reactivamos automáticamente rutas/viajes
// //     // para evitar activar cosas que estaban apagadas intencionalmente antes.

// //     await session.commitTransaction();
// //     return res.json(toCompanyDTO(company));
// //   } catch (error) {
// //     await session.abortTransaction();
// //     console.error("❌ [toggleCompanyActive] Error:", error);
// //     return res.status(500).json({ message: "Error al cambiar estado" });
// //   } finally {
// //     session.endSession();
// //   }
// // };

// /* =========================================================
//    ELIMINAR EMPRESA (SOLO OWNER)
//    ========================================================= */

// export const deleteCompany: RequestHandler = async (req, res) => {
//   const authReq = req as AuthRequest;
//   const { companyId } = req.params;

//   if (!authReq.user) {
//     return res.status(401).json({ message: "No autenticado" });
//   }

//   const company = await CompanyModel.findById(companyId);
//   if (!company) {
//     return res.status(404).json({ message: "Empresa no encontrada" });
//   }

//   if (company.owner.toString() !== authReq.user.id) {
//     return res.status(403).json({ message: "Solo el owner puede eliminar" });
//   }

//   await CompanyDomainService.deactivateCompany(companyId);

//   return res.json({ message: "Empresa eliminada (cascada aplicada)" });
// };

// /* =========================================================
//    ADMINS DE UNA EMPRESA
//    ========================================================= */

// export const getCompanyAdmins: RequestHandler = async (req, res) => {
//   const { companyId } = req.params;

//   const company = await CompanyModel.findById(companyId).populate("admins");
//   if (!company) {
//     return res.status(404).json({ message: "Empresa no encontrada" });
//   }

//   return res.json(company.admins);
// };

// /* =========================================================
//    PUBLIC COMPANIES (For Role-User)
//    ========================================================= */
// export const getPublicCompanies: RequestHandler = async (_req, res) => {
//   try {
//     const companies = await CompanyModel.find({ isActive: true });
//     res.json(companies.map(toCompanyDTO));
//   } catch (error) {
//     console.error("Error fetching public companies:", error);
//     res.status(500).json({ message: "Error al obtener empresas" });
//   }
// };
