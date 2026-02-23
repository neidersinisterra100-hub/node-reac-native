import { api } from "./api";

/* =========================================================
   DOMAIN TYPES — TRIPS
   ========================================================= */

/**
 * Route (puede venir como ID o como objeto poblado)
 */
export interface Route {
  id?: string;
  _id?: string;
  origin: string;
  destination: string;
}

/**
 * Company (puede venir como ID o como objeto poblado)
 */
export interface Company {
  id?: string;
  _id?: string;
  name: string;
}

/**
 * Tipos de transporte válidos
 * ⚠️ Deben coincidir con backend (Zod + enums)
 */
export type TransportType =
  | "lancha"
  | "lancha rapida";

/**
 * Trip
 *
 * Nota:
 * - route / company pueden venir como string o como objeto
 * - capacity es la capacidad TOTAL (no asientos disponibles)
 */
export interface Trip {
  id: string;
  _id?: string;

  route: Route | string;
  company: Company | string;

  date: string;           // YYYY-MM-DD
  departureTime: string;  // HH:mm
  price: number;
  capacity: number;
  soldSeats?: number;
  transportType: TransportType;
  isActive: boolean;
  municipioId?: string;
  cityId?: string;
}

/* =========================================================
   GET TRIPS
   ---------------------------------------------------------
   Regla:
   - Owner / Admin → /trips/manage (solo sus empresas)
   - Usuario público → /trips (solo activos)
   
   El frontend NO decide permisos.
   El backend decide qué endpoint responde.
   ========================================================= */

export async function getTrips(companyId?: string): Promise<Trip[]> {
  try {
    if (companyId) {
      const { data } = await api.get<Trip[]>(
        `/trips/companies/${companyId}/trips/manage`
      );
      return data;
    }

    // Si no hay companyId, intentar endpoint público o manejar según lógica de negocio
    const { data } = await api.get<Trip[]>("/trips");
    return data;
  } catch (error: any) {
    if (
      error?.response?.status === 401 ||
      error?.response?.status === 403
    ) {
      const { data } = await api.get<Trip[]>("/trips");
      return data;
    }
    // Fallback
    const { data } = await api.get<Trip[]>("/trips");
    return data;
  }
}

// export async function getTrips(): Promise<Trip[]> {
//   try {
//     // 🔐 Intentar endpoint privado (owners/admins)
//     const { data } = await api.get<Trip[]>("/trips/manage");
//     return data;
//   } catch (error: any) {
//     // 🚫 Si no tiene permisos → usar endpoint público
//     if (
//       error?.response?.status === 401 ||
//       error?.response?.status === 403
//     ) {
//       const { data } = await api.get<Trip[]>("/trips");
//       return data;
//     }

//     // 🛟 Fallback defensivo
//     const { data } = await api.get<Trip[]>("/trips");
//     return data;
//   }
// }

/* =========================================================
   CREATE TRIP
   ---------------------------------------------------------
   - Solo owner (validado en backend)
   - capacity es obligatoria
   - NO se envían companyId ni cityId
   ========================================================= */

export async function createTrip(data: {
  routeId: string;
  date: string;           // YYYY-MM-DD
  departureTime: string;  // HH:mm
  price: number;
  capacity: number;
  transportType: TransportType;
}): Promise<Trip> {
  const { data: trip } = await api.post<Trip>(
    "/trips",
    data
  );
  return trip;
}

/* =========================================================
   DELETE TRIP
   ---------------------------------------------------------
   - Solo owner
   ========================================================= */

export async function deleteTrip(tripId: string, companyId: string): Promise<void> {
  await api.delete(`/trips/companies/${companyId}/trips/${tripId}`);
}

/* =========================================================
   TOGGLE TRIP ACTIVE
   ---------------------------------------------------------
   ⚠️ IMPORTANTE:
   - El backend hace toggle automático
   - NO se envía payload
   ========================================================= */

export async function toggleTripActive(tripId: string, companyId: string): Promise<void> {
  await api.patch(`/trips/companies/${companyId}/trips/${tripId}`);
}

/* =========================================================
   COMPAT / EXPORT AGRUPADO
   ========================================================= */

export const tripService = {
  getAll: getTrips,
  create: createTrip,
  delete: deleteTrip,
  toggleActive: toggleTripActive,
};
