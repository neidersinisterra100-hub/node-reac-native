import api from '../lib/axios';

export interface DashboardStats {
  earnings: number;
  trips: number;
  routes: number;
  companies: number;
  likes: number;
  rating: number;
  share: number;
}

export const statsService = {
  getDashboardStats: async () => {
    const response = await api.get<DashboardStats>('/stats/dashboard');
    return response.data;
  }
};
