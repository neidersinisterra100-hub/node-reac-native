import { RequestHandler } from "express";
import { RouteModel } from "../models/route.model.js";
import { TripModel } from "../models/trip.model.js";
import { AuthRequest } from "../middlewares/requireAuth.js";

/* ================= LIST TRIPS (PUBLIC) ================= */

export const getTrips: RequestHandler = async (
  _req,
  res
) => {
  const trips = await TripModel.find()
    .populate("route")
    .sort({ createdAt: -1 });

  res.json(trips);
};

/* ================= CREATE TRIP ================= */

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

    if (!authReq.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

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
      });
    }

    // 3️⃣ crear viaje
    const trip = await TripModel.create({
      route: route._id,
      date,
      departureTime,
      price,
      createdBy: authReq.user.id,
    });

    return res.status(201).json(trip);
  } catch (error) {
    console.error("❌ Error createTrip:", error);
    return res.status(500).json({
      message: "Error al crear viaje",
    });
  }
};


// import { Request, Response } from "express";
// import { RouteModel } from "../models/route.model.js";
// import { TripModel } from "../models/trip.model.js";

// /**
//  * Crear viaje
//  * - Crea la ruta si no existe
//  * - Crea el viaje asociado a la ruta
//  */
// export const createTrip = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const {
//       origin,
//       destination,
//       date,
//       departureTime,
//       price,
//     }: {
//       origin: string;
//       destination: string;
//       date: string;
//       departureTime: string;
//       price: number;
//     } = req.body;

//     // 1️⃣ Buscar ruta
//     let route = await RouteModel.findOne({
//       origin,
//       destination,
//     });

//     // 2️⃣ Crear ruta si no existe
//     if (!route) {
//       route = await RouteModel.create({
//         origin,
//         destination,
//       });
//     }

//     // 3️⃣ Crear viaje
//     const trip = await TripModel.create({
//       route: route._id,
//       date,
//       departureTime,
//       price,
//     });

//     res.status(201).json(trip);
//   } catch (error) {
//     res.status(500).json({
//       message: "ERROR_CREATE_TRIP",
//     });
//   }
// };

// export const getTrips = async (
//   _req: Request,
//   res: Response
// ) => {
//   try {
//     const trips = await TripModel.find()
//       .populate("route")
//       .sort({ date: 1, departureTime: 1 });

//     res.json(trips);
//   } catch (error) {
//     res.status(500).json({
//       message: "ERROR_GET_TRIPS",
//     });
//   }
// };
