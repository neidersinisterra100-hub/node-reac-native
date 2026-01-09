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
        populate: { path: "company" },
      })
      .sort({ createdAt: -1 });

    // 🔒 Elimina viajes cuya ruta fue filtrada
    const filtered = trips.filter(
      (trip) => trip.route !== null
    );

    res.json(filtered);
  } catch (error) {
    console.error("❌ Error getTrips:", error);
    res.status(500).json({
      message: "Error al obtener viajes",
    });
  }
};

/* =========================================================
   LISTAR VIAJES POR ROL (INTERNO)
   - Admin: solo viajes de su empresa
   - Owner: viajes de sus empresas
   ========================================================= */
export const getTripsByRole: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const { role, companyId, id: userId } = authReq.user;

    let companyFilter: { _id?: string; owner?: string } = {};

    /* 🔒 ADMIN: solo su empresa */
    if (role === "admin") {
      if (!companyId) {
        return res.status(403).json({
          message: "Admin sin empresa asignada",
        });
      }
      companyFilter._id = companyId;
    }

    /* 🔒 OWNER: todas sus empresas */
    if (role === "owner") {
      companyFilter.owner = userId;
    }

    const companies = await CompanyModel.find(companyFilter).select("_id");

    const companyIds = companies.map((c) => c._id);

    const trips = await TripModel.find({
      company: { $in: companyIds },
    })
      .populate({
        path: "route",
        select: "origin destination",
      })
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    console.error("❌ Error getTripsByRole:", error);
    res.status(500).json({
      message: "Error al obtener viajes",
    });
  }
};

/* =========================================================
   CREAR VIAJE (SOLO OWNER)
   ========================================================= */
export const createTrip: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    /* 🔒 AUTENTICACIÓN */
    if (!authReq.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    /* 🔒 SOLO OWNER */
    if (authReq.user.role !== "owner") {
      return res.status(403).json({
        message: "Solo los owners pueden crear viajes",
      });
    }

    const {
      routeId,
      date,
      departureTime,
      price,
      transportType,
    } = req.body;

    if (!routeId || !date || !departureTime || price == null) {
      return res.status(400).json({
        message:
          "routeId, date, departureTime y price son obligatorios",
      });
    }

    /* =====================================================
       VALIDAR RUTA
       ===================================================== */
    const route = await RouteModel.findById(routeId);

    if (!route) {
      return res.status(404).json({
        message: "Ruta no encontrada",
      });
    }

    if (!route.active) {
      return res.status(400).json({
        message: "No se pueden crear viajes en rutas inactivas",
      });
    }

    /* =====================================================
       VALIDAR EMPRESA
       ===================================================== */
    const company = await CompanyModel.findById(route.company);

    if (!company) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    if (company.owner.toString() !== authReq.user.id) {
      return res.status(403).json({
        message: "No eres owner de esta empresa",
      });
    }

    /* =====================================================
       CREAR VIAJE
       ===================================================== */
    const trip = await TripModel.create({
      route: route._id,
      company: company._id,
      createdBy: authReq.user.id,
      date,
      departureTime,
      price,
      transportType: transportType || "lancha",
      active: true,
    });

    return res.status(201).json(trip);
  } catch (error) {
    console.error("❌ Error createTrip:", error);
    return res.status(500).json({
      message: "Error al crear el viaje",
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

    const company = trip.company as unknown as { _id: string; owner: { toString: () => string } | string };

    const isOwner = company.owner.toString() === authReq.user.id;
    const isAdmin =
      authReq.user.role === "admin" &&
      authReq.user.companyId === company._id.toString();

    /* 🔒 VALIDACIÓN DE PERMISOS */
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "No autorizado para modificar este viaje",
      });
    }

    trip.active = !trip.active;
    await trip.save();

    res.json(trip);
  } catch (error) {
    console.error("❌ Error toggleTripActive:", error);
    res.status(500).json({
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

    const company = trip.company as unknown as { owner: { toString: () => string } | string };

    /* 🔒 SOLO OWNER */
    if (company.owner.toString() !== authReq.user.id) {
      return res.status(403).json({
        message: "No autorizado para eliminar este viaje",
      });
    }

    await TripModel.findByIdAndDelete(tripId);

    res.json({ message: "Viaje eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error deleteTrip:", error);
    res.status(500).json({
      message: "Error al eliminar viaje",
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

    // 🔒 ADMIN → solo su empresa
    if (role === "admin") {
      if (!companyId) {
        return res.status(403).json({
          message: "Admin sin empresa asignada",
        });
      }
      companyFilter._id = companyId;
    }

    // 🔒 OWNER → todas sus empresas
    if (role === "owner") {
      companyFilter.owner = userId;
    }

    const companies = await CompanyModel.find(companyFilter).select("_id");
    const companyIds = companies.map((c) => c._id);

    const trips = await TripModel.find({
      company: { $in: companyIds },
    })
      .populate({
        path: "route",
        populate: { path: "company" },
      })
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    console.error("❌ Error getManageTrips:", error);
    res.status(500).json({
      message: "Error al obtener viajes",
    });
  }
};

/* =========================================================
   LISTAR VIAJES DE UNA EMPRESA ESPECÍFICA (OWNER)
   ========================================================= */
export const getCompanyTrips: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { companyId } = req.params;

    if (!authReq.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    // Validar que la empresa exista y pertenezca al usuario (o sea admin de ella)
    const company = await CompanyModel.findById(companyId);
    if (!company) {
        return res.status(404).json({ message: "Empresa no encontrada" });
    }

    const isOwner = company.owner.toString() === authReq.user.id;
    // const isAdmin = authReq.user.role === 'admin' && authReq.user.companyId === companyId;

    if (!isOwner && authReq.user.role !== 'admin') {
         return res.status(403).json({ message: "No tienes permiso para ver los viajes de esta empresa" });
    }

    const trips = await TripModel.find({ company: companyId })
      .populate({
          path: "route",
          populate: { path: "company" }
      })
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    console.error("❌ Error getCompanyTrips:", error);
    res.status(500).json({
      message: "Error al obtener viajes de la empresa",
    });
  }
};
