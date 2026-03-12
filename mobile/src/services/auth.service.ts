import { api } from "./api";

/* =========================================================
   TYPES
   ========================================================= */

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

/* =========================================================
   AUTH REQUESTS
   ========================================================= */

export async function loginRequest(payload: LoginPayload) {
  console.log("🔐 [AUTH] Login request");
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function registerRequest(payload: RegisterPayload) {
  console.log("📝 [AUTH] Register request");
  const { data } = await api.post("/auth/register", payload);
  return data;
}

/* =========================================================
   PASSWORD RESET
   ========================================================= */

export async function requestPasswordReset(email: string) {
  console.log("🔑 [AUTH] Request password reset");
  await api.post("/auth/request-password-reset", { email });
}

export async function resetPassword(
  token: string,
  password: string
) {
  console.log("🔁 [AUTH] Reset password");
  await api.post("/auth/reset-password", {
    token,
    password,
  });
}

export async function getProfileRequest() {
  console.log("👤 [AUTH] Get profile request");
  const { data } = await api.get("/auth/profile");
  return data;
}
