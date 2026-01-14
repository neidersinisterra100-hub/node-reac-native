import axios, {
  InternalAxiosRequestConfig,
} from "axios";
import { loadSession } from "../utils/authStorage";

/* =========================================================
   CONFIGURACIÓN BASE DEL API CLIENT
   ========================================================= */

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://lighter-copyrights-generic-discusses.trycloudflare.com/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "bypass-tunnel-reminder": "true",
    
  },
});

/* =========================================================
   INTERCEPTOR DE AUTENTICACIÓN (AXIOS v1+)
   ========================================================= */

/**
 * ⚠️ IMPORTANTE:
 * - Usar InternalAxiosRequestConfig
 * - NO AxiosRequestConfig
 */
api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    const session = await loadSession();

    if (session?.token) {
      /**
       * Axios garantiza que headers existe aquí
       * (InternalAxiosRequestConfig)
       */
      config.headers.Authorization = `Bearer ${session.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


/* =========================================================
   (OPCIONAL FUTURO) INTERCEPTOR DE RESPUESTA
   ========================================================= */

/**
 * Aquí, MÁS ADELANTE, puedes:
 * - detectar 401
 * - hacer logout automático
 * - redirigir a login
 *
 * NO lo hacemos aún para no mezclar responsabilidades
 */
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       // logout global
//     }
//     return Promise.reject(error);
//   }
// );



// import axios from "axios";
// import { loadSession } from "../utils/authStorage";
// import Constants from "expo-constants";

// // 👇 URL ESTABLE DE CLOUDFLARE
// const API_URL = "https://boundaries-eau-entities-counties.trycloudflare.com/api";

// export const api = axios.create({
//   baseURL: API_URL,
//   timeout: 15000,
//   headers: {
//     "bypass-tunnel-reminder": "true",
//     "ngrok-skip-browser-warning": "true",
//   },
// });

// /* ================= AUTH INTERCEPTOR ================= */

// api.interceptors.request.use(
//   async (config) => {
//     const session = await loadSession();

//     if (session?.token) {
//       config.headers.Authorization = `Bearer ${session.token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );
