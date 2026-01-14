import { api } from "./api";
import { loadSession } from "../utils/authStorage";

/* ================= TYPES ================= */

export interface Route {
  _id: string;
  origin: string;
  destination: string;
  company: string | { _id: string; name: string }; 
  active: boolean;
}

/* ================= GET ALL ROUTES (SMART) ================= */
export async function getAllRoutes() {
  try {
    const session = await loadSession();
    const isOwner = session?.user?.role === 'owner' || session?.user?.role === 'admin';
    
    let companies: any[] = [];
    
    // 1. Si es Owner, intentamos obtener sus empresas primero
    if (isOwner) {
        try {
          const res = await api.get('/companies/my');
          companies = res.data;
        } catch (e) {
            console.warn("Fallo al cargar mis empresas, intentando públicas...");
        }
    }

    // 2. Si no es Owner o no se encontraron empresas propias, buscamos públicas
    if (!companies || companies.length === 0) {
        try {
            const res = await api.get('/companies');
            companies = res.data;
        } catch (e) { 
            console.log("Error fetching public companies, trying /routes direct...");
            // PLAN B: Intentar obtener rutas directamente si /companies falla
            try {
                const resRoutes = await api.get('/routes');
                return resRoutes.data as Route[];
            } catch (errRoutes) {
                console.log("Error fetching /routes direct", errRoutes);
                return [];
            }
        }
    }

    if (!companies || companies.length === 0) return [];

    // 3. Obtener rutas de cada empresa
    const promises = companies.map((c: any) => 
      api.get(`/routes/company/${c._id}`)
         .then(res => res.data.map((r: any) => ({...r, company: c}))) 
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
