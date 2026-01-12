import { api } from "./api"; // 👈 Usar instancia centralizada

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
