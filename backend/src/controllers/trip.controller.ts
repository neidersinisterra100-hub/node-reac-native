import { RequestHandler } from "express";
import { TripModel } from "../models/trip.model.js";
import { RouteModel } from "../models/route.model.js";
import { CompanyModel } from "../models/company.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* ================= LIST TRIPS (PUBLIC) ================= */
/**
 * Solo muestra viajes:
 * - cuya ruta esté activa
 * - y cuya empresa esté activa (si luego agregas ese flag)
 */
export const getTrips: RequestHandler = async (_req, res) => {
  try {
    const trips = await TripModel.find()
      .populate({
        path: "route",
        match: { active: true }, // 👈 solo rutas activas
        populate: { path: "company" },
      })
      .sort({ createdAt: -1 });

    // ⚠️ Cuando usas match, los que no cumplen quedan con route = null
    const filtered = trips.filter((t) => t.route);

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
 * Crea un viaje SOBRE UNA RUTA EXISTENTE
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
      date,
      departureTime,
      price,
    });

    return res.status(201).json(trip);
  } catch (error) {
    console.error("❌ Error createTrip:", error);
    return res.status(500).json({
      message: "Error al crear el viaje",
    });
  }
};



// import { RequestHandler } from "express";
// import { RouteModel } from "../models/route.model.js";
// import { TripModel } from "../models/trip.model.js";
// import { AuthRequest } from "../middlewares/requireAuth.js";
// import { Types } from "mongoose";

// /* ================= LIST TRIPS (PUBLIC) ================= */
// /**
//  * 🔓 Público
//  * ✅ Solo rutas activas
//  * ✅ Con empresa
//  */
// export const getTrips: RequestHandler = async (
//   _req,
//   res
// ) => {
//   try {
//     const trips = await TripModel.find()
//       .populate({
//         path: "route",
//         match: { active: true }, // 👈 CLAVE
//         populate: { path: "company" },
//       })
//       .sort({ createdAt: -1 });

//     // ⚠️ populate + match deja null las rutas no activas
//     const activeTrips = trips.filter(
//       (trip) => trip.route !== null
//     );

//     res.json(activeTrips);
//   } catch (error) {
//     console.error("❌ Error getTrips:", error);
//     res.status(500).json({
//       message: "Error al obtener viajes",
//     });
//   }
// };

// /* ================= LIST TRIPS (PUBLIC) ================= */
// /**
//  * Devuelve SOLO viajes activos
//  * con su ruta y empresa
//  */
// // export const getTrips: RequestHandler = async (
// //   _req,
// //   res
// // ) => {
// //   try {
// //     const trips = await TripModel.find({
// //       active: true, // 👈 SOLO VIAJES ACTIVOS
// //     })
// //       .populate({
// //         path: "route",
// //         match: { active: true }, // 👈 SOLO RUTAS ACTIVAS
// //         populate: {
// //           path: "company",
// //           match: { active: true }, // 👈 SOLO EMPRESAS ACTIVAS
// //         },
// //       })
// //       .sort({ createdAt: -1 });

// //     // 🔒 Limpia viajes cuya ruta fue filtrada por inactive
// //     const filteredTrips = trips.filter(
// //       (trip) => trip.route !== null
// //     );

// //     res.json(filteredTrips);
// //   } catch (error) {
// //     console.error("❌ Error getTrips:", error);
// //     res.status(500).json({
// //       message: "Error al obtener viajes",
// //     });
// //   }
// // };

// /* ================= CREATE TRIP (OWNER ONLY) ================= */

// export const createTrip: RequestHandler = async (
//   req,
//   res
// ) => {
//   try {
//     const authReq = req as AuthRequest;

//     /* 🔒 AUTH */
//     if (!authReq.user) {
//       return res.status(401).json({
//         message: "No autenticado",
//       });
//     }

//     /* 🔒 ROLE */
//     if (authReq.user.role !== "owner") {
//       return res.status(403).json({
//         message: "Solo los owners pueden crear viajes",
//       });
//     }

//     const {
//       routeId,
//       date,
//       departureTime,
//       price,
//       capacity,
//     } = req.body;

//     /* 🔒 VALIDACIÓN */
//     if (
//       !routeId ||
//       !date ||
//       !departureTime ||
//       typeof price !== "number"
//     ) {
//       return res.status(400).json({
//         message:
//           "routeId, date, departureTime y price son obligatorios",
//       });
//     }

//     /* ================= ROUTE ================= */

//     const route = await RouteModel.findById(routeId).populate(
//       "company"
//     );

//     if (!route) {
//       return res.status(404).json({
//         message: "Ruta no encontrada",
//       });
//     }

//     /* ================= COMPANY (CAST SEGURO) ================= */

//     const company = route.company as {
//       _id: Types.ObjectId;
//       owner: Types.ObjectId;
//     };

//     if (!company || !company.owner) {
//       return res.status(500).json({
//         message: "Ruta sin empresa válida",
//       });
//     }

//     /* 🔒 OWNER DE LA EMPRESA */
//     if (company.owner.toString() !== authReq.user.id) {
//       return res.status(403).json({
//         message:
//           "No eres owner de la empresa de esta ruta",
//       });
//     }

//     /* ================= TRIP ================= */

//     const trip = await TripModel.create({
//       route: route._id,
//       date,
//       departureTime,
//       price,
//       capacity: capacity ?? 20,
//     });

//     return res.status(201).json(trip);
//   } catch (error) {
//     console.error("❌ Error createTrip:", error);
//     return res.status(500).json({
//       message: "Error al crear viaje",
//     });
//   }
// };
