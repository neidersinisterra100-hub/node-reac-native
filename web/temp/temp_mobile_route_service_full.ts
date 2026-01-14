import { api } from "./api";

/* ================= TYPES ================= */

export interface Route {
  _id: string;
  origin: string;
  destination: string;
  company: string | { _id: string; name: string }; // Puede ser ID o objeto poblado
  active: boolean;
}

/* ================= GET ALL ROUTES (HYBRID) ================= */
export async function getAllRoutes() {
  try {
    let companies: any[] = [];
    
    // 1. Intentar obtener empresas (Owner/Admin)
    try {
      const res = await api.get('/companies/my');
      companies = res.data;
    } catch {
      // 2. Si falla, intentar públicas (User)
      try {
        const res = await api.get('/companies');
        companies = res.data;
      } catch (e) { console.log("Error fetching companies", e); }
    }

    if (!companies || companies.length === 0) return [];

    // 3. Obtener rutas de cada empresa
    const promises = companies.map((c: any) => 
      api.get(`/routes/company/${c._id}`)
         .then(res => res.data.map((r: any) => ({...r, company: c}))) // Inyectar empresa
         .catch(() => [])
    );

    const results = await Promise.all(promises);
    return results.flat() as Route[];
  } catch (error) {
    console.error("Error in getAllRoutes:", error);
    return [];
  }
}

/* ================= GET ROUTES BY COMPANY ================= */

export async function getCompanyRoutes(companyId: string) {
  const response = await api.get(`/routes/company/${companyId}`);
  return response.data as Route[];
}

/* ================= CREATE ROUTE ================= */

export async function createRoute(data: {
  origin: string;
  destination: string;
  companyId: string;
}) {
  const response = await api.post("/routes", data);
  return response.data as Route;
}

/* ================= TOGGLE ROUTE ACTIVE ================= */

export async function toggleRouteActive(routeId: string) {
  const response = await api.patch(`/routes/${routeId}`);
  return response.data as Route;
}

/* ================= DELETE ROUTE ================= */

export async function deleteRoute(routeId: string) {
  const response = await api.delete(`/routes/${routeId}`);
  return response.data;
}

// Objeto compatibilidad si algún archivo viejo lo usa
export const routeService = {
  getAll: getAllRoutes,
  getCompanyRoutes,
  create: createRoute,
  toggleActive: toggleRouteActive,
  delete: deleteRoute
};
