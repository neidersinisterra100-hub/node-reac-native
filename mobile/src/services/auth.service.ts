import axios from "axios";

/**
 * ⚠️ IMPORTANTE
 * - NO usar https si tu backend NO tiene SSL
 * - En Expo (web + móvil) esto evita Network Error
 *
 * EJEMPLOS:
 *  - LAN:  http://192.168.1.39:3000/api
 *  - TUNNEL: https://xxxx.ngrok-free.app/api
 */
const API_URL = "https://gramophonical-silvana-unmurmuringly.ngrok-free.dev/api";

/* ================= TYPES ================= */

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

/* ================= REQUESTS ================= */

export async function loginRequest(
  payload: LoginPayload
) {
  const response = await axios.post(
    `${API_URL}/auth/login`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data; // { user, token }
}

export async function registerRequest(
  payload: RegisterPayload
) {
  const response = await axios.post(
    `${API_URL}/auth/register`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data; // { user, token }
}
