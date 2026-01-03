import axios from "axios";
import { loadSession } from "../utils/authStorage";
 import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL ?? "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(async (config) => {
  const session = await loadSession();

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});



// import axios from "axios";
// import { Platform } from "react-native";
// import { loadSession } from "../utils/authStorage";

// const API_URL = "https://gramophonical-silvana-unmurmuringly.ngrok-free.dev/api";

// export const api = axios.create({
//   baseURL: API_URL,
//   timeout: 10000,
// });

// /* ================= INTERCEPTOR ================= */

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
