import { api } from "./api";

/* =========================================================
   TIPOS
   ========================================================= */

/**
 * Representa un asiento del viaje
 * El backend decide si está disponible o no
 */
export interface Seat {
  seatNumber: number;
  available: boolean;
  isReservedByMe?: boolean; // 🚀 Nuevo campo
  isSold?: boolean;         // 🚀 Nuevo campo
  isLockedByOther?: boolean; // 🚀 Nuevo campo
  isPayOnBoarding?: boolean; // 🚀 Asiento de reserva pagado al abordar
}

/* =========================================================
   GET SEATS BY TRIP
   ---------------------------------------------------------
   🔓 Público (no requiere auth)
   GET /api/trips/:tripId/seats
   ========================================================= */
export async function getTripSeats(
  tripId: string,
  companyId: string
): Promise<Seat[]> {
  const { data } = await api.get<Seat[]>(
    `/trips/companies/${companyId}/trips/${tripId}/seats`
  );
  return data;
}

/* =========================================================
   RESERVE SEATS (BLOCK)
   ---------------------------------------------------------
   🔐 Requiere auth
   POST /api/seats/reserve
   ========================================================= */
export async function reserveSeat(data: {
  tripId: string;
  seatNumber?: number;
  seatNumbers?: number[];
}) {
  return api.post("/seats/reserve", data);
}

/* =========================================================
   RELEASE SEATS (UNBLOCK)
   ---------------------------------------------------------
   🔐 Requiere auth
   POST /api/seats/release
   ========================================================= */
export async function releaseSeat(data: {
  tripId: string;
  seatNumber?: number;
  seatNumbers?: number[];
}) {
  return api.post("/seats/release", data);
}

/* =========================================================
   CLEAR TRIP LOCKS (UNBLOCK ALL)
   ---------------------------------------------------------
   🔐 Requiere auth (Admin)
   POST /api/seats/clear-trip-locks
   ========================================================= */
export async function clearTripLocks(tripId: string) {
  return api.post("/seats/clear-trip-locks", { tripId });
}
