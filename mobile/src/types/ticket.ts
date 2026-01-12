/**
 * TicketUI
 *
 * Ticket listo para mostrar en pantallas.
 * NO representa la respuesta cruda del backend.
 */
export type Ticket = {
  _id: string;

  /* ===== DATOS MOSTRADOS ===== */
  routeName: string;
  transport: string;
  date: string;
  price: number;
  code: string;

  /* ===== OPCIONALES ===== */
  departureAt?: string;
  seatNumber?: string;

  user?: {
    name: string;
  };
};
