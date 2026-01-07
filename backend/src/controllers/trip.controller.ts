import { RequestHandler } from "express";
import { TripModel } from "../models/trip.model.js";
import { RouteModel } from "../models/route.model.js";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* ================= LIST TRIPS (PUBLIC) ================= */
/**
 * Solo muestra viajes:
 * - activos
 * - cuya ruta esté activa
 */
export const getTrips: RequestHandler = async (_req, res) => {
  try {
    const trips = await TripModel.find({ active: true })
      .populate({
        path: "route",
        match: { active: true }, // 👈 solo rutas activas
        populate: { path: "company" },
      })
      .sort({ createdAt: -1 });

    // cuando usamos match, los que no cumplen quedan con route = null
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

/* ================= CREATE TRIP (OWNER ONLY) ================= */
/**
 * body:
 * {
 *   routeId: string,
 *   date: "YYYY-MM-DD",
 *   departureTime: "HH:mm",
 *   price: number
 * }
 */
export const createTrip: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    /* 🔒 AUTH */
    if (!authReq.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    /* 🔒 ROLE */
    if (authReq.user.role !== "owner") {
      return res.status(403).json({
        message: "Solo los owners pueden crear viajes",
      });
    }

    const { routeId, date, departureTime, price } = req.body;

    /* 🔒 VALIDACIÓN */
    if (!routeId || !date || !departureTime || price == null) {
      return res.status(400).json({
        message:
          "routeId, date, departureTime y price son obligatorios",
      });
    }

    /* ================= ROUTE ================= */

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

    /* ================= COMPANY ================= */

    const company = await CompanyModel.findById(route.company);

    if (!company) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    /* 🔒 OWNER DE LA EMPRESA */
    if (company.owner.toString() !== authReq.user.id) {
      return res.status(403).json({
        message: "No eres owner de esta empresa",
      });
    }

    /* ================= CREATE TRIP ================= */

    const trip = await TripModel.create({
      route: route._id,
      company: company._id,        // ✅ obligatorio
      createdBy: authReq.user.id,  // ✅ obligatorio
      date,
      departureTime,
      price,
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

/* ================= TOGGLE TRIP ACTIVE (OWNER & ADMIN) ================= */

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
      const userRole = authReq.user.role.toLowerCase();
  
      // Permitir si es Admin O si es el Owner de la empresa asociada al viaje
      const isOwner = company.owner.toString() === authReq.user.id;
      const isAdmin = userRole === "admin";
  
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
