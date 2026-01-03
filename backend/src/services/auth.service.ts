import axios from "axios";
import { Platform } from "react-native";

// const API_URL = "http://localhost:3000/api";
const API_URL = "https://gramophonical-silvana-unmurmuringly.ngrok-free.dev/api";

// const API_URL = Platform.OS === "web"
//     ? "http://localhost:3000/api"
//     : "https://gramophonical-silvana-unmurmuringly.ngrok-free.dev/api";

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
  const response = await axios.post(
    `${API_URL}/auth/login`,
    payload
  );

  return response.data;
}

export async function registerRequest(
  payload: RegisterPayload
) {
  const response = await axios.post(
    `${API_URL}/auth/register`,
    payload
  );

  return response.data;
}
