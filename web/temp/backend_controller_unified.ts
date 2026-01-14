import { RequestHandler } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Asegúrate de tenerlo instalado
import { CompanyModel } from "../models/company.model";
import { UserModel } from "../models/user.model";
import { ScheduleModel } from "../models/schedule.model";
import { AuthRequest } from "../middlewares/requireAuth";

/* ================= CREAR EMPRESA + ADMIN (Transacción) ================= */
export const createCompanyWithAdmin: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authReq = req as AuthRequest;
    const ownerId = authReq.user.id;
    
    // Datos del body
    const { 
      // Datos Empresa
      name, nit, address, phone,
      // Datos Admin Inicial
      adminName, adminEmail, adminPassword 
    } = req.body;

    // 1. Crear Usuario Admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const newAdmin = new UserModel({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      ownerId: ownerId, // Vinculado al Jefe
      managedCompanies: [] // Se llenará en el paso 3
    });
    await newAdmin.save({ session });

    // 2. Crear Empresa
    const newCompany = new CompanyModel({
      name,
      nit,
      address,
      phone,
      owner: ownerId,
      admins: [newAdmin._id], // Vinculado al Admin
      active: true,
      // ... compliance defaults ...
    });
    await newCompany.save({ session });

    // 3. Actualizar Admin con la empresa creada
    newAdmin.managedCompanies.push(newCompany._id as any);
    await newAdmin.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ 
      message: "Empresa y Administrador creados exitosamente",
      company: newCompany,
      admin: { id: newAdmin._id, email: newAdmin.email }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error transaction:", error);
    return res.status(500).json({ message: "Error al crear empresa y admin", error });
  }
};

/* ================= GESTIÓN DE CALENDARIO (TURNOS) ================= */

// Asignar turno (Owner asigna a Admin)
export const setAdminSchedule: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { date, companyId, adminId, active } = req.body; // date formato YYYY-MM-DD

    // Upsert: Crear o Actualizar
    const schedule = await ScheduleModel.findOneAndUpdate(
      { 
        date: new Date(date), 
        company: companyId, 
        admin: adminId 
      },
      {
        owner: authReq.user.id,
        active: active
      },
      { upsert: true, new: true }
    );

    return res.json(schedule);
  } catch (error) {
    return res.status(500).json({ message: "Error al guardar turno" });
  }
};

// Obtener calendario (Para vista mensual)
export const getSchedule: RequestHandler = async (req, res) => {
  try {
    const { companyId, month, year } = req.query;
    
    // Calcular rango de fechas
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);

    const schedules = await ScheduleModel.find({
      company: companyId,
      date: { $gte: startDate, $lte: endDate }
    }).populate('admin', 'name email');

    return res.json(schedules);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener calendario" });
  }
};
