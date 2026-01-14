import api from '../lib/axios';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        console.log("Respuesta Login:", response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error("Error en authService.login:", error);
        throw error;
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
