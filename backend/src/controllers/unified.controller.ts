import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";

import { CompanyModel } from "../models/company.model.js";
import { UserModel } from "../models/user.model.js";
import { ScheduleModel } from "../models/schedule.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* =========================================================
   CREAR EMPRESA + ADMIN (TRANSACCIÓN)
   SOLO OWNER
   ========================================================= */
export const createCompanyWithAdmin: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authReq = req as AuthRequest;

    /* ---------- Seguridad ---------- */
    if (!authReq.user || authReq.user.role !== "owner") {
      return res.status(403).json({
        message: "Solo el owner puede crear empresas",
      });
    }

    const ownerId = authReq.user.id;

    const {
      name,
      nit,
      adminName,
      adminEmail,
      adminPassword,
    } = req.body;

    /* ---------- Validaciones mínimas ---------- */
    if (!name || !adminEmail || !adminPassword) {
      return res.status(400).json({
        message: "Datos incompletos",
      });
    }

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
   ASIGNAR / ACTUALIZAR TURNO (OWNER / ADMIN)
   ========================================================= */
export const setAdminSchedule: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { date, companyId, adminId, active } = req.body;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const userRole = authReq.user.role;
    let isAuthorized = false;

    /* ---------- OWNER ---------- */
    if (userRole === "owner") {
      const company = await CompanyModel.findOne({
        _id: companyId,
        owner: authReq.user.id,
      });
      if (company) isAuthorized = true;
    }

    /* ---------- ADMIN ---------- */
    if (userRole === "admin") {
      const adminUser = await UserModel.findById(authReq.user.id);

      const managesCompany =
        adminUser?.managedCompanies?.some(
          (id: Types.ObjectId) => id.toString() === companyId
        ) ?? false;

      if (managesCompany) isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({
        message: "No autorizado",
      });
    }

    /* ---------- Upsert ---------- */
    const schedule = await ScheduleModel.findOneAndUpdate(
      {
        date: new Date(date),
        company: companyId,
        admin: adminId,
      },
      {
        date: new Date(date),
        company: companyId,
        admin: adminId,
        owner: authReq.user.id,
        active: active ?? true,
      },
      { upsert: true, new: true }
    );

    return res.json(schedule);
  } catch (error) {
    console.error("❌ Error setAdminSchedule:", error);
    return res.status(500).json({
      message: "Error al guardar turno",
    });
  }
};

/* =========================================================
   OBTENER CALENDARIO (MES / EMPRESA)
   ========================================================= */
export const getSchedule: RequestHandler = async (req, res) => {
  try {
    const { companyId, month, year } = req.query;

    if (!companyId || !month || !year) {
      return res.status(400).json({
        message: "Faltan parámetros (companyId, month, year)",
      });
    }

    const startDate = new Date(
      Number(year),
      Number(month) - 1,
      1
    );
    const endDate = new Date(
      Number(year),
      Number(month),
      0
    );

    const schedules = await ScheduleModel.find({
      company: companyId,
      date: { $gte: startDate, $lte: endDate },
    }).populate("admin", "name email");

    return res.json(schedules);
  } catch (error) {
    console.error("❌ Error getSchedule:", error);
    return res.status(500).json({
      message: "Error al obtener calendario",
    });
  }
};
