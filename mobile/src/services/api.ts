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

/**
 * 🟢 BACKEND LOCAL — MÓVIL FÍSICO / EXPO GO
 * 👉 Usa la IP de tu computador
 */
// const BASE_API = "http://192.168.1.36:3000/api";

/**
 * 🟢 ANDROID EMULATOR
 */
// const BASE_API = "http://10.0.2.2:3000/api";

/**
 * 🟢 iOS SIMULATOR
 */
// const BASE_API = "http://localhost:3000/api";

/**
 * 🟡 CLOUDFLARE TUNNEL (DEV REMOTO)
 */
// const BASE_API = Constants.expoConfig?.extra?.api?.cloudflare;

/**
 * 🔴 RENDER (PRODUCCIÓN)
 */
// const BASE_API = Constants.expoConfig?.extra?.api?.render;

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




// /* =========================================================
//    API CONFIG — NAUTICGO
//    Cambiar de entorno = comentar / descomentar
//    ========================================================= */

// import axios, {
//   InternalAxiosRequestConfig,
//   AxiosError,
// } from "axios";
// import Constants from "expo-constants";
// import { loadSession } from "../utils/authStorage";

// /* =========================================================
//    🔧 SELECCIÓN DE ENTORNO (ELIGE UNO)
//    ========================================================= */

// /**
//  * 🟢 1️⃣ BACKEND LOCAL — WEB (React en navegador)
//  */
// const BASE_API = "http://localhost:3000/api";
// // const BASE_API = "http://192.168.1.36:3000/api";

// /**
//  * 🟢 2️⃣ BACKEND LOCAL — EXPO GO / MÓVIL FÍSICO
//  * ⚠️ Usa la IP de tu computador
//  */
// // const BASE_API = "http://192.168.1.12:3000/api";

// /**
//  * 🟢 3️⃣ BACKEND LOCAL — ANDROID EMULATOR
//  */
// // const BASE_API = "http://10.0.2.2:3000/api";

// /**
//  * 🟢 4️⃣ BACKEND LOCAL — iOS SIMULATOR
//  */
// // const BASE_API = "http://localhost:3000/api";

// /**
//  * 🟡 5️⃣ CLOUDFLARE TUNNEL (DEV REMOTO)
//  * expone tu backend local
//  */
// // const BASE_API = Constants.expoConfig?.extra?.api?.cloudflare;

// /**
//  * 🔴 6️⃣ RENDER (PRODUCCIÓN)
//  */
// // const BASE_API = Constants.expoConfig?.extra?.api?.render;

// /* =========================================================
//    🔁 AUTO-DETECCIÓN EXPO (OPCIONAL)
//    👉 Descomenta SOLO si quieres que detecte IP solo
//    ========================================================= */

// // const debuggerHost = Constants.manifest2?.debuggerHost;
// // const localIP = debuggerHost?.split(":")[0];
// // const BASE_API = localIP
// //   ? `http://${localIP}:3000/api`
// //   : undefined;

// /* =========================================================
//    🛑 VALIDACIÓN
//    ========================================================= */

// if (!BASE_API) {
//   throw new Error(
//     "❌ BASE_API no configurada. Descomenta un entorno válido."
//   );
// }

// console.log("🌐 [API] Base URL:", BASE_API);

// /* =========================================================
//    AXIOS INSTANCE
//    ========================================================= */

// export const api = axios.create({
//   baseURL: BASE_API,
//   timeout: 15000,
// });

// /* =========================================================
//    REQUEST INTERCEPTOR (JWT)
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
//    RESPONSE INTERCEPTOR (FALLBACK OPCIONAL)
//    SOLO PARA CLOUDFLARE → RENDER
//    ========================================================= */

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
