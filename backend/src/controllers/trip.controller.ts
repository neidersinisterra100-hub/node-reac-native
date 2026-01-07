import { RequestHandler } from "express";
import { TripModel } from "../models/trip.model.js";
import { RouteModel } from "../models/route.model.js";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* ... existing code ... */

/* ================= LIST TRIPS (PUBLIC) ================= */
export const getTrips: RequestHandler = async (_req, res) => {
  try {
    const trips = await TripModel.find({ active: true })
      .populate({
        path: "route",
        match: { active: true },
        populate: { path: "company" },
      })
      .sort({ createdAt: -1 });

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
export const createTrip: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    if (authReq.user.role !== "owner") {
      return res.status(403).json({
        message: "Solo los owners pueden crear viajes",
      });
    }

    // ACEPTAMOS transportType del body
    const { routeId, date, departureTime, price, transportType } = req.body;

    if (!routeId || !date || !departureTime || price == null) {
      return res.status(400).json({
        message:
          "routeId, date, departureTime y price son obligatorios",
      });
    }

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

    const trip = await TripModel.create({
      route: route._id,
      company: company._id,
      createdBy: authReq.user.id,
      date,
      departureTime,
      price,
      transportType: transportType || 'Lancha', // Valor por defecto si no viene
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

/* ================= DELETE TRIP (OWNER ONLY) ================= */
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
  
      // Solo el owner puede eliminar
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
