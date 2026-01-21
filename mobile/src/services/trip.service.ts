import { api } from "./api";

/* ================= TYPES ================= */

/**
 * Trip
 *
 * ⚠️ Nota:
 * - availableSeats NO viene del backend aún
 * - capacity SÍ existe y debe enviarse al crear
 */
export interface Trip {
  id: string;
  _id?: string;

  route:
  | string
  | {
    id?: string;
    _id?: string;
    origin: string;
    destination: string;
  };

  company:
  | string
  | {
    id?: string;
    _id?: string;
    name: string;
  };

  date: string;
  departureTime: string;
  price: number;
  capacity: number; // 🔑 CLAVE
  transportType: string;
  isActive: boolean;
}

/* ================= GET TRIPS ================= */
/**
 * Reglas:
 * - Owner / admin → /trips/manage (SOLO sus empresas)
 * - Usuario / público → /trips (solo activos)
 *
 * 🔐 El backend decide qué devolver
 */
export async function getTrips(): Promise<Trip[]> {
  try {
    const { data } = await api.get<Trip[]>("/trips/manage");
    return data;
  } catch {
    const { data } = await api.get<Trip[]>("/trips");
    return data;
  }
}

/* ================= CREATE TRIP ================= */
/**
 * Solo owner (validado en backend)
 *
 * ⚠️ capacity es OBLIGATORIO
 * Si falta → backend responde 400 (correcto)
 */
// export async function createTrip(data: {
//   routeId: string;
//   date: string;
//   departureTime: string;
//   price: number;
//   capacity: number;
//   transportType: string;
// }) {
//   const { data: trip } = await api.post("/trips", data);
//   return trip;
// }

export async function createTrip(data: {
  routeId: string;
  date: string;
  departureTime: string;
  price: number;
  capacity: number; // 🔑 CLAVE
  transportType: string;
}): Promise<Trip> {
  const { data: trip } = await api.post<Trip>(
    "/trips",
    data
  );
  return trip;
}

/* ================= DELETE TRIP ================= */
/**
 * Solo owner (validado en backend)
 */
export async function deleteTrip(
  tripId: string
): Promise<void> {
  await api.delete(`/trips/${tripId}`);
}

/* ================= TOGGLE ACTIVE ================= */
export async function toggleTripActive(tripId: string, isActive: boolean): Promise<void> {
  await api.patch(`/trips/${tripId}`, { isActive });
}

/* ================= COMPAT ================= */

export const tripService = {
  getAll: getTrips,
  create: createTrip,
  delete: deleteTrip,
  toggleActive: toggleTripActive,
};
