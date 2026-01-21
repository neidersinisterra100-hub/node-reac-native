import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";
import { z } from "zod";

import { TripModel } from "../models/trip.model.js";
import { RouteModel } from "../models/route.model.js";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";
import { TRANSPORT_TYPES } from "../constants/enums.js";
import { getPublicTripsService } from "../services/trip.service.js";
import type { TripDocument } from "../models/trip.model.js";

/* =========================================================
   DTO
   ========================================================= */

interface TripDTO {
  id: string;
  routeId: string;
  companyId: string;
  date: string;
  departureTime: string;
  price: number;
  transportType: string;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
}

function toTripDTO(trip: any): TripDTO & { route?: any; company?: any } {
  return {
    id: trip._id.toString(),
    routeId: trip.routeId?._id ? trip.routeId._id.toString() : trip.routeId?.toString(),
    companyId: trip.companyId?._id ? trip.companyId._id.toString() : trip.companyId?.toString(),
    date: trip.date,
    departureTime: trip.departureTime,
    price: trip.price,
    transportType: trip.transportType,
    capacity: trip.capacity,
    isActive: trip.isActive,
    createdAt: trip.createdAt,
    route: trip.routeId?._id ? trip.routeId : undefined,
    company: trip.companyId?._id ? trip.companyId : undefined
  };
}

/* =========================================================
   ZOD SCHEMA
   ========================================================= */

const createTripSchema = z.object({
  routeId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/),
  price: z.number().min(0),
  capacity: z.number().int().min(1),
  transportType: z
    .string()
    .transform((v) => v.toLowerCase())
    .refine((v) => TRANSPORT_TYPES.includes(v as any), {
      message: "Tipo de transporte inválido"
    })
    .optional()
});

/* =========================================================
   LISTAR VIAJES (PÚBLICO)
   ========================================================= */

export const getTrips: RequestHandler = async (_req, res) => {
  try {
    const trips = await getPublicTripsService();
    // Nota: getPublicTripsService debería retornar documentos o plain objects
    // Asumimos que devuelve documentos para este ejemplo, si no, habría que ajustar
    return res.json(trips.map(toTripDTO));
  } catch (error) {
    console.error("❌ [getTrips] Error:", error);
    return res.status(500).json({ message: "Error al obtener viajes" });
  }
};

/* =========================================================
   LISTAR VIAJES PARA GESTIÓN (OWNER / ADMIN)
   ========================================================= */

export const getManageTrips: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const { role, companyId, id: userId } = authReq.user;

    const companyFilter: Record<string, unknown> = {};

    if (role === "admin") {
      if (!companyId) {
        return res.status(403).json({ message: "Admin sin empresa asignada" });
      }
      companyFilter._id = companyId;
    }

    if (role === "owner") {
      companyFilter.owner = userId;
    }

    const companies = await CompanyModel.find(companyFilter).select("_id");
    if (!companies.length) return res.json([]);

    const companyIds = companies.map((c) => c._id);

    const trips = await TripModel.find({
      companyId: { $in: companyIds } // ✅ FK Correcta
    })
      .populate("routeId")
      .populate("companyId")
      .sort({ createdAt: -1 });

    return res.json(trips.map(toTripDTO));
  } catch (error) {
    console.error("❌ [getManageTrips] Error:", error);
    return res.status(500).json({ message: "Error al obtener viajes" });
  }
};

/* =========================================================
   CREAR VIAJE (SOLO OWNER)
   ========================================================= */

