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
import { Platform } from "react-native";
import { loadSession } from "../utils/authStorage";

/* =========================================================
   🔧 SELECCIÓN DE ENTORNO
   ---------------------------------------------------------
   ⚠️ Se prioriza LOCALHOST en Web y TÚNELES en Móvil
   ========================================================= */

const getBaseApi = (): string => {
  try {
    const extra = Constants.expoConfig?.extra?.api;

    // 1. WEB -> Usar 127.0.0.1 (más estable que localhost en Windows)
    if (Platform.OS === "web") {
      return "http://127.0.0.1:3000/api";
    }

    // 2. MÓVIL -> Priorizar túneles si existen
    if (extra?.cloudflare) return String(extra.cloudflare);
    if (extra?.ngrok) return String(extra.ngrok);

    // 3. Fallback
    return "http://127.0.0.1:3000/api";
  } catch (e) {
    return "http://127.0.0.1:3000/api";
  }
};

const BASE_API = getBaseApi();

console.log("🌐 [API] Initializing with Base URL:", BASE_API);

/* =========================================================
   AXIOS INSTANCE
   ========================================================= */

export const api = axios.create({
  baseURL: BASE_API,
  timeout: 15000,
});

/* =========================================================
   REQUEST INTERCEPTOR — JWT
   ========================================================= */

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
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
   ========================================================= */

const RENDER_API = Constants.expoConfig?.extra?.api?.render;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const isNetworkError = !error.response || error.code === "ERR_NETWORK";

    const cloudflareFailure =
      status === 502 ||
      status === 503 ||
      status === 504;

    const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Solo reintentar si tenemos una URL de Render válida y aún no hemos reintentado
    if (
      (isNetworkError || cloudflareFailure) &&
      typeof RENDER_API === 'string' &&
      config &&
      !config._retry
    ) {
      console.warn("⚠️ [API] Fallback Cloudflare → Render para este request");
      config._retry = true;

      // Usamos la instancia 'api' para el retry para mantener interceptores (JWT)
      // pero sobreescribimos el baseURL solo para esta petición
      return api.request({
        ...config,
        baseURL: RENDER_API
      });
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
