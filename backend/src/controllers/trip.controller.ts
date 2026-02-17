import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";
import { z } from "zod";

// ===============================
// MODELOS
// ===============================
import { TripModel } from "../models/trip.model.js";
import { RouteModel } from "../models/route.model.js";
import { CompanyModel } from "../models/company.model.js";
import { SeatReservationModel } from "../models/seatReservation.model.js";

// ===============================
// CONSTANTES / SERVICIOS
// ===============================
import { TRANSPORT_TYPES } from "../constants/enums.js";
import { getPublicTripsService } from "../services/trip.service.js";
import { TripWithSoldSeats } from "../types/trip.taypes.js";

/* =========================================================
   DTO (Data Transfer Object)
   ---------------------------------------------------------
   - Normaliza la respuesta para frontend (web / mobile)
   - Maneja tanto ObjectId como documentos populados
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

/**
 * Mapper robusto:
 * - Soporta populate o no populate
 * - Devuelve objetos route y company cuando existen
 */
function toTripDTO(trip: any): TripDTO & { route?: any; company?: any } {
  return {
    id: trip._id.toString(),

    routeId:
      typeof trip.routeId === "object"
        ? trip.routeId._id.toString()
        : trip.routeId.toString(),

    companyId:
      typeof trip.companyId === "object"
        ? trip.companyId._id.toString()
        : trip.companyId.toString(),

    date: trip.date,
    departureTime: trip.departureTime,
    price: trip.price,
    transportType: trip.transportType,
    capacity: trip.capacity,
    isActive: trip.isActive,
    createdAt: trip.createdAt,

    route:
      trip.routeId && typeof trip.routeId === "object"
        ? {
          id: trip.routeId._id.toString(),
          origin: trip.routeId.origin,
          destination: trip.routeId.destination,
        }
        : undefined,

    company:
      trip.companyId && typeof trip.companyId === "object"
        ? {
          id: trip.companyId._id.toString(),
          name: trip.companyId.name,
        }
        : undefined,
  };
}

/* =========================================================
   ZOD SCHEMA – CREAR VIAJE
   ---------------------------------------------------------
   - Valida datos de entrada
   - Evita basura / legacy fields
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
      message: "Tipo de transporte inválido",
    })
    .optional(),
});

export const getTrips: RequestHandler = async (_req, res) => {
  try {
    const trips = await TripModel.find({ isActive: true })
      .populate({
        path: "routeId",
        select: "origin destination isActive",
      })
      .populate({
        path: "companyId",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(trips.map(toTripDTO));
  } catch (error) {
    console.error("❌ [getTrips] Error:", error);
    return res.status(500).json({ message: "Error al obtener viajes" });
  }
};

/* =========================================================
   LISTAR VIAJES PARA GESTIÓN (ADMIN / OWNER)
   ---------------------------------------------------------
   - requireAuth + ownershipGuard ya corrieron
   - Usa empresa del JWT o del ownership
   ========================================================= */
/* =========================================================
GET TRIPS (MANAGE)
========================================================= */

export const getManageTrips: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const { role, companyId, id: userId } = req.user;

    const companyFilter: Record<string, unknown> = {};

    if (role === "admin") {
      companyFilter._id = companyId;
    }

    if (role === "owner") {
      companyFilter.owner = userId;
    }

    const companies = await CompanyModel.find(companyFilter)
      .select("_id")
      .lean();

    if (!companies.length) {
      return res.json([]);
    }

    const trips = await TripModel.find({
      companyId: { $in: companies.map(c => c._id) },
    })
      .populate("routeId", "origin destination isActive")
      .populate("companyId", "name")
      .sort({ createdAt: -1 })
      .lean();

    let enrichedTrips;

    try {
      enrichedTrips = await attachSoldSeats(trips);
    } catch (err) {
      console.error("[attachSoldSeats]", err);
      enrichedTrips = trips.map(t => ({
        ...t,
        soldSeats: 0,
      }));
    }

    return res.json(
      enrichedTrips.map(t => ({
        ...toTripDTO(t),
        soldSeats: t.soldSeats,
      }))
    );
  } catch (error) {
    console.error("[getManageTrips]", error);
    return res.status(500).json({ message: "Error al obtener viajes" });
  }
};

/* =========================================================
   CREAR VIAJE
   ---------------------------------------------------------
   - requireAuth + ownershipGuard
   - Solo OWNER de la empresa
   - Deriva ubicación desde la ruta
   ========================================================= */

