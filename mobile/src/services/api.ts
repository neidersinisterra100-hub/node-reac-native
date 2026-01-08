import axios from "axios";
import { loadSession } from "../utils/authStorage";
import Constants from "expo-constants";

// 👇 URL ESTABLE DE NGROK
const API_URL = "https://gramophonical-silvana-unmurmuringly.ngrok-free.dev/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "bypass-tunnel-reminder": "true",
    "ngrok-skip-browser-warning": "true",
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
