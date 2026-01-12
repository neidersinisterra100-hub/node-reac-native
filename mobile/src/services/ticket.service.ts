import { api } from "./api";
import { Ticket as UITicket } from "../types/ticket";

/* =========================================================
   TIPOS DE TICKET (BACKEND / API)
   ========================================================= */

/**
 * TicketApi
 *
 * Representa EXACTAMENTE el ticket como lo devuelve el backend.
 * ❗ Este tipo NO se usa directamente en pantallas.
 */
export interface TicketApi {
  _id: string;

  /**
   * Puede venir:
   * - string (ObjectId)
   * - objeto populado (cuando backend usa populate)
   */
  trip:
    | string
    | {
        date?: string;
        departureTime?: string;
        transportType?: string;
        route?: {
          origin?: string;
          destination?: string;
        };
      };

  passenger: string;
  passengerName: string;
  passengerId: string;
  seatNumber?: string;

  status:
    | "active"
    | "used"
    | "cancelled"
    | "expired"
    | "pending_payment";

  qrCode?: string;
  purchaseDate: string;

  /* =========================
     FINANZAS
     ========================= */
  financials: {
    price: number;
    platformFee: number;
    companyNet: number;
    gatewayFeeEstimated: number;
  };

  /* =========================
     PAGO
     ========================= */
  payment: {
    status:
      | "PENDING"
      | "APPROVED"
      | "DECLINED"
      | "VOIDED"
      | "ERROR";
    reference?: string;
    transactionId?: string;
    paymentMethod?: "WOMPI" | "CASH";
    paidAt?: string;
  };

  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   RESPUESTA DE COMPRA DE TICKET
   ========================================================= */

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
  };
}

/* =========================================================
   ADAPTADOR: BACKEND ➜ UI
   ========================================================= */

/**
 * mapTicketToUI
 *
 * 🔑 FUNCIÓN CLAVE
 * ÚNICO lugar donde se transforma data del backend
 */
function mapTicketToUI(ticket: TicketApi): UITicket {
  const trip =
    typeof ticket.trip === "object" ? ticket.trip : undefined;

  return {
    _id: ticket._id,

    routeName: trip?.route
      ? `${trip.route.origin ?? "Origen"} → ${trip.route.destination ?? "Destino"}`
      : "Ruta",

    transport: trip?.transportType ?? "Lancha",

    date: trip?.date ?? ticket.purchaseDate,

    price: ticket.financials.price,

    code:
      ticket.qrCode ??
      ticket._id.slice(-6).toUpperCase(),

    departureAt: trip?.departureTime,

    seatNumber: ticket.seatNumber,

    user: {
      name: ticket.passengerName,
    },
  };
}

/* =========================================================
   SERVICES – COMPRA
   ========================================================= */

/**
 * buyTicket
 *
 * Inicia el proceso de compra:
 * - Crea ticket en estado pending_payment
 * - Retorna datos para Wompi
 */
export async function buyTicket(data: {
  tripId: string;
  passengerName: string;
  passengerId: string;
  seatNumber?: string;
}): Promise<BuyTicketResponse> {
  const response = await api.post("/tickets/buy", data);
  return response.data;
}

/* =========================================================
   SERVICES – TICKETS USUARIO
   ========================================================= */

/**
 * getMyTickets
 *
 * Obtiene los tickets del usuario autenticado
 * y los adapta al formato UI.
 */
export async function getMyTickets(): Promise<UITicket[]> {
  const response = await api.get<TicketApi[]>("/tickets/my");
  return response.data.map(mapTicketToUI);
}

/* =========================================================
   SERVICES – CONTROL DE PASAJEROS (OWNER / ADMIN)
   ========================================================= */

/**
 * getTripsForPassengerControl
 *
 * Lista viajes gestionables (owner/admin)
 */
export async function getTripsForPassengerControl() {
  const response = await api.get("/trips/manage");
  return response.data;
}

/**
 * getPassengersByTrip
 *
 * Obtiene pasajeros (tickets) de un viaje
 */
export async function getPassengersByTrip(tripId: string) {
  const response = await api.get(
    `/tickets/passengers/${tripId}`
  );
  return response.data;
}

/**
 * registerManualPassenger
 *
 * Registra un pasajero manual (pago en efectivo)
 */
export async function registerManualPassenger(
  tripId: string,
  passengerName: string
) {
  const response = await api.post(
    "/tickets/manual",
    {
      tripId,
      passengerName,
    }
  );
  return response.data;
}

/* =========================================================
   VALIDAR TICKET (EMPRESA / CONTROL)
   ========================================================= */

/**
 * validateTicketRequest
 *
 * Valida un ticket por código (QR o manual)
 *
 * Usado en:
 * - ValidateTicketScreen
 *
 * Retorna:
 * - success
 * - datos del pasajero
 * - ruta
 */
export async function validateTicketRequest(
  code: string
): Promise<{
  message: string;
  passenger?: string;
  routeName?: string;
}> {
  const response = await api.post("/tickets/validate", {
    code,
  });

  return response.data;
}
