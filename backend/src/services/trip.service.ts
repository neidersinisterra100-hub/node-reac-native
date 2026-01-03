import { RouteModel } from "../models/route.model.js";
import { TripModel } from "../models/trip.model.js";

type CreateTripInput = {
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  price: number;
  capacity?: number;
};

export async function createTripService(input: CreateTripInput) {
  const {
    origin,
    destination,
    date,
    departureTime,
    price,
    capacity,
  } = input;

  // 1️⃣ Buscar ruta existente
  let route = await RouteModel.findOne({
    origin,
    destination,
  });

  // 2️⃣ Crear ruta si no existe
  if (!route) {
    route = await RouteModel.create({
      origin,
      destination,
    });
  }

  // 3️⃣ Crear viaje
  const trip = await TripModel.create({
    route: route._id,
    date,
    departureTime,
    price,
    capacity,
  });

  return trip;
}
