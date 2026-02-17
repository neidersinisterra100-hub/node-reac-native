/* =========================================================
   DOMAIN TYPES — TRIP (UI GLOBAL)
   ========================================================= */

/**
 * Ruta asociada a un viaje
 * Puede venir populada o como string (_id)
 */
export interface TripRoute {
  _id?: string;
  id?: string;
  origin: string;
  destination: string;
}

/**
 * Empresa asociada a un viaje
 */
export interface TripCompany {
  _id?: string;
  id?: string;
  name: string;
}

/**
 * Tipos de transporte válidos
 * ⚠️ deben coincidir con backend
 */
export type TransportType =
  | "lancha"
  | "lancha rapida";

/**
 * Trip — MODELO GLOBAL
 */
export interface Trip {
  _id?: string;
  id: string;

  route: TripRoute | string;
  company: TripCompany | string;

  date: string;           // YYYY-MM-DD
  departureTime: string;  // HH:mm
  price: number;

  capacity: number;       // total
  soldSeats?: number;     // 👈 backend (opcional)

  transportType: TransportType;
  isActive: boolean;
}



// export type TransportType =
//   | "lancha"
//   | "lancha rapida";

// export interface TripRoute {
//   _id?: string;
//   id?: string;
//   origin: string;
//   destination: string;
// }

// export interface TripCompany {
//   _id?: string;
//   id?: string;
//   name: string;
// }

// export interface Trip {
//   _id?: string;
//   id: string;
//   route: TripRoute | string;
//   company: TripCompany | string;
//   date: string;          // YYYY-MM-DD
//   departureTime: string; // HH:mm
//   price: number;
//   capacity: number;
//   transportType: TransportType;
//   isActive: boolean;
// }
