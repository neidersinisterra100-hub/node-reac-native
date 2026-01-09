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

/* ================= VALIDAR TICKET (OWNER / ADMIN) ================= */

export async function validateTicketRequest(
  code: string
): Promise<{
  valid: boolean;
  passenger?: string;
  seatNumber?: number;
  routeName?: string;
  message?: string;
}> {
  const response = await api.post("/tickets/validate", { code });
  return response.data;
}

/* =====================================================
   PASAJEROS POR VIAJE (OWNER / ADMIN)
   ===================================================== */

export type TripPassenger = {
  _id: string;
  seatNumber: number;
  status: string;
  user?: {
    name: string;
  };
};

export async function getPassengersByTripRequest(
  tripId: string
): Promise<TripPassenger[]> {
  const response = await api.get<TripPassenger[]>(
    `/tickets/trip/${tripId}/passengers`
  );

  return Array.isArray(response.data)
    ? response.data
    : [];
}

/* =====================================================
   REGISTRO MANUAL DE PASAJERO (OWNER / ADMIN)
   ===================================================== */

export async function registerManualPassengerRequest(
  tripId: string,
  passengerName: string
): Promise<{
  _id: string;
  seatNumber: number;
}> {
  const response = await api.post("/tickets/manual", {
    tripId,
    passengerName,
  });

  return response.data;
}


// import { api } from "./api";
// import { Ticket } from "../types/ticket";

// /* ================= BUY TICKET ================= */

// export async function buyTicketRequest(
//   tripId: string
// ): Promise<Ticket> {
//   const response = await api.post<Ticket>(
//     "/tickets/buy",
//     { tripId }
//   );

//   return response.data;
// }

// /* ================= HISTORIAL ================= */

// export async function getMyTicketsRequest(): Promise<Ticket[]> {
//   const response = await api.get<Ticket[]>("/tickets/my");

//   return Array.isArray(response.data)
//     ? response.data
//     : [];
// }

// /* ================= VALIDAR TICKET (OWNER) ================= */

// export async function validateTicketRequest(code: string): Promise<any> {
//   const response = await api.post("/tickets/validate", { code });
//   return response.data;
// }
