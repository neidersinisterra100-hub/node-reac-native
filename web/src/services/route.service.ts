import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { Company } from './company.service';

export interface Route {
  _id: string;
  name: string;
  origin: string;
  destination: string;
  company: string | Company;
  active: boolean;
}

export const routeService = {
  // Obtener rutas por empresa (OWNER, ADMIN & USER)
  getCompanyRoutes: async (companyId: string) => {
    try {
      const response = await api.get<Route[]>(`/routes/company/${companyId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching company routes:", error);
      return [];
    }
  },

  getAll: async () => {
    try {
      const user = useAuthStore.getState().user;
      const isOwner = user?.role === 'owner' || user?.role === 'admin';

      let companies: Company[] = [];

      // 1. Estrategia híbrida: Intentar obtener empresas accesibles
      if (isOwner) {
        try {
          // Primero intentamos endpoint de propietario
          const response = await api.get<Company[]>('/companies/my');
          companies = response.data;
        } catch (error: unknown) {
          console.warn("Fallo al cargar mis empresas, intentando públicas...", error);
        }
      }

      if (!companies || companies.length === 0) {
        // Si falla (ej: es usuario normal), intentamos listar empresas públicas
        try {
          const response = await api.get<Company[]>('/companies');
          companies = response.data;
        } catch (errPublic: unknown) {
          console.warn("No se pudieron cargar empresas públicas:", errPublic);
        }
      }

      if (!companies || companies.length === 0) {
        return [];
      }

      // 2. Obtener rutas de cada empresa encontrada
      const routesPromises = companies.map(company =>
        api.get<Route[]>(`/routes/company/${company._id}`)
          .then(res => res.data) // FIX: Ya NO sobrescribimos la compañía. Confiamos en el backend.
          .catch(() => [])
      );

      const routesArrays = await Promise.all(routesPromises);
      const allRoutes = routesArrays.flat();

      // 3. Deduplicación estricta por _id para evitar repeticiones en la UI
      const uniqueRoutes = Array.from(new Map(allRoutes.map((r: Route) => [r._id, r])).values());

      return uniqueRoutes as Route[];
    } catch (error) {
      console.error("Error loading routes:", error);
      return [];
    }
  },

  create: async (data: { origin: string; destination: string; companyId: string }) => {
    const response = await api.post<Route>('/routes', data);
    return response.data;
  },

  toggleActive: async (id: string, active: boolean) => {
    const response = await api.patch<Route>(`/routes/${id}`, { active });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/routes/${id}`);
    return response.data;
  }
};
