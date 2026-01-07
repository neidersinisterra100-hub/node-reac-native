import axios from "axios";
import { loadSession } from "../utils/authStorage";
import Constants from "expo-constants";

/**
 * Prioridad:
 * 1. Variable definida en app.config / app.json (Render)
 * 2. Fallback local
 */
const API_URL =
  Constants.expoConfig?.extra?.API_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  "https://node-reac-native.onrender.com/api"; 
  // "https://fast-windows-stay.loca.lt/api"; // URL pública temporal

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "bypass-tunnel-reminder": "true", // Necesario para evitar la pantalla de espera de localtunnel
  },
});

/* ================= AUTH INTERCEPTOR ================= */

api.interceptors.request.use(
  async (config) => {
    const session = await loadSession();

    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
