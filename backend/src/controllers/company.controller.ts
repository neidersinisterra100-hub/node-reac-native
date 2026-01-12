import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";

import { CompanyModel } from "../models/company.model.js";
import { UserModel } from "../models/user.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* =========================================================
   CREAR EMPRESA (SOLO OWNER)
   ========================================================= */
export const createCompany: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    // 🔐 Validación de autenticación
    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    // 🔐 Solo OWNER puede crear empresas
    if (authReq.user.role !== "owner") {
      return res.status(403).json({
        message: "Solo los owners pueden crear empresas",
      });
    }

    const {
      name,
      nit,
      legalRepresentative,
      licenseNumber,
      insurancePolicyNumber,
      compliance,
    } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        message: "El nombre de la empresa es obligatorio",
      });
    }

    const company = await CompanyModel.create({
      name: name.trim(),
      owner: authReq.user.id,
      balance: 0,
      active: true,
      admins: [],

      nit: nit || "",
      legalRepresentative: legalRepresentative || "",
      licenseNumber: licenseNumber || "",
      insurancePolicyNumber: insurancePolicyNumber || "",

      compliance: {
        hasLegalConstitution: compliance?.hasLegalConstitution ?? false,
        hasTransportLicense: compliance?.hasTransportLicense ?? false,
        hasVesselRegistration: compliance?.hasVesselRegistration ?? false,
        hasCrewLicenses: compliance?.hasCrewLicenses ?? false,
        hasInsurance: compliance?.hasInsurance ?? false,
        hasSafetyProtocols: compliance?.hasSafetyProtocols ?? false,
      },
    });

    return res.status(201).json(company);
  } catch (error) {
    console.error("❌ Error createCompany:", error);
    return res.status(500).json({
      message: "Error al crear la empresa",
    });
  }
};

/* =========================================================
   CREAR EMPRESA + ADMIN (TRANSACCIÓN)
   ========================================================= */
export const createCompanyWithAdmin: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authReq = req as AuthRequest;

    if (!authReq.user || authReq.user.role !== "owner") {
      return res.status(403).json({ message: "No autorizado" });
    }

    const ownerId = authReq.user.id;

    const {
      name,
      nit,
      adminName,
      adminEmail,
      adminPassword,
    } = req.body;

    /* ---------- 1. Crear ADMIN ---------- */
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const newAdmin = new UserModel({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      ownerId,
      managedCompanies: [],
    });

    await newAdmin.save({ session });

    /* ---------- 2. Crear EMPRESA ---------- */
    const newCompany = new CompanyModel({
      name,
      nit,
      owner: ownerId,
      admins: [newAdmin._id],
      active: true,
    });

    await newCompany.save({ session });

    /* ---------- 3. Vincular empresa al admin ---------- */
    newAdmin.managedCompanies = [
      newCompany._id as Types.ObjectId,
    ];

    await newAdmin.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      message: "Empresa y administrador creados exitosamente",
      company: newCompany,
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Error createCompanyWithAdmin:", error);

    return res.status(500).json({
      message: "Error al crear empresa y admin",
    });
  } finally {
    session.endSession();
  }
};

/* =========================================================
   OBTENER MIS EMPRESAS (OWNER / ADMIN)
   ========================================================= */
export const getMyCompanies: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const role = authReq.user.role;

    let query = {};

    // 👑 OWNER → empresas propias
    if (role === "owner") {
      query = { owner: authReq.user.id };
    }

    // 🛠️ ADMIN → solo empresas asignadas
    if (role === "admin") {
      const adminUser = await UserModel.findById(authReq.user.id);

      if (!adminUser?.managedCompanies?.length) {
        return res.json([]);
      }

      query = { _id: { $in: adminUser.managedCompanies } };
    }

    const companies = await CompanyModel.find(query).sort({
      createdAt: -1,
    });

    return res.json(companies);
  } catch (error) {
    console.error("❌ Error getMyCompanies:", error);
    return res.status(500).json({
      message: "Error al obtener empresas",
    });
  }
};

/* =========================================================
   OBTENER ADMINS DE UNA EMPRESA
   ========================================================= */
export const getCompanyAdmins: RequestHandler = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await CompanyModel.findById(companyId)
      .populate("admins", "name email");

    if (!company) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    return res.json(company.admins ?? []);
  } catch (error) {
    console.error("❌ Error getCompanyAdmins:", error);
    return res.status(500).json({
      message: "Error al obtener admins",
    });
  }
};

/* =========================================================
   ACTIVAR / DESACTIVAR EMPRESA
   ========================================================= */
export const toggleCompanyActive: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { companyId } = req.params;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    const isOwner =
      company.owner.toString() === authReq.user.id;

    /* ---------- ADMIN: validar que gestione la empresa ---------- */
    if (!isOwner && authReq.user.role === "admin") {
      const adminUser = await UserModel.findById(authReq.user.id);

      const managesCompany =
        adminUser?.managedCompanies?.some(
          (id: Types.ObjectId) =>
            id.toString() === companyId
        ) ?? false;

      if (!managesCompany) {
        return res.status(403).json({
          message: "No tienes permiso para gestionar esta empresa",
        });
      }
    }

    if (!isOwner && authReq.user.role !== "admin") {
      return res.status(403).json({
        message: "No autorizado",
      });
    }

    company.active = !company.active;
    await company.save();

    return res.json(company);
  } catch (error) {
    console.error("❌ Error toggleCompanyActive:", error);
    return res.status(500).json({
      message: "Error al cambiar estado de la empresa",
    });
  }
};

/* =========================================================
   ELIMINAR EMPRESA (SOLO OWNER)
   ========================================================= */
export const deleteCompany: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { companyId } = req.params;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    if (company.owner.toString() !== authReq.user.id) {
      return res.status(403).json({
        message: "Solo el owner puede eliminar la empresa",
      });
    }

    await CompanyModel.findByIdAndDelete(companyId);

    return res.json({
      message: "Empresa eliminada correctamente",
    });
  } catch (error) {
    console.error("❌ Error deleteCompany:", error);
    return res.status(500).json({
      message: "Error al eliminar empresa",
    });
  }
};
