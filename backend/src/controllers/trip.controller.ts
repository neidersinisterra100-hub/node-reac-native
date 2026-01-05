import { RequestHandler } from "express";
import { RouteModel } from "../models/route.model.js";
import { TripModel } from "../models/trip.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";
import { Types } from "mongoose";

/* ================= LIST TRIPS (PUBLIC) ================= */
/**
 * 🔓 Público
 * ✅ Solo rutas activas
 * ✅ Con empresa
 */
export const getTrips: RequestHandler = async (
  _req,
  res
) => {
  try {
    const trips = await TripModel.find()
      .populate({
        path: "route",
        match: { active: true }, // 👈 CLAVE
        populate: { path: "company" },
      })
      .sort({ createdAt: -1 });

    // ⚠️ populate + match deja null las rutas no activas
    const activeTrips = trips.filter(
      (trip) => trip.route !== null
    );

    res.json(activeTrips);
  } catch (error) {
    console.error("❌ Error getTrips:", error);
    res.status(500).json({
      message: "Error al obtener viajes",
    });
  }
};

/* ================= LIST TRIPS (PUBLIC) ================= */
/**
 * Devuelve SOLO viajes activos
 * con su ruta y empresa
 */
// export const getTrips: RequestHandler = async (
//   _req,
//   res
// ) => {
//   try {
//     const trips = await TripModel.find({
//       active: true, // 👈 SOLO VIAJES ACTIVOS
//     })
//       .populate({
//         path: "route",
//         match: { active: true }, // 👈 SOLO RUTAS ACTIVAS
//         populate: {
//           path: "company",
//           match: { active: true }, // 👈 SOLO EMPRESAS ACTIVAS
//         },
//       })
//       .sort({ createdAt: -1 });

//     // 🔒 Limpia viajes cuya ruta fue filtrada por inactive
//     const filteredTrips = trips.filter(
//       (trip) => trip.route !== null
//     );

//     res.json(filteredTrips);
//   } catch (error) {
//     console.error("❌ Error getTrips:", error);
//     res.status(500).json({
//       message: "Error al obtener viajes",
//     });
//   }
// };

/* ================= CREATE TRIP (OWNER ONLY) ================= */

export const createTrip: RequestHandler = async (
  req,
  res
) => {
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

    const {
      routeId,
      date,
      departureTime,
      price,
      capacity,
    } = req.body;

    /* 🔒 VALIDACIÓN */
    if (
      !routeId ||
      !date ||
      !departureTime ||
      typeof price !== "number"
    ) {
      return res.status(400).json({
        message:
          "routeId, date, departureTime y price son obligatorios",
      });
    }

    /* ================= ROUTE ================= */

    const route = await RouteModel.findById(routeId).populate(
      "company"
    );

    if (!route) {
      return res.status(404).json({
        message: "Ruta no encontrada",
      });
    }

    /* ================= COMPANY (CAST SEGURO) ================= */

    const company = route.company as {
      _id: Types.ObjectId;
      owner: Types.ObjectId;
    };

    if (!company || !company.owner) {
      return res.status(500).json({
        message: "Ruta sin empresa válida",
      });
    }

    /* 🔒 OWNER DE LA EMPRESA */
    if (company.owner.toString() !== authReq.user.id) {
      return res.status(403).json({
        message:
          "No eres owner de la empresa de esta ruta",
      });
    }

    /* ================= TRIP ================= */

    const trip = await TripModel.create({
      route: route._id,
      date,
      departureTime,
      price,
      capacity: capacity ?? 20,
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
//   try {
//     const trips = await TripModel.find()
//       .populate("route")
//       .sort({ createdAt: -1 });

//     res.json(trips);
//   } catch (error) {
//     console.error("❌ Error getTrips:", error);
//     res.status(500).json({
//       message: "Error al obtener viajes",
//     });
//   }
// };

// /* ================= CREATE TRIP (OWNER ONLY) ================= */

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

//     /* 🔒 AUTH */
//     if (!authReq.user) {
//       return res.status(401).json({
//         message: "No autenticado",
//       });
//     }

//     /* 🔒 ROLE → SOLO OWNER (normalizado) */
//     if (authReq.user.role.toLowerCase() !== "owner") {
//       return res.status(403).json({
//         message: "Solo los owners pueden crear viajes",
//       });
//     }

//     /* 🔒 VALIDACIÓN */
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

//     /* ================= ROUTE ================= */

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
//         createdBy: authReq.user.id, // 👈 owner creador
//       });
//     }

//     /* ================= TRIP ================= */

//     // 3️⃣ crear viaje
//     const trip = await TripModel.create({
//       route: route._id,
//       date,
//       departureTime,
//       price,
//       createdBy: authReq.user.id, // 👈 owner creador
//     });

//     return res.status(201).json(trip);
//   } catch (error) {
//     console.error("❌ Error createTrip:", error);
//     return res.status(500).json({
//       message: "Error al crear viaje",
//     });
//   }
// };



// import { RequestHandler } from "express";
// import { RouteModel } from "../models/route.model.js";
// import { TripModel } from "../models/trip.model.js";
// import { AuthRequest } from "../middlewares/requireAuth.js";

// /* ================= LIST TRIPS (PUBLIC) ================= */

// export const getTrips: RequestHandler = async (
//   _req,
//   res
// ) => {
//   try {
//     const trips = await TripModel.find()
//       .populate("route")
//       .sort({ createdAt: -1 });

//     res.json(trips);
//   } catch (error) {
//     console.error("❌ Error getTrips:", error);
//     res.status(500).json({
//       message: "Error al obtener viajes",
//     });
//   }
// };

// /* ================= CREATE TRIP (OWNER ONLY) ================= */

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

//     /* 🔒 AUTH */
//     if (!authReq.user) {
//       return res.status(401).json({
//         message: "No autenticado",
//       });
//     }

//     /* 🔒 ROLE → SOLO OWNER */
//     if (authReq.user.role !== "owner") {
//       return res.status(403).json({
//         message: "Solo los owners pueden crear viajes",
//       });
//     }

//     /* 🔒 VALIDACIÓN */
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

//     /* ================= ROUTE ================= */

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
//         createdBy: authReq.user.id, // 👈 dueño de la ruta
//       });
//     }

//     /* ================= TRIP ================= */

//     // 3️⃣ crear viaje
//     const trip = await TripModel.create({
//       route: route._id,
//       date,
//       departureTime,
//       price,
//       createdBy: authReq.user.id, // 👈 owner creador
//     });

//     return res.status(201).json(trip);
//   } catch (error) {
//     console.error("❌ Error createTrip:", error);
//     return res.status(500).json({
//       message: "Error al crear viaje",
//     });
//   }
// };


