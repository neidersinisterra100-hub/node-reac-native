import { api } from './api';

export interface Schedule {
  _id: string;
  date: string; // ISO date string
  company: string;
  admin: {
    _id: string;
    name: string;
    email: string;
  } | string;
  active: boolean;
}

export const calendarService = {
  // Obtener calendario del mes
  getSchedule: async (companyId: string, year: number, month: number) => {
    const response = await api.get<Schedule[]>('/schedules', {
      params: { companyId, year, month }
    });
    return response.data;
  },

  // Asignar turno (Crear o Actualizar)
  setSchedule: async (data: { date: Date; companyId: string; adminId: string; active: boolean }) => {
    const response = await api.post<Schedule>('/schedules', {
      ...data,
      date: data.date.toISOString() // Asegurar formato fecha
    });
    return response.data;
  }
};