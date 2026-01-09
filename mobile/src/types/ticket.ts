export type Ticket = {
  _id: string;
  routeName: string;
  price: number;
  transport: string;
  date: string;
  code: string;

  // fecha + hora real del viaje
  departureAt?: string;

  // asiento asignado (ej: "12")
  seatNumber?: string;

  // usuario que compró el ticket
  user?: {
    name: string;
  };
};