export const createTrip: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      await session.abortTransaction();
      return res.status(401).json({ message: "No autenticado" });
    }

    if (req.user.role !== "owner") {
      await session.abortTransaction();
      return res.status(403).json({
        message: "Solo owners pueden crear viajes",
      });
    }

    const parsed = createTripSchema.safeParse(req.body);
    if (!parsed.success) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Datos inválidos",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      routeId,
      date,
      departureTime,
      price,
      capacity,
      transportType = "lancha",
    } = parsed.data;

    const route = await RouteModel.findById(routeId).session(session);
    if (!route || !route.isActive) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Ruta inválida o inactiva",
      });
    }

    const company = await CompanyModel.findById(route.companyId).session(
      session
    );
    if (!company || !company.isActive) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Empresa inválida o inactiva",
      });
    }

    if (company.owner.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({
        message: "No eres owner de esta empresa",
      });
    }

    const [trip] = await TripModel.create(
      [
        {
          routeId: route._id,
          companyId: company._id,
          departmentId: route.departmentId,
          municipioId: route.municipioId,
          cityId: route.cityId,
          createdBy: new Types.ObjectId(req.user.id),
          date,
          departureTime,
          price,
          capacity,
          transportType,
          isActive: true,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    await trip.populate(["routeId", "companyId"]);

    return res.status(201).json(toTripDTO(trip));
  } catch (error) {
    await session.abortTransaction();
    console.error("🔥 [createTrip] Error:", error);
    return res.status(500).json({
      message: "Error interno al crear el viaje",
    });
  } finally {
    session.endSession();
  }
};

/* =========================================================
   ACTIVAR / DESACTIVAR VIAJE
   ---------------------------------------------------------
   - requireAuth + ownershipGuard
   - Valida empresa y ruta antes de activar
   ========================================================= */

export const toggleTripActive: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const { tripId } = req.params;

    const trip = await TripModel.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        message: "Viaje no encontrado",
      });
    }

    const company = await CompanyModel.findById(trip.companyId);
    const route = await RouteModel.findById(trip.routeId);

    if (!company || !route) {
      return res.status(400).json({
        message: "Datos relacionados inválidos",
      });
    }

    const isOwner = company.owner.toString() === req.user.id;
    const isAdmin =
      req.user.role === "admin" &&
      req.user.companyId === company._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Validar padres antes de activar
    if (!trip.isActive) {
      if (!company.isActive) {
        return res.status(409).json({
          message: "Empresa inactiva",
        });
      }
      if (!route.isActive) {
        return res.status(409).json({
          message: "Ruta inactiva",
        });
      }
    }

    trip.isActive = !trip.isActive;
    trip.deactivatedAt = trip.isActive ? undefined : new Date();

    await trip.save();
    await trip.populate(["routeId", "companyId"]);

    return res.json(toTripDTO(trip));
  } catch (error) {
    console.error("❌ [toggleTripActive] Error:", error);
    return res.status(500).json({
      message: "Error al cambiar estado del viaje",
    });
  }
};

/* =========================================================
   ELIMINAR VIAJE
   ---------------------------------------------------------
   - Solo OWNER
   - Transaccional
   ========================================================= */

export const deleteTrip: RequestHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      await session.abortTransaction();
      return res.status(401).json({ message: "No autenticado" });
    }

    const { tripId } = req.params;

    const trip = await TripModel.findById(tripId).session(session);
    if (!trip) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Viaje no encontrado",
      });
    }

    const company = await CompanyModel.findById(trip.companyId).session(
      session
    );
    if (!company || company.owner.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({
        message: "No autorizado",
      });
    }

    await TripModel.findByIdAndDelete(trip._id, { session });

    await session.commitTransaction();
    return res.json({
      message: "Viaje eliminado correctamente",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ [deleteTrip] Error:", error);
    return res.status(500).json({
      message: "Error al eliminar viaje",
    });
  } finally {
    session.endSession();
  }
};

/* =========================================================
   LISTAR VIAJES DE UNA EMPRESA
   ---------------------------------------------------------
   - Público para empresas activas
   - Privado (admin/owner) ve todo
   ========================================================= */

export const getCompanyTrips: RequestHandler = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await CompanyModel.findById(companyId);
    if (!company) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    const isOwner =
      req.user && company.owner.toString() === req.user.id;
    const isAdmin =
      req.user &&
      req.user.role === "admin" &&
      req.user.companyId === companyId;

    const filter: Record<string, unknown> = {
      companyId: company._id,
    };

    // Usuarios externos solo ven viajes activos
    if (!isOwner && !isAdmin) {
      if (!company.isActive) {
        return res.status(403).json({
          message: "Empresa no disponible",
        });
      }
      filter.isActive = true;
    }

    const trips = await TripModel.find(filter)
      .populate("routeId")
      .populate("companyId")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(trips.map(toTripDTO));
  } catch (error) {
    console.error("❌ [getCompanyTrips] Error:", error);
    return res.status(500).json({
      message: "Error al obtener viajes de la empresa",
    });
  }
};

export const getTripById: RequestHandler = async (req, res) => {
  try {
    const { tripId } = req.params;

    // 🔒 Blindaje ANTES de tocar Mongo
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }

    const trip = await TripModel.findById(tripId)
      .populate("routeId")
      .populate("companyId")
      .lean();

    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const soldSeats = await SeatReservationModel.countDocuments({
      tripId,
      status: "confirmed",
    });

    return res.json({
      ...toTripDTO(trip),
      soldSeats,
    });
  } catch (error) {
    console.error("[getTripById]", error);
    return res.status(500).json({ message: "Error al obtener viaje" });
  }
};


/* =========================================================
   SOLD SEATS (INTEGRADO)
========================================================= */

/**
 * 🔥 Agrega soldSeats a una lista de viajes
 * - Cuenta SOLO asientos confirmados
 * - Evita N queries por viaje
 */

async function attachSoldSeats(
  trips: any[]
): Promise<TripWithSoldSeats[]> {
  const tripIds = trips.map(t => t._id);

  const stats = await SeatReservationModel.aggregate([
    {
      $match: {
        tripId: { $in: tripIds },
        status: "confirmed",
      },
    },
    {
      $group: {
        _id: "$tripId",
        soldSeats: { $sum: 1 },
      },
    },
  ]);

  const map = new Map(
    stats.map(s => [s._id.toString(), s.soldSeats])
  );

  return trips.map(trip => ({
    ...trip,
    soldSeats: map.get(trip._id.toString()) || 0,
  }));
}
