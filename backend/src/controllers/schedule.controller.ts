import { Request, Response } from "express";
import dayjs from "dayjs";

import { ScheduleModel } from "../models/schedule.model.js";
import { TripModel } from "../models/trip.model.js";
import { AuditLogModel } from "../models/auditLog.model.js";

/**
 * ⚠️ IMPORTANTE
 * Este controller:
 * - NO confía en n8n
 * - Es idempotente
 * - Decide TODO en backend
 * - n8n solo llama
 */

/* =========================================================
   GET /api/scheduler/pending-trips
   =========================================================
   Devuelve qué viajes deben activarse o desactivarse HOY
*/
export const getPendingTrips = async (_req: Request, res: Response) => {
  try {
    const today = dayjs().format("YYYY-MM-DD");

    // 1️⃣ Obtener schedules activos de hoy
    const schedules = await ScheduleModel.find({
      active: true,
      date: {
        $gte: dayjs(today).startOf("day").toDate(),
        $lte: dayjs(today).endOf("day").toDate(),
      },
    }).lean();

    if (!schedules.length) {
      return res.json({
        date: today,
        activate: [],
        deactivate: [],
      });
    }

    // 2️⃣ Viajes que deberían estar activos hoy
    const tripsToActivate = await TripModel.find({
      date: today,
      isActive: false,
    }).lean();

    // 3️⃣ Viajes que NO son de hoy pero siguen activos
    const tripsToDeactivate = await TripModel.find({
      date: { $ne: today },
      isActive: true,
    }).lean();

    return res.json({
      date: today,
      activate: tripsToActivate.map((t) => t._id),
      deactivate: tripsToDeactivate.map((t) => t._id),
    });
  } catch (error) {
    console.error("❌ [scheduler.getPendingTrips]", error);
    return res.status(500).json({ message: "Error obteniendo viajes pendientes" });
  }
};

/* =========================================================
   POST /api/scheduler/apply
   =========================================================
   Aplica activaciones y desactivaciones
*/
export const applyScheduler = async (req: Request, res: Response) => {
  try {
    const { activate = [], deactivate = [] } = req.body;

    const now = new Date();

    /* =========================
       ACTIVAR VIAJES
       ========================= */
    for (const tripId of activate) {
      const trip = await TripModel.findOne({
        _id: tripId,
        isActive: false,
      });

      // 🛡️ Idempotencia
      if (!trip) continue;

      trip.isActive = true;
      trip.deactivatedAt = undefined;
      await trip.save();

      await AuditLogModel.create({
        action: "trip.activate",
        entity: "trip",
        entityId: trip._id,
        performedBy: req.user?.id, // usuario system
        metadata: {
          reason: "scheduler",
          date: trip.date,
        },
      });
    }

    /* =========================
       DESACTIVAR VIAJES
       ========================= */
    for (const tripId of deactivate) {
      const trip = await TripModel.findOne({
        _id: tripId,
        isActive: true,
      });

      // 🛡️ Idempotencia
      if (!trip) continue;

      trip.isActive = false;
      trip.deactivatedAt = now;
      await trip.save();

      await AuditLogModel.create({
        action: "trip.deactivate",
        entity: "trip",
        entityId: trip._id,
        performedBy: req.user?.id,
        metadata: {
          reason: "scheduler",
          date: trip.date,
        },
      });
    }

    return res.json({
      ok: true,
      activated: activate.length,
      deactivated: deactivate.length,
    });
  } catch (error) {
    console.error("❌ [scheduler.applyScheduler]", error);
    return res.status(500).json({ message: "Error aplicando scheduler" });
  }
};


// import { RequestHandler } from "express";
// import mongoose, { Types } from "mongoose";

// import { ScheduleModel } from "../models/schedule.model.js";
// import { CompanyModel } from "../models/company.model.js";
// import { TripModel } from "../models/trip.model.js";
// import { UserModel } from "../models/user.model.js";
// import { RouteModel } from "../models/route.model.js";
// import { AuthRequest } from "../middlewares/requireAuth.js";

// /* =========================================================
//    ASIGNAR TURNO Y CREAR VIAJE
//    ========================================================= */
// export const createScheduleWithTrip: RequestHandler = async (req, res) => {
//   try {
//     const authReq = req as AuthRequest;
//     const { date, time, companyId, adminId, routeId, price, capacity } = req.body;

//     /* ---------- Seguridad base ---------- */
//     if (!authReq.user) {
//       return res.status(401).json({ message: "No autenticado" });
//     }

//     const userRole = authReq.user.role;
//     let isAuthorized = false;

