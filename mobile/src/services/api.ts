import axios from "axios";
import { loadSession } from "../utils/authStorage";
import Constants from "expo-constants";

/**
 * Prioridad:
 * 1. Variable definida en app.config / app.json (Render)
 * 2. Fallback local (TU IP LOCAL)
 */
// CAMBIAR A TU IP LOCAL SI USAS DISPOSITIVO FISICO O EMULADOR EXTERNO
// Android Emulator usa 10.0.2.2, Genymotion 10.0.3.2, Fisico TU_IP
const LOCAL_IP = "192.168.1.40"; 
const API_URL = `http://${LOCAL_IP}:3000/api`;

// const API_URL =
//   Constants.expoConfig?.extra?.API_URL ??
//   process.env.EXPO_PUBLIC_API_URL ??
//   "https://node-reac-native.onrender.com/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "bypass-tunnel-reminder": "true",
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
