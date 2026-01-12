import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";

import { ScheduleModel } from "../models/schedule.model.js";
import { CompanyModel } from "../models/company.model.js";
import { TripModel } from "../models/trip.model.js";
import { UserModel } from "../models/user.model.js";
import { RouteModel } from "../models/route.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* =========================================================
   ASIGNAR TURNO Y CREAR VIAJE
   ========================================================= */
export const createScheduleWithTrip: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { date, time, companyId, adminId, routeId, price, capacity } = req.body;

    /* ---------- Seguridad base ---------- */
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
        message: "No tienes permiso para gestionar esta empresa",
      });
    }

    /* ---------- Validar Ruta ---------- */
    const route = await RouteModel.findById(routeId);
    if (!route) {
      return res.status(404).json({ message: "Ruta no encontrada" });
    }

    /* ---------- Crear Schedule ---------- */
    const newSchedule = await ScheduleModel.create({
      date: new Date(date),
      company: companyId,
      admin: adminId,
      owner: authReq.user.id,
      active: true,
    });

    /* ---------- Crear Trip ---------- */
    const newTrip = await TripModel.create({
      route: routeId,
      company: companyId,
      date: new Date(date),
      departureTime: time,
      price: price ?? 0,
      capacity: capacity ?? 20, // 👈 DEFINIDO (coherente con reportes)
      transportType: "Lancha",
      driver: adminId,
      active: true,
    });

    return res.status(201).json({
      message: "Turno y viaje creados exitosamente",
      schedule: newSchedule,
      trip: newTrip,
    });
  } catch (error) {
    console.error("❌ Error createScheduleWithTrip:", error);
    return res.status(500).json({
      message: "Error al crear turno y viaje",
    });
  }
};

/* =========================================================
   ASIGNAR / ACTUALIZAR TURNO (UPSERT)
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

    if (userRole === "owner") {
      const company = await CompanyModel.findOne({
        _id: companyId,
        owner: authReq.user.id,
      });
      if (company) isAuthorized = true;
    }

    if (userRole === "admin") {
      const adminUser = await UserModel.findById(authReq.user.id);

      const managesCompany =
        adminUser?.managedCompanies?.some(
          (id: Types.ObjectId) => id.toString() === companyId
        ) ?? false;

      if (managesCompany) isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: "No autorizado" });
    }

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
      message: "Error al asignar horario",
    });
  }
};

/* =========================================================
   OBTENER HORARIO POR MES
   ========================================================= */
export const getSchedule: RequestHandler = async (req, res) => {
  try {
    const { companyId, year, month } = req.query;

    if (!companyId || !year || !month) {
      return res.status(400).json({
        message: "Faltan parámetros (companyId, year, month)",
      });
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);

    const schedules = await ScheduleModel.find({
      company: companyId,
      date: { $gte: startDate, $lte: endDate },
      active: true,
    }).populate("admin", "name email");

    return res.json(schedules);
  } catch (error) {
    console.error("❌ Error getSchedule:", error);
    return res.status(500).json({
      message: "Error al obtener horario",
    });
  }
};



// import { RequestHandler } from "express";
// import { ScheduleModel } from "../models/schedule.model.js";
// import { CompanyModel } from "../models/company.model.js";
// import { TripModel } from "../models/trip.model.js";
// import { UserModel } from "../models/user.model.js";
// import { RouteModel } from "../models/route.model.js";
// import { AuthRequest } from "../middlewares/requireAuth.js";
// import mongoose from "mongoose";

// /* =========================================
//    ASIGNAR TURNO Y CREAR VIAJE (NUEVO)
//    ========================================= */
// export const createScheduleWithTrip: RequestHandler = async (req, res) => {
//     // const session = await mongoose.startSession();
//     // session.startTransaction();

//     try {
//         const authReq = req as AuthRequest;
//         const { date, time, companyId, adminId, routeId, price } = req.body;

//         if (!authReq.user) {
//             return res.status(401).json({ message: "No autenticado" });
//         }

//         // 1. Validaciones de Permisos (Owner o Admin de esa empresa)
//         const userRole = authReq.user.role.toLowerCase();
//         let isAuthorized = false;

