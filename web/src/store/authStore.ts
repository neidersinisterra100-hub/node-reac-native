import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  selectedCompany: { _id: string, name: string } | null; // Nuevo estado global
  setToken: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => void;
  setSelectedCompany: (company: { _id: string, name: string } | null) => void;
  isAuthenticated: () => boolean; // Helper para verificar auth
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      selectedCompany: null,

      setToken: (token, user) => {
        // localStorage.setItem('token', token); // Desactivar guardado manual
        set({ token, user });
      },

      logout: () => {
        // localStorage.removeItem('token'); // Ya no es necesario si no se guarda
        set({ user: null, token: null, selectedCompany: null });
      },
      
      checkAuth: () => {
          // ... lógica existente ...
      },

      setSelectedCompany: (company) => set({ selectedCompany: company }),

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        selectedCompany: state.selectedCompany 
      }),
    }
  )
);
