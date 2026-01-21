import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";
import { z } from "zod";

import { CompanyModel } from "../models/company.model.js";
import { UserModel } from "../models/user.model.js";
import { RouteModel } from "../models/route.model.js";
import { TripModel } from "../models/trip.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";
import { CompanyDomainService } from "../domain/company/company.domain.service.js";
import type { CompanyDocument } from "../models/company.model.js";

/* =========================================================
   DTO (API CONTRACT)
   ========================================================= */

export interface CompanyDTO {
  id: string;
  name: string;
  isActive: boolean;
  plan: "free" | "pro" | "enterprise";
  subscriptionStatus: "active" | "inactive" | "past_due" | "cancelled";
  createdAt: Date;
}

/* =========================================================
   MAPPER (_id → id)
   ========================================================= */

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
   ZOD SCHEMA (CREATE)
   ========================================================= */

const createCompanySchema = z.object({
  name: z.string().min(2).transform((v) => v.trim()),
  nit: z.string().optional().default(""),
  legalRepresentative: z.string().optional().default(""),
  licenseNumber: z.string().optional().default(""),
  insurancePolicyNumber: z.string().optional().default(""),
  compliance: z
    .object({
      hasLegalConstitution: z.boolean().optional(),
      hasTransportLicense: z.boolean().optional(),
      hasVesselRegistration: z.boolean().optional(),
      hasCrewLicenses: z.boolean().optional(),
      hasInsurance: z.boolean().optional(),
      hasSafetyProtocols: z.boolean().optional(),
    })
    .optional(),
});

/* =========================================================
   CREAR EMPRESA (SOLO OWNER)
   ========================================================= */

export const createCompany: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (authReq.user.role !== "owner") {
      return res
        .status(403)
        .json({ message: "Solo los owners pueden crear empresas" });
    }

    const parsed = createCompanySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      name,
      nit,
      legalRepresentative,
      licenseNumber,
      insurancePolicyNumber,
      compliance,
    } = parsed.data;

    const company = await CompanyModel.create({
      name,
      owner: new Types.ObjectId(authReq.user.id),
      balance: 0,
      isActive: true, // ✅ CORRECTO
      admins: [],
      nit,
      legalRepresentative,
      licenseNumber,
      insurancePolicyNumber,
      compliance: {
        hasLegalConstitution: compliance?.hasLegalConstitution ?? false,
        hasTransportLicense: compliance?.hasTransportLicense ?? false,
        hasVesselRegistration: compliance?.hasVesselRegistration ?? false,
        hasCrewLicenses: compliance?.hasCrewLicenses ?? false,
        hasInsurance: compliance?.hasInsurance ?? false,
        hasSafetyProtocols: compliance?.hasSafetyProtocols ?? false,
      },
    });

    await UserModel.findByIdAndUpdate(authReq.user.id, {
      $set: { companyId: company._id },
    });

    return res.status(201).json(toCompanyDTO(company));
  } catch (error) {
    console.error("❌ [createCompany] Error:", error);
    return res.status(500).json({ message: "Error al crear la empresa" });
  }
};

/* =========================================================
   CREAR EMPRESA + ADMIN
   ========================================================= */

export const createCompanyWithAdmin: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;

  if (!authReq.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (authReq.user.role !== "owner") {
    return res.status(403).json({ message: "Solo owners" });
  }

  const { adminEmail, ...companyData } = req.body;

  const company = await CompanyModel.create({
    ...companyData,
    owner: new Types.ObjectId(authReq.user.id),
    isActive: true, // ✅ CORRECTO
  });

  if (adminEmail) {
    const admin = await UserModel.findOne({ email: adminEmail });
    if (admin) {
      company.admins.push(admin._id);
      admin.companyId = company._id;
      await admin.save();
      await company.save();
    }
  }

  return res.status(201).json(toCompanyDTO(company));
};

/* =========================================================
   LISTAR MIS EMPRESAS (OWNER / ADMIN)
   ========================================================= */

export const getMyCompanies: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;

  if (!authReq.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const { role, id, companyId } = authReq.user;

  let companies: CompanyDocument[] = [];

  if (role === "owner") {
    companies = await CompanyModel.find({ owner: id });
  }

  if (role === "admin" && companyId) {
    companies = await CompanyModel.find({ _id: companyId });
  }

  return res.json(companies.map(toCompanyDTO));
};

/* =========================================================
   TOGGLE EMPRESA (CON CASCADA)
   ========================================================= */

export const toggleCompanyActive: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authReq = req as AuthRequest;
    const { companyId } = req.params;

    if (!authReq.user) {
      await session.abortTransaction();
      return res.status(401).json({ message: "No autenticado" });
    }

    const company = await CompanyModel.findById(companyId).session(session);
    if (!company) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    const isOwner = company.owner.toString() === authReq.user.id;
    const isAdmin =
      authReq.user.role === "admin" &&
      authReq.user.companyId === company._id.toString();

    if (!isOwner && !isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ message: "No autorizado" });
    }

    // Toggle estado
    const newStatus = !company.isActive;
    company.isActive = newStatus;
    
    if (!newStatus) {
        company.deactivatedAt = new Date();
    } else {
        company.deactivatedAt = undefined;
    }

    await company.save({ session });

    // 🔥 CASCADA: Si se desactiva la empresa, desactivar rutas y viajes
    if (!newStatus) {
      // 1. Desactivar Rutas
      await RouteModel.updateMany(
        { companyId: company._id }, // ✅ FK Correcta
        { $set: { isActive: false, deactivatedAt: new Date() } },
        { session }
      );

      // 2. Desactivar Viajes
      await TripModel.updateMany(
        { companyId: company._id }, // ✅ FK Correcta
        { $set: { isActive: false, deactivatedAt: new Date() } },
        { session }
      );
    }
    // Nota: Si se reactiva la empresa, NO reactivamos automáticamente rutas/viajes
    // para evitar activar cosas que estaban apagadas intencionalmente antes.

    await session.commitTransaction();
    return res.json(toCompanyDTO(company));
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ [toggleCompanyActive] Error:", error);
    return res.status(500).json({ message: "Error al cambiar estado" });
  } finally {
    session.endSession();
  }
};

/* =========================================================
   ELIMINAR EMPRESA (SOLO OWNER)
   ========================================================= */

export const deleteCompany: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  const { companyId } = req.params;

  if (!authReq.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const company = await CompanyModel.findById(companyId);
  if (!company) {
    return res.status(404).json({ message: "Empresa no encontrada" });
  }

  if (company.owner.toString() !== authReq.user.id) {
    return res.status(403).json({ message: "Solo el owner puede eliminar" });
  }

  await CompanyDomainService.deactivateCompany(companyId);

  return res.json({ message: "Empresa eliminada (cascada aplicada)" });
};

/* =========================================================
   ADMINS DE UNA EMPRESA
   ========================================================= */

export const getCompanyAdmins: RequestHandler = async (req, res) => {
  const { companyId } = req.params;

  const company = await CompanyModel.findById(companyId).populate("admins");
  if (!company) {
    return res.status(404).json({ message: "Empresa no encontrada" });
  }

  return res.json(company.admins);
};
