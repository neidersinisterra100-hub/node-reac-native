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
