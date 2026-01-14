import api from '../lib/axios';
import { Trip } from '../types/trip';

export type { Trip };

export interface CreateTripDto {
  routeId: string;
  price: number;
  date: string;
  departureTime: string;
  transportType: string;
  capacity?: number;
}

export const tripService = {
  // Obtener todos los viajes (público, solo activos)
  getAll: async () => {
    try {
        const response = await api.get<Trip[]>('/trips');
        return response.data;
    } catch (error) {
        console.error("Error fetching trips:", error);
        throw error;
    }
  },

  // Obtener viajes para gestión (Owner/Admin - endpoint privado)
  // Devuelve viajes de las empresas propias, incluyendo inactivos
  getManage: async () => {
      try {
          const response = await api.get<Trip[]>('/trips/manage');
          return response.data;
      } catch (error) {
          console.error("Error fetching manage trips:", error);
          throw error;
      }
  },

  // Obtener viajes de una empresa específica
  getCompanyTrips: async (companyId: string) => {
      try {
          const response = await api.get<Trip[]>(`/trips/company/${companyId}`);
          return response.data;
      } catch (error) {
          console.error("Error fetching company trips:", error);
          throw error;
      }
  },

  create: async (tripData: CreateTripDto) => {
    const response = await api.post<Trip>('/trips', tripData);
    return response.data;
  },

  toggleActive: async (id: string, active: boolean) => {
    const response = await api.patch<Trip>(`/trips/${id}`, { active });
    return response.data;
  },

  delete: async (id: string) => {
      const response = await api.delete(`/trips/${id}`);
      return response.data;
  }
};
