import { RequestHandler } from "express";
import { TripModel } from "../models/trip.model.js";
import { RouteModel } from "../models/route.model.js";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* =========================================================
   LISTAR VIAJES (PÚBLICO)
   - Solo viajes activos
   - Solo rutas activas
   ========================================================= */
export const getTrips: RequestHandler = async (_req, res) => {
  try {
    const trips = await TripModel.find({ active: true })
      .populate({
        path: "route",
        match: { active: true },
        populate: { path: "company", select: "name" },
      })
      .populate("company", "name")
      .sort({ createdAt: -1 });

    // Eliminar viajes cuya ruta fue filtrada
    const filtered = trips.filter((trip) => trip.route !== null);

    return res.json(filtered);
  } catch (error) {
    console.error("❌ [getTrips] Error:", error);
    return res.status(500).json({
      message: "Error al obtener viajes",
    });
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

    let companyFilter: { _id?: string; owner?: string } = {};

    if (role === "admin") {
      if (!companyId) {
        return res
          .status(403)
          .json({ message: "Admin sin empresa asignada" });
      }
      companyFilter._id = companyId;
    }

    if (role === "owner") {
      companyFilter.owner = userId;
    }

    const companies = await CompanyModel.find(companyFilter).select("_id");

    if (companies.length === 0) {
      return res.json([]);
    }

    const companyIds = companies.map((c) => c._id);

    const trips = await TripModel.find({
      company: { $in: companyIds },
    })
      .populate({
        path: "route",
        populate: { path: "company", select: "name" },
      })
      .sort({ createdAt: -1 });

    return res.json(trips);
  } catch (error) {
    console.error("❌ [getManageTrips] Error:", error);
    return res.status(500).json({
      message: "Error al obtener viajes",
    });
  }
};

/* =========================================================
   CREAR VIAJE (SOLO OWNER)
   ========================================================= */
   
export const createTrip: RequestHandler = async (req, res) => {
  console.log("🟢 [createTrip] BODY:", req.body);

  try {
    const authReq = req as AuthRequest;

    console.log("🟢 [createTrip] USER:", authReq.user);

    if (!authReq.user) {
      console.log("🔴 No autenticado");
      return res.status(401).json({ message: "No autenticado" });
    }

    if (authReq.user.role !== "owner") {
      console.log("🔴 No es owner:", authReq.user.role);
      return res.status(403).json({
        message: "Solo los owners pueden crear viajes",
      });
    }

    const {
      routeId,
      date,
      departureTime,
      price,
      capacity,
      transportType,
    } = req.body;

    console.log("🟢 [createTrip] Datos:", {
      routeId,
      date,
      departureTime,
      price,
      capacity,
      transportType,
    });

    if (
      !routeId ||
      !date ||
      !departureTime ||
      price == null ||
      capacity == null
    ) {
      console.log("🔴 Faltan campos");
      return res.status(400).json({
        message:
          "routeId, date, departureTime, price y capacity son obligatorios",
      });
    }

    if (capacity <= 0) {
      console.log("🔴 Capacity inválida:", capacity);
      return res.status(400).json({
        message: "La capacidad debe ser mayor a 0",
      });
    }

    console.log("🟢 Buscando ruta...");
    const route = await RouteModel.findById(routeId);
    console.log("🟢 Ruta:", route);

    if (!route || !route.active) {
      console.log("🔴 Ruta inválida o inactiva");
      return res.status(400).json({
        message: "Ruta inválida o inactiva",
      });
    }

    console.log("🟢 Buscando empresa...");
    const company = await CompanyModel.findById(route.company);
    console.log("🟢 Empresa:", company);

    if (!company) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    if (company.owner.toString() !== authReq.user.id) {
      console.log("🔴 Owner no coincide");
      return res.status(403).json({
        message: "No eres owner de esta empresa",
      });
    }

    console.log("🟢 Creando viaje en Mongo...");
    const trip = await TripModel.create({
      route: route._id,
      company: company._id,
      createdBy: authReq.user.id,
      date,
      departureTime,
      price,
      capacity,
      transportType: transportType || "lancha",
      active: true,
    });

    console.log("✅ Viaje creado:", trip);

    return res.status(201).json(trip);
  } catch (error: any) {
    console.error("🔥 ERROR REAL createTrip:", error);

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Error interno al crear el viaje",
    });
  }
};


/* =========================================================
   ACTIVAR / DESACTIVAR VIAJE (OWNER / ADMIN)
   ========================================================= */
export const toggleTripActive: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { tripId } = req.params;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const trip = await TripModel.findById(tripId).populate("company");

    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const company: any = trip.company;

    const isOwner = company.owner.toString() === authReq.user.id;
    const isAdmin =
      authReq.user.role === "admin" &&
      authReq.user.companyId === company._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "No autorizado para modificar este viaje",
      });
    }

    trip.active = !trip.active;
    await trip.save();

    return res.json(trip);
  } catch (error) {
    console.error("❌ [toggleTripActive] Error:", error);
    return res.status(500).json({
      message: "Error al cambiar estado del viaje",
    });
  }
};

/* =========================================================
   ELIMINAR VIAJE (SOLO OWNER)
   ========================================================= */
export const deleteTrip: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { tripId } = req.params;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const trip = await TripModel.findById(tripId).populate("company");

    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const company: any = trip.company;

    if (company.owner.toString() !== authReq.user.id) {
      return res.status(403).json({
        message: "No autorizado para eliminar este viaje",
      });
    }

    await TripModel.findByIdAndDelete(tripId);

    return res.json({ message: "Viaje eliminado correctamente" });
  } catch (error) {
    console.error("❌ [deleteTrip] Error:", error);
    return res.status(500).json({
      message: "Error al eliminar viaje",
    });
  }
};

/* =========================================================
   LISTAR VIAJES DE UNA EMPRESA ESPECÍFICA
   ========================================================= */
export const getCompanyTrips: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { companyId } = req.params;

    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    const isOwner =
      authReq.user && company.owner.toString() === authReq.user.id;

    const isAdmin =
      authReq.user &&
      authReq.user.role === "admin" &&
      authReq.user.companyId === companyId;

    const hasPrivileges = isOwner || isAdmin;

    const filter: any = { company: companyId };

    if (!hasPrivileges) {
      if (!company.active) {
        return res.status(403).json({
          message: "Empresa no disponible",
        });
      }
      filter.active = true;
    }

    const trips = await TripModel.find(filter)
      .populate({
        path: "route",
        populate: { path: "company", select: "name" },
      })
      .sort({ createdAt: -1 });

    return res.json(trips);
  } catch (error) {
    console.error("❌ [getCompanyTrips] Error:", error);
    return res.status(500).json({
      message: "Error al obtener viajes de la empresa",
    });
  }
};
