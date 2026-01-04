import { RequestHandler } from "express";
import { RouteModel } from "../models/route.model.js";
import { TripModel } from "../models/trip.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* ================= LIST TRIPS (PUBLIC) ================= */

export const getTrips: RequestHandler = async (
  _req,
  res
) => {
  try {
    const trips = await TripModel.find()
      .populate("route")
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    console.error("❌ Error getTrips:", error);
    res.status(500).json({
      message: "Error al obtener viajes",
    });
  }
};

/* ================= CREATE TRIP (OWNER ONLY) ================= */

export const createTrip: RequestHandler = async (
  req,
  res
) => {
  try {
    const {
      origin,
      destination,
      date,
      departureTime,
      price,
    } = req.body;

    const authReq = req as AuthRequest;

    /* 🔒 AUTH */
    if (!authReq.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    /* 🔒 ROLE → SOLO OWNER */
    if (authReq.user.role !== "owner") {
      return res.status(403).json({
        message: "Solo los owners pueden crear viajes",
      });
    }

    /* 🔒 VALIDACIÓN */
    if (
      !origin ||
      !destination ||
      !date ||
      !departureTime ||
      !price
    ) {
      return res.status(400).json({
        message: "Datos incompletos",
      });
    }

    /* ================= ROUTE ================= */

    // 1️⃣ buscar ruta
    let route = await RouteModel.findOne({
      origin,
      destination,
    });

    // 2️⃣ crear ruta si no existe
    if (!route) {
      route = await RouteModel.create({
        origin,
        destination,
        createdBy: authReq.user.id, // 👈 dueño de la ruta
      });
    }

    /* ================= TRIP ================= */

    // 3️⃣ crear viaje
    const trip = await TripModel.create({
      route: route._id,
      date,
      departureTime,
      price,
      createdBy: authReq.user.id, // 👈 owner creador
    });

    return res.status(201).json(trip);
  } catch (error) {
    console.error("❌ Error createTrip:", error);
    return res.status(500).json({
      message: "Error al crear viaje",
    });
  }
};



// import { RequestHandler } from "express";
// import { RouteModel } from "../models/route.model.js";
// import { TripModel } from "../models/trip.model.js";
// import { AuthRequest } from "../middlewares/requireAuth.js";

// /* ================= LIST TRIPS (PUBLIC) ================= */

// export const getTrips: RequestHandler = async (
//   _req,
//   res
// ) => {
//   const trips = await TripModel.find()
//     .populate("route")
//     .sort({ createdAt: -1 });

//   res.json(trips);
// };

// /* ================= CREATE TRIP ================= */

// export const createTrip: RequestHandler = async (
//   req,
//   res
// ) => {
//   try {
//     const {
//       origin,
//       destination,
//       date,
//       departureTime,
//       price,
//     } = req.body;

//     const authReq = req as AuthRequest;

//     if (!authReq.user) {
//       return res.status(401).json({
//         message: "No autenticado",
//       });
//     }

//     if (
//       !origin ||
//       !destination ||
//       !date ||
//       !departureTime ||
//       !price
//     ) {
//       return res.status(400).json({
//         message: "Datos incompletos",
//       });
//     }

//     // 1️⃣ buscar ruta
//     let route = await RouteModel.findOne({
//       origin,
//       destination,
//     });

//     // 2️⃣ crear ruta si no existe
//     if (!route) {
//       route = await RouteModel.create({
//         origin,
//         destination,
//       });
//     }

//     // 3️⃣ crear viaje
//     const trip = await TripModel.create({
//       route: route._id,
//       date,
//       departureTime,
//       price,
//       createdBy: authReq.user.id,
//     });

//     return res.status(201).json(trip);
//   } catch (error) {
//     console.error("❌ Error createTrip:", error);
//     return res.status(500).json({
//       message: "Error al crear viaje",
//     });
//   }
// };
