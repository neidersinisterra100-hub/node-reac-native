import { api } from "./api";
import { loadSession } from "../utils/authStorage";
import { Company } from "./company.service";

/* ================= TYPES ================= */

export interface Route {
  id: string;
  _id?: string;
  origin: string;
  destination: string;
  company: string | { id?: string; _id?: string; name: string };
  active?: boolean;
  isActive?: boolean;
}

/* ================= GET ALL ROUTES ================= */
/**
 * Reglas:
 * - Owner/Admin → solo rutas de SUS empresas
 * - Usuario/Público → rutas públicas
 */
export async function getAllRoutes(): Promise<Route[]> {
  try {
    const session = await loadSession();
    const role = session?.user?.role;
    const isPrivileged = role === "owner" || role === "admin";

    /* =================================================
       OWNER / ADMIN → rutas de sus empresas
       ================================================= */
    if (isPrivileged) {
      try {
        const { data: companies } = await api.get<Company[]>(
          "/companies/my"
        );

        if (!companies.length) {
          console.warn(
            "⚠️ [ROUTES] Usuario sin empresas asignadas"
          );
          return [];
        }

        const routesByCompany = await Promise.all(
          companies.map((company) => {
            const coId = company.id || company._id; // ✅ FIX: Handle both
            return api
              .get<Route[]>(
                `/routes/company/${coId}`
              )
              .then((res) => res.data)
              .catch(() => []);
          })
        );

        const allRoutes = routesByCompany.flat();

        // Deduplicación por seguridad
        return Array.from(
          new Map(allRoutes.map((r) => [r.id || r._id, r]))
            .values()
        );
      } catch (err) {
        console.warn(
          "⚠️ [ROUTES] No se pudieron cargar rutas privadas, fallback a públicas"
        );
      }
    }

    /* =================================================
       USUARIO / PÚBLICO → rutas públicas
       ================================================= */
    const { data } = await api.get<Route[]>("/routes");
    return data;
  } catch (error) {
    console.error(
      "❌ [ROUTES] Error en getAllRoutes",
      error
    );
    return [];
  }
}

/* ================= GET ROUTES BY COMPANY ================= */
/**
 * Backend ya valida permisos
 */
export async function getCompanyRoutes(
  companyId: string
): Promise<Route[]> {
  const { data } = await api.get<Route[]>(
    `/routes/company/${companyId}`
  );
  return data;
}

/* ================= CREATE ROUTE ================= */

export async function createRoute(data: {
  origin: string;
  destination: string;
  companyId: string;
}): Promise<Route> {
  const res = await api.post<Route>("/routes", data);
  return res.data;
}

/* ================= TOGGLE ROUTE ACTIVE ================= */

export async function toggleRouteActive(
  routeId: string
): Promise<Route> {
  const res = await api.patch<Route>(
    `/routes/${routeId}`
  );
  return res.data;
}

/* ================= DELETE ROUTE ================= */

export async function deleteRoute(
  routeId: string
): Promise<void> {
  await api.delete(`/routes/${routeId}`);
}

/* ================= COMPAT ================= */

export const routeService = {
  getAll: getAllRoutes,
  getCompanyRoutes,
  create: createRoute,
  toggleActive: toggleRouteActive,
  delete: deleteRoute,
};