export const createTrip: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      await session.abortTransaction();
      return res.status(401).json({ message: "No autenticado" });
    }

    if (authReq.user.role !== "owner") {
      await session.abortTransaction();
      return res.status(403).json({ message: "Solo owners pueden crear viajes" });
    }

    const parsed = createTripSchema.safeParse(req.body);
    if (!parsed.success) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsed.error.flatten().fieldErrors
      });
    }

    const {
      routeId,
      date,
      departureTime,
      price,
      capacity,
      transportType = "lancha"
    } = parsed.data;

    const route = await RouteModel.findById(routeId).session(session);
    if (!route || !route.isActive) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Ruta inválida o inactiva" });
    }

    const company = await CompanyModel.findById(route.companyId).session(session);
    if (!company || !company.isActive) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Empresa inválida o inactiva" });
    }

    if (company.owner.toString() !== authReq.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ message: "No eres owner de esta empresa" });
    }

    const [trip] = await TripModel.create(
      [
        {
          routeId: new Types.ObjectId(routeId),
          companyId: company._id, // ✅ FK Correcta
          createdBy: new Types.ObjectId(authReq.user.id),
          date,
          departureTime,
          price,
          capacity,
          transportType,
          isActive: true // ✅ CORRECTO
        }
      ],
      { session }
    );

    await session.commitTransaction();
    return res.status(201).json(toTripDTO(trip));
  } catch (error) {
    await session.abortTransaction();
    console.error("🔥 [createTrip] Error:", error);
    return res.status(500).json({ message: "Error interno al crear el viaje" });
  } finally {
    session.endSession();
  }
};

/* =========================================================
   ACTIVAR / DESACTIVAR VIAJE
   ========================================================= */

export const toggleTripActive: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { tripId } = req.params;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const trip = await TripModel.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const company = await CompanyModel.findById(trip.companyId); // ✅ FK Correcta
    const route = await RouteModel.findById(trip.routeId); // ✅ FK Correcta

    if (!company || !route) {
      return res.status(400).json({ message: "Datos relacionados inválidos" });
    }

    const isOwner = company.owner.toString() === authReq.user.id;
    const isAdmin =
      authReq.user.role === "admin" &&
      authReq.user.companyId === company._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Si vamos a activar, verificar padres
    if (!trip.isActive) {
      if (!company.isActive) {
        return res.status(409).json({ message: "No puedes activar viaje: Empresa inactiva" });
      }
      if (!route.isActive) {
        return res.status(409).json({ message: "No puedes activar viaje: Ruta inactiva" });
      }
    }

    const newStatus = !trip.isActive;
    trip.isActive = newStatus;

    if (!newStatus) {
      trip.deactivatedAt = new Date();
    } else {
      trip.deactivatedAt = undefined;
    }

    await trip.save();

    return res.json(toTripDTO(trip));
  } catch (error) {
    console.error("❌ [toggleTripActive] Error:", error);
    return res.status(500).json({ message: "Error al cambiar estado del viaje" });
  }
};

/* =========================================================
   ELIMINAR VIAJE (SOLO OWNER)
   ========================================================= */

export const deleteTrip: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authReq = req as AuthRequest;
    const { tripId } = req.params;

    if (!authReq.user) {
      await session.abortTransaction();
      return res.status(401).json({ message: "No autenticado" });
    }

    const trip = await TripModel.findById(tripId).session(session);
    if (!trip) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const company = await CompanyModel.findById(trip.companyId).session(session); // ✅ FK Correcta
    if (!company || company.owner.toString() !== authReq.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ message: "No autorizado" });
    }

    await TripModel.findByIdAndDelete(trip._id, { session });

    await session.commitTransaction();
    return res.json({ message: "Viaje eliminado correctamente" });
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ [deleteTrip] Error:", error);
    return res.status(500).json({ message: "Error al eliminar viaje" });
  } finally {
    session.endSession();
  }
};

/* =========================================================
   LISTAR VIAJES DE UNA EMPRESA
   ========================================================= */

export const getCompanyTrips: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { companyId } = req.params;

    const company = await CompanyModel.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    const isOwner =
      authReq.user && company.owner.toString() === authReq.user.id;
    const isAdmin =
      authReq.user &&
      authReq.user.role === "admin" &&
      authReq.user.companyId === companyId;

    const hasPrivileges = isOwner || isAdmin;

    const filter: Record<string, unknown> = { companyId: company._id }; // ✅ FK Correcta

    if (!hasPrivileges) {
      if (!company.isActive) {
        return res.status(403).json({ message: "Empresa no disponible" });
      }
      filter.isActive = true;
    }

    const trips = await TripModel.find(filter)
      .populate("routeId")
      .populate("companyId")
      .sort({ createdAt: -1 });
    return res.json(trips.map(toTripDTO));
  } catch (error) {
    console.error("❌ [getCompanyTrips] Error:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener viajes de la empresa" });
  }
};