//         if (userRole === 'owner') {
//             // Owner debe ser dueño de la empresa
//             const company = await CompanyModel.findOne({ _id: companyId, owner: authReq.user.id });
//             if (company) isAuthorized = true;
//         } else if (userRole === 'admin') {
//             // Admin debe gestionar la empresa
//             const adminUser = await UserModel.findById(authReq.user.id);
//             if (adminUser?.managedCompanies?.some(id => id.toString() === companyId)) {
//                 isAuthorized = true;
//             }
//         }

//         if (!isAuthorized) {
//             return res.status(403).json({ message: "No tienes permiso para gestionar esta empresa." });
//         }

//         // 2. Validar Ruta
//         const route = await RouteModel.findById(routeId);
//         if (!route) {
//             return res.status(404).json({ message: "Ruta no encontrada" });
//         }

//         // 3. Crear Registro en Schedule (Turno)
//         const newSchedule = new ScheduleModel({
//             date: new Date(date),
//             company: companyId,
//             admin: adminId,
//             owner: authReq.user.id,
//             active: true
//         });
//         await newSchedule.save(); // Sin session

//         // 4. Crear Registro en Trip (Viaje)
//         const tripPrice = price || 0; 

//         const newTrip = new TripModel({
//             route: routeId,
//             company: companyId,
//             date: new Date(date),
//             departureTime: time,
//             price: tripPrice,
//             availableSeats: 20,
//             transportType: "Lancha",
//             driver: adminId,
//             status: "scheduled"
//         });
//         await newTrip.save(); // Sin session

//         // await session.commitTransaction();

//         return res.status(201).json({
//             message: "Turno y Viaje creados exitosamente",
//             schedule: newSchedule,
//             trip: newTrip
//         });

//     } catch (error) {
//         // await session.abortTransaction();
//         console.error("❌ Error createScheduleWithTrip:", error);
//         return res.status(500).json({ message: "Error al crear turno y viaje" });
//     } finally {
//         // session.endSession();
//     }
// };

// /* =========================================
//    ASIGNAR TURNO (Upsert: Crear o Actualizar) - LEGACY / SIMPLE
//    ========================================= */
// export const setAdminSchedule: RequestHandler = async (req, res) => {
//   try {
//     const authReq = req as AuthRequest;
    
//     const { date, companyId, adminId, active } = req.body;
    
//     // Verificación de seguridad mejorada
//     const userRole = authReq.user?.role.toLowerCase();
//     let isAuthorized = false;

//     if (userRole === 'owner') {
//         const company = await CompanyModel.findOne({ _id: companyId, owner: authReq.user?.id });
//         if (company) isAuthorized = true;
//     } else if (userRole === 'admin') {
//          const adminUser = await UserModel.findById(authReq.user?.id);
//          if (adminUser?.managedCompanies?.some(id => id.toString() === companyId)) {
//              isAuthorized = true;
//          }
//     }

//     if (!isAuthorized) {
//          return res.status(403).json({ message: "No autorizado" });
//     }

//     // Upsert
//     const schedule = await ScheduleModel.findOneAndUpdate(
//       { 
//         date: new Date(date), 
//         company: companyId, 
//         admin: adminId 
//       },
//       {
//         date: new Date(date),
//         company: companyId,
//         admin: adminId,
//         owner: authReq.user?.id,
//         active: active !== undefined ? active : true
//       },
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );

//     return res.json(schedule);
//   } catch (error) {
//     console.error("❌ Error setAdminSchedule:", error);
//     return res.status(500).json({ message: "Error al asignar horario" });
//   }
// };

// /* =========================================
//    OBTENER HORARIO (Por Mes y Empresa)
//    ========================================= */
// export const getSchedule: RequestHandler = async (req, res) => {
//   try {
//     const { companyId, year, month } = req.query;

//     if (!companyId || !year || !month) {
//       return res.status(400).json({ message: "Faltan parámetros (companyId, year, month)" });
//     }

//     const startDate = new Date(Number(year), Number(month) - 1, 1);
//     const endDate = new Date(Number(year), Number(month), 0); // Último día del mes

//     // Buscar todos los schedules activos en ese rango
//     const schedules = await ScheduleModel.find({
//       company: companyId,
//       date: { $gte: startDate, $lte: endDate },
//       active: true
//     }).populate("admin", "name email");

//     return res.json(schedules);
//   } catch (error) {
//     console.error("❌ Error getSchedule:", error);
//     return res.status(500).json({ message: "Error al obtener horario" });
//   }
// };

