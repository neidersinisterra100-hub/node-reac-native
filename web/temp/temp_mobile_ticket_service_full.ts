import { api } from "./temp_mobile_api";

// Definición simple para evitar imports rotos
export interface Ticket {
  _id: string;
  code: string;
  trip: any;
  seatNumber?: string;
  user: any;
  createdAt: string;
}

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
