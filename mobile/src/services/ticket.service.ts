import { api } from "./api";

export interface Ticket {
  _id: string;
  trip: any; // Se puede tipar mejor con Trip
  passenger: string;
  passengerName: string;
  passengerId: string;
  seatNumber?: string;
  status: "active" | "used" | "cancelled" | "expired" | "pending_payment";
  qrCode?: string;
  purchaseDate: string;
  financials?: {
      price: number;
  };
  payment?: {
      status: string;
      reference: string;
  };
}

export interface BuyTicketResponse {
    ticketId: string;
    paymentData: {
        publicKey: string;
        reference: string;
        amountInCents: number;
        currency: string;
        signature: string;
        redirectUrl: string;
        customerEmail: string;
    }
}

export async function buyTicket(data: {
  tripId: string;
  passengerName: string;
  passengerId: string;
  seatNumber?: string;
}) {
  const response = await api.post("/tickets/buy", data);
  return response.data as BuyTicketResponse;
}

export async function getMyTickets() {
  const response = await api.get("/tickets/my");
  return response.data as Ticket[];
}
