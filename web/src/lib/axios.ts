import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://lighter-copyrights-generic-discusses.trycloudflare.com/api',
  headers: {
    'Content-Type': 'application/json',
    "bypass-tunnel-reminder": "true",
    "ngrok-skip-browser-warning": "true",
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
