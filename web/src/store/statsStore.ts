import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardStats {
  earnings: number;
  trips: number;
  routes: number;
  companies: number;
  likes: number;
  rating: number;
  share: number;
  lastUpdated: number;
}

interface StatsState {
  stats: DashboardStats;
  setStats: (stats: Partial<DashboardStats>) => void;
}

const initialStats: DashboardStats = {
  earnings: 0,
  trips: 0,
  routes: 0,
  companies: 0,
  likes: 0,
  rating: 0,
  share: 0,
  lastUpdated: 0
};

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      stats: initialStats,
      setStats: (newStats) => 
        set((state) => ({
          stats: { ...state.stats, ...newStats, lastUpdated: Date.now() }
        })),
    }),
    {
      name: 'dashboard-stats', // nombre en localStorage
    }
  )
);
