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
