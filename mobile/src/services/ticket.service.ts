import { api } from "./api";
import { Ticket } from "../types/ticket";

/* ================= BUY TICKET ================= */

export async function buyTicketRequest(
  tripId: string
): Promise<Ticket> {
  const response = await api.post<Ticket>(
    "/tickets/buy",
    { tripId }
  );

  return response.data;
}

/* ================= HISTORIAL ================= */

export async function getMyTicketsRequest(): Promise<Ticket[]> {
  const response = await api.get<Ticket[]>("/tickets/my");

  return Array.isArray(response.data)
    ? response.data
    : [];
}

/* ================= VALIDAR TICKET (OWNER) ================= */

export async function validateTicketRequest(code: string): Promise<any> {
  const response = await api.post("/tickets/validate", { code });
  return response.data;
}
