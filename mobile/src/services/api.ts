/* =========================================================
   API CONFIG — NAUTICGO
   ---------------------------------------------------------
   Cliente HTTP centralizado
   - Maneja entornos (local, tunnel, prod)
   - Inyecta JWT automáticamente
   - Soporta fallback Cloudflare → Render
   ========================================================= */

import axios, {
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import Constants from "expo-constants";
import { loadSession } from "../utils/authStorage";

/* =========================================================
   🔧 SELECCIÓN DE ENTORNO
   ---------------------------------------------------------
   ⚠️ SOLO UNO DEBE ESTAR ACTIVO
   ========================================================= */

/**
 * 🟢 BACKEND LOCAL — WEB (solo navegador)
 * ❌ NO funciona en Expo Go móvil
 */
const BASE_API = "http://localhost:3000/api";
// const BASE_API = "http://10.142.77.225:3000/api";

/**
 * 🟢 OPCONES DE CONEXIÓN
 * ⚠️ Solo una debe estar activa
 */
// const BASE_API = "http://10.0.2.2:3000/api"; // Android Emulator
// const BASE_API = Constants.expoConfig?.extra?.api?.ngrok; // ngrok
// const BASE_API = Constants.expoConfig?.extra?.api?.cloudflare; // Cloudflare

// Referencia de URLs (comentar las que no se usen)
// const BASE_API = "http://localhost:3000/api";
// const BASE_API = "https://gramophonical-silvana-unmurmuringly.ngrok-free.dev/api";
/**
 * 🔴 RENDER (PRODUCCIÓN)
 */
// const BASE_API = Constants.expoConfig?.extra?.api?.render;

console.log("🌐 [API] Initializing with Base URL:", BASE_API);
if (!BASE_API) {
  console.warn("⚠️ [API] BASE_API is undefined! Check your .env and app.config.ts");
}

/* =========================================================
   AXIOS INSTANCE
   ========================================================= */

export const api = axios.create({
  baseURL: BASE_API || "",
  timeout: 15000,
});

/* =========================================================
   REQUEST INTERCEPTOR — JWT
   ---------------------------------------------------------
   - Carga sesión desde AsyncStorage
   - Inyecta Authorization automáticamente
   ========================================================= */

api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    const session = await loadSession();

    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR — FALLBACK
   ---------------------------------------------------------
   - Si Cloudflare falla (502–504)
   - Reintenta automáticamente contra Render
   ========================================================= */

const RENDER_API =
  Constants.expoConfig?.extra?.api?.render ?? null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const isNetworkError =
      !error.response || error.code === "ERR_NETWORK";

    const cloudflareFailure =
      status === 502 ||
      status === 503 ||
      status === 504;

    const config = error.config as
      | (InternalAxiosRequestConfig & {
        _retry?: boolean;
      })
      | undefined;

    if (
      (isNetworkError || cloudflareFailure) &&
      RENDER_API &&
      api.defaults.baseURL !== RENDER_API &&
      !config?._retry
    ) {
      console.warn(
        "⚠️ [API] Fallback Cloudflare → Render"
      );

      if (!config) {
        return Promise.reject(error);
      }

      config._retry = true;
      api.defaults.baseURL = RENDER_API;
      return api(config);
    }

    return Promise.reject(error);
  }
);

/* =========================================================
   RESPONSE INTERCEPTOR — FALLBACK
   ========================================================= */

// const RENDER_API =
//   Constants.expoConfig?.extra?.api?.render ?? null;

// api.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const status = error.response?.status;
//     const isNetworkError =
//       !error.response || error.code === "ERR_NETWORK";

//     const cloudflareFailure =
//       status === 502 ||
//       status === 503 ||
//       status === 504;

//     const config = error.config as any;

//     if (
//       isNetworkError &&
//       cloudflareFailure &&
//       RENDER_API &&
//       api.defaults.baseURL !== RENDER_API &&
//       !config?._retry
//     ) {
//       console.warn(
//         "⚠️ [API] Fallback Cloudflare → Render"
//       );

//       config._retry = true;
//       api.defaults.baseURL = RENDER_API;
//       return api(config);
//     }

//     return Promise.reject(error);
//   }
// );
