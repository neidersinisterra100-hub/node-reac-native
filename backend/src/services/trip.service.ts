import { TripModel } from "../models/trip.model.js";
import { Types } from "mongoose";

/* =========================================================
   TIPO PLANO (SERVICE → CONTROLLER)
   ========================================================= */
export type TripPlain = {
  _id: Types.ObjectId;
  routeId: Types.ObjectId | any;
  companyId: Types.ObjectId | any;
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
import { RouteModel } from "../models/route.model.js";
import { CompanyModel } from "../models/company.model.js";

/* =========================================================
   PUBLIC TRIPS SERVICE
   ========================================================= */
export async function getPublicTripsService() {
  const trips = await TripModel.find({ isActive: true })
    .populate({ path: "routeId", model: RouteModel })
    .populate({ path: "companyId", model: CompanyModel })
    .sort({ createdAt: -1 })
    .lean();

  /**
   * 🛡️ Filtro Robusto (Defensive Programming)
   * 
   * Aunque la base de datos debería tener la cascada aplicada,
   * este filtro asegura que NUNCA se muestren viajes si:
   * 1. La empresa está inactiva (company.isActive === false)
   * 2. La ruta está inactiva (route.isActive === false)
   * 3. La población falló (routeId o companyId son null)
   */
  const validTrips = trips.filter((trip: any) => {
    // 1. Verificar existencia de padres
    if (!trip.routeId || !trip.companyId) {
      return false;
    }

    // 🛡️ Verificar que la población fue exitosa (que sea un objeto completo)
    if (!trip.routeId.origin || !trip.companyId.name) {
      return false; // Si solo tenemos el ID (string/ObjectId), filtrarlo
    }

    // 2. Verificar estado de la Empresa
    // Nota: dependemos de que company.isActive esté populado
    if (trip.companyId.isActive === false) {
      return false;
    }

    // 3. Verificar estado de la Ruta
    if (trip.routeId.isActive === false) {
      return false;
    }

    return true;
  });

  return validTrips;
}

/**
 * Viajes públicos Legacy (Referencia)
 */
// export async function getPublicTripsService() { ..._old_impl }
