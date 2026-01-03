import { api } from "./api";
import { Ticket } from "../types/ticket";

/* ================= TYPES ================= */

type BuyTicketPayload = {
  routeName: string;
  price: number;
};

/* ================= BUY TICKET ================= */

export async function buyTicketRequest(
  payload: BuyTicketPayload
): Promise<Ticket> {
  const response = await api.post<Ticket>(
    "/tickets/buy",
    payload
  );

  return response.data;
}

/* ================= HISTORIAL ================= */

export async function getMyTicketsRequest(): Promise<Ticket[]> {
  const response = await api.get<Ticket[]>(
    "/tickets/my"
  );

  console.log("📦 tickets response:", response.data);

  // 🛡️ Garantía absoluta para evitar tickets.map error
  return Array.isArray(response.data)
    ? response.data
    : [];
}



// import axios from "axios";
// import { Ticket } from "../types/ticket";
// import { loadSession } from "../utils/authStorage";

// const API_URL =
//   "https://gramophonical-silvana-unmurmuringly.ngrok-free.dev/api";

// /* ================= BUY TICKET ================= */

// export async function buyTicketRequest(
//   payload: {
//     routeName: string;
//     price: number;
//   }
// ): Promise<Ticket> {
//   const session = await loadSession();

//   if (!session?.token) {
//     throw new Error("No hay sesión activa");
//   }

//   const response = await axios.post<Ticket>(
//     `${API_URL}/tickets/buy`,
//     payload,
//     {
//       headers: {
//         Authorization: `Bearer ${session.token}`,
//         "Content-Type": "application/json",

//         // 🔥 CLAVE NGROK
//         "ngrok-skip-browser-warning": "true",
//       },
//     }
//   );

//   return response.data;
// }

// /* ================= HISTORIAL ================= */

// export async function getMyTicketsRequest(): Promise<Ticket[]> {
//   const session = await loadSession();

//   if (!session?.token) {
//     throw new Error("No token found");
//   }

//   const response = await axios.get<Ticket[]>(
//     `${API_URL}/tickets/my`,
//     {
//       headers: {
//         Authorization: `Bearer ${session.token}`,

//         // 🔥 CLAVE NGROK
//         "ngrok-skip-browser-warning": "true",
//       },
//     }
//   );

//   return Array.isArray(response.data)
//     ? response.data
//     : [];
// }
