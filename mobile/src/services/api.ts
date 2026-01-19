/* =========================================================
   API CONFIG — NAUTICGO
   Cambiar de entorno = comentar / descomentar
   ========================================================= */

import axios, {
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import Constants from "expo-constants";
import { loadSession } from "../utils/authStorage";

/* =========================================================
   🔧 SELECCIÓN DE ENTORNO (ELIGE UNO)
   ========================================================= */

/**
 * 🟢 1️⃣ BACKEND LOCAL — WEB (React en navegador)
 */
const BASE_API = "http://localhost:3000/api";
// const BASE_API = "http://192.168.1.36:3000/api";

/**
 * 🟢 2️⃣ BACKEND LOCAL — EXPO GO / MÓVIL FÍSICO
 * ⚠️ Usa la IP de tu computador
 */
// const BASE_API = "http://192.168.1.12:3000/api";

/**
 * 🟢 3️⃣ BACKEND LOCAL — ANDROID EMULATOR
 */
// const BASE_API = "http://10.0.2.2:3000/api";

/**
 * 🟢 4️⃣ BACKEND LOCAL — iOS SIMULATOR
 */
// const BASE_API = "http://localhost:3000/api";

/**
 * 🟡 5️⃣ CLOUDFLARE TUNNEL (DEV REMOTO)
 * expone tu backend local
 */
// const BASE_API = Constants.expoConfig?.extra?.api?.cloudflare;

/**
 * 🔴 6️⃣ RENDER (PRODUCCIÓN)
 */
// const BASE_API = Constants.expoConfig?.extra?.api?.render;

/* =========================================================
   🔁 AUTO-DETECCIÓN EXPO (OPCIONAL)
   👉 Descomenta SOLO si quieres que detecte IP solo
   ========================================================= */

// const debuggerHost = Constants.manifest2?.debuggerHost;
// const localIP = debuggerHost?.split(":")[0];
// const BASE_API = localIP
//   ? `http://${localIP}:3000/api`
//   : undefined;

/* =========================================================
   🛑 VALIDACIÓN
   ========================================================= */

if (!BASE_API) {
  throw new Error(
    "❌ BASE_API no configurada. Descomenta un entorno válido."
  );
}

console.log("🌐 [API] Base URL:", BASE_API);

/* =========================================================
   AXIOS INSTANCE
   ========================================================= */

export const api = axios.create({
  baseURL: BASE_API,
  timeout: 15000,
});

/* =========================================================
   REQUEST INTERCEPTOR (JWT)
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
   RESPONSE INTERCEPTOR (FALLBACK OPCIONAL)
   SOLO PARA CLOUDFLARE → RENDER
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

    const config = error.config as any;

    if (
      isNetworkError &&
      cloudflareFailure &&
      RENDER_API &&
      api.defaults.baseURL !== RENDER_API &&
      !config?._retry
    ) {
      console.warn(
        "⚠️ [API] Fallback Cloudflare → Render"
      );

      config._retry = true;
      api.defaults.baseURL = RENDER_API;
      return api(config);
    }

    return Promise.reject(error);
  }
);



// import axios, {
//   InternalAxiosRequestConfig,
//   AxiosError,
// } from "axios";
// import Constants from "expo-constants";
// import { loadSession } from "../utils/authStorage";

// /* =========================================================
//    URLS DE API (DESDE app.config.ts)
//    ========================================================= */

// /**
//  * Vienen desde:
//  * app.config.ts → expo.extra.api
//  */
// const extraApi =
//   Constants.expoConfig?.extra?.api ||
//   Constants.manifest?.extra?.api; // compatibilidad Expo Go

// const EXPO_PUBLIC_API_URL_CLOUDFLARE: string | undefined =
//   extraApi?.cloudflare;

// const EXPO_PUBLIC_API_URL_RENDER: string | undefined =
//   extraApi?.render;
// console.log("🌐 API CONFIG:", extraApi);

// /**
//  * Cloudflare primero, Render fallback
//  */
// const PRIMARY_API = EXPO_PUBLIC_API_URL_CLOUDFLARE || EXPO_PUBLIC_API_URL_RENDER;

// if (!PRIMARY_API) {
//   throw new Error(
//     "❌ No hay API configurada (Cloudflare ni Render)"
//   );
// }

// /* =========================================================
//    AXIOS INSTANCE
//    ========================================================= */

// export const api = axios.create({
//   baseURL: PRIMARY_API,
//   timeout: 15000,
//   headers: {
//     "bypass-tunnel-reminder": "true",
//   },
// });

// /* =========================================================
//    REQUEST INTERCEPTOR (AUTH)
//    ========================================================= */

// api.interceptors.request.use(
//   async (
//     config: InternalAxiosRequestConfig
//   ): Promise<InternalAxiosRequestConfig> => {
//     const session = await loadSession();

//     if (session?.token) {
//       config.headers.Authorization = `Bearer ${session.token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /* =========================================================
//    RESPONSE INTERCEPTOR (FALLBACK AUTOMÁTICO)
//    ========================================================= */

// api.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const isNetworkError =
//       !error.response ||
//       error.code === "ERR_NETWORK" ||
//       error.message?.includes("Network Error");

//     const config = error.config as any;

//     const alreadyRetried = config?._retry;

//     /**
//      * Fallback:
//      * - Error de red (DNS / túnel caído)
//      * - No reintentado aún
//      * - Existe Render
//      * - Aún estamos en Cloudflare
//      */
//     if (
//       isNetworkError &&
//       !alreadyRetried &&
//       EXPO_PUBLIC_API_URL_RENDER &&
//       api.defaults.baseURL !== EXPO_PUBLIC_API_URL_RENDER
//     ) {
//       console.warn(
//         "⚠️ Cloudflare caído, usando Render como fallback"
//       );

//       config._retry = true;

//       api.defaults.baseURL = EXPO_PUBLIC_API_URL_RENDER;

//       return api(config);
//     }

//     return Promise.reject(error);
//   }
// );



// import axios, {
//   InternalAxiosRequestConfig,
// } from "axios";
// import { loadSession } from "../utils/authStorage";

// /* =========================================================
//    CONFIGURACIÓN BASE DEL API CLIENT
//    ========================================================= */

// const API_URL =
//   process.env.EXPO_PUBLIC_API_URL ||
//   "https://time-seventh-differently-laundry.trycloudflare.com/api";

// export const api = axios.create({
//   baseURL: API_URL,
//   timeout: 15000,
//   headers: {
//     "bypass-tunnel-reminder": "true",
    
//   },
// });

// /* =========================================================
//    INTERCEPTOR DE AUTENTICACIÓN (AXIOS v1+)
//    ========================================================= */

// /**
//  * ⚠️ IMPORTANTE:
//  * - Usar InternalAxiosRequestConfig
//  * - NO AxiosRequestConfig
//  */
// api.interceptors.request.use(
//   async (
//     config: InternalAxiosRequestConfig
//   ): Promise<InternalAxiosRequestConfig> => {
//     const session = await loadSession();

//     if (session?.token) {
//       /**
//        * Axios garantiza que headers existe aquí
//        * (InternalAxiosRequestConfig)
//        */
//       config.headers.Authorization = `Bearer ${session.token}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

