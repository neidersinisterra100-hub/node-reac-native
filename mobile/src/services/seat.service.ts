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
}

/* =========================================================
   GET SEATS BY TRIP
   ---------------------------------------------------------
   🔓 Público (no requiere auth)
   GET /api/trips/:tripId/seats
   ========================================================= */
export async function getTripSeats(
  tripId: string
): Promise<Seat[]> {
  const { data } = await api.get<Seat[]>(
    `/trips/${tripId}/seats`
  );
  return data;
}

/* =========================================================
   RESERVE SEAT (BLOCK)
   ---------------------------------------------------------
   🔐 Requiere auth
   POST /api/seats/reserve
   ========================================================= */
export async function reserveSeat(data: {
  tripId: string;
  seatNumber: number;
}) {
  return api.post("/seats/reserve", data);
}

/* =========================================================
   RELEASE SEAT (UNBLOCK)
   ---------------------------------------------------------
   🔐 Requiere auth
   POST /api/seats/release
   ---------------------------------------------------------
   Se llama cuando:
   - usuario cancela
   - goBack
   - logout
   - app va a background
   ========================================================= */
export async function releaseSeat(data: {
  tripId: string;
  seatNumber: number;
}) {
  return api.post("/seats/release", data);
}
