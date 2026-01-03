import axios from "axios";
import Constants from "expo-constants";

/**
 * Base URL tomada desde variables de entorno
 * - Local: http://localhost:3001/api
 * - Producción: https://tu-backend.onrender.com/api
 */
const API_URL =
  Constants.expoConfig?.extra?.API_URL ??
  "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export async function loginRequest(payload: LoginPayload) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function registerRequest(payload: RegisterPayload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}