//     /* ---------- OWNER ---------- */
//     if (userRole === "owner") {
//       const company = await CompanyModel.findOne({
//         _id: companyId,
//         owner: authReq.user.id,
//       });
//       if (company) isAuthorized = true;
//     }

//     /* ---------- ADMIN ---------- */
//     if (userRole === "admin") {
//       const adminUser = await UserModel.findById(authReq.user.id);

//       const managesCompany =
//         adminUser?.managedCompanies?.some(
//           (id: Types.ObjectId) => id.toString() === companyId
//         ) ?? false;

//       if (managesCompany) isAuthorized = true;
//     }

//     if (!isAuthorized) {
//       return res.status(403).json({
//         message: "No tienes permiso para gestionar esta empresa",
//       });
//     }

//     /* ---------- Validar Ruta ---------- */
//     const route = await RouteModel.findById(routeId);
//     if (!route) {
//       return res.status(404).json({ message: "Ruta no encontrada" });
//     }

//     /* ---------- Crear Schedule ---------- */
//     const newSchedule = await ScheduleModel.create({
//       date: new Date(date),
//       company: companyId,
//       admin: adminId,
//       owner: authReq.user.id,
//       active: true,
//     });

//     /* ---------- Crear Trip ---------- */
//     const newTrip = await TripModel.create({
//       route: routeId,
//       company: companyId,
//       date: new Date(date),
//       departureTime: time,
//       price: price ?? 0,
//       capacity: capacity ?? 30, // 👈 DEFINIDO (coherente con reportes)
//       transportType: "Lancha",
//       driver: adminId,
//       active: true,
//     });

//     return res.status(201).json({
//       message: "Turno y viaje creados exitosamente",
//       schedule: newSchedule,
//       trip: newTrip,
//     });
//   } catch (error) {
//     console.error("❌ Error createScheduleWithTrip:", error);
//     return res.status(500).json({
//       message: "Error al crear turno y viaje",
//     });
//   }
// };

// /* =========================================================
//    ASIGNAR / ACTUALIZAR TURNO (UPSERT)
//    ========================================================= */
// export const setAdminSchedule: RequestHandler = async (req, res) => {
//   try {
//     const authReq = req as AuthRequest;
//     const { date, companyId, adminId, active } = req.body;

//     if (!authReq.user) {
//       return res.status(401).json({ message: "No autenticado" });
//     }

//     const userRole = authReq.user.role;
//     let isAuthorized = false;

//     if (userRole === "owner") {
//       const company = await CompanyModel.findOne({
//         _id: companyId,
//         owner: authReq.user.id,
//       });
//       if (company) isAuthorized = true;
//     }

//     if (userRole === "admin") {
//       const adminUser = await UserModel.findById(authReq.user.id);

//       const managesCompany =
//         adminUser?.managedCompanies?.some(
//           (id: Types.ObjectId) => id.toString() === companyId
//         ) ?? false;

//       if (managesCompany) isAuthorized = true;
//     }

//     if (!isAuthorized) {
//       return res.status(403).json({ message: "No autorizado" });
//     }

//     const schedule = await ScheduleModel.findOneAndUpdate(
//       {
//         date: new Date(date),
//         company: companyId,
//         admin: adminId,
//       },
//       {
//         date: new Date(date),
//         company: companyId,
//         admin: adminId,
//         owner: authReq.user.id,
//         active: active ?? true,
//       },
//       { upsert: true, new: true }
//     );

//     return res.json(schedule);
//   } catch (error) {
//     console.error("❌ Error setAdminSchedule:", error);
//     return res.status(500).json({
//       message: "Error al asignar horario",
//     });
//   }
// };

// /* =========================================================
//    OBTENER HORARIO POR MES
//    ========================================================= */
// export const getSchedule: RequestHandler = async (req, res) => {
//   try {
//     const { companyId, year, month } = req.query;

//     if (!companyId || !year || !month) {
//       return res.status(400).json({
//         message: "Faltan parámetros (companyId, year, month)",
//       });
//     }

//     const startDate = new Date(Number(year), Number(month) - 1, 1);
//     const endDate = new Date(Number(year), Number(month), 0);

//     const schedules = await ScheduleModel.find({
//       company: companyId,
//       date: { $gte: startDate, $lte: endDate },
//       active: true,
//     }).populate("admin", "name email");

//     return res.json(schedules);
//   } catch (error) {
//     console.error("❌ Error getSchedule:", error);
//     return res.status(500).json({
//       message: "Error al obtener horario",
//     });
//   }
// };


