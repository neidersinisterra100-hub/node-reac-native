import { TripModel } from "../models/trip.model.js";
import { Types } from "mongoose";

/* =========================================================
   TIPO PLANO (SERVICE → CONTROLLER)
   ========================================================= */
export type TripPlain = {
  _id: Types.ObjectId;
  routeId: Types.ObjectId;
  companyId: Types.ObjectId;
  date: string;
  departureTime: string;
  price: number;
  transportType: string;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
};

/* =========================================================
   PUBLIC TRIPS SERVICE
   ========================================================= */
export async function getPublicTripsService() {
  const trips = await TripModel.find({ isActive: true })
    .populate("routeId")
    .populate("companyId")
    .sort({ createdAt: -1 })
    .lean();

  return trips;
}

/**
 * Viajes públicos:
 * - viaje activo
 * - ruta activa
 * - empresa activa
 */
// export async function getPublicTripsService() {
//   const trips = await TripModel.find({ active: true })
//     .populate({
//       path: "route",
//       match: { active: true },
//       populate: {
//         path: "company",
//         match: { active: true },
//         select: "name active",
//       },
//     })
//     .populate({
//       path: "company",
//       match: { active: true },
//       select: "name active",
//     })
//     .lean(); // ✅ CLAVE

//   /**
//    * 🛡️ Filtro final seguro
//    * Ya NO hay ObjectId aquí
//    */
//   return trips.filter(
//     (trip) =>
//       trip.route !== null &&
//       trip.company !== null
//   );
// }




// import { RouteModel } from "../models/route.model.js";
// import { TripModel } from "../models/trip.model.js";

// type CreateTripInput = {
//   origin: string;
//   destination: string;
//   date: string;
//   departureTime: string;
//   price: number;
//   capacity?: number;
// };

// export async function createTripService(input: CreateTripInput) {
//   const {
//     origin,
//     destination,
//     date,
//     departureTime,
//     price,
//     capacity,
//   } = input;

//   // 1️⃣ Buscar ruta existente
//   let route = await RouteModel.findOne({
//     origin,
//     destination,
//   });

//   // 2️⃣ Crear ruta si no existe
//   if (!route) {
//     route = await RouteModel.create({
//       origin,
//       destination,
//     });
//   }

//   // 3️⃣ Crear viaje
//   const trip = await TripModel.create({
//     route: route._id,
//     date,
//     departureTime,
//     price,
//     capacity,
//   });

//   return trip;
// }
