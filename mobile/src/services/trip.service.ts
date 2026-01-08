import { api } from "./api";

/* ================= TYPES ================= */

export interface Trip {
  _id: string;
  route: string | { _id: string, origin: string, destination: string }; // Populated or ID
  company: string | { _id: string, name: string };
  date: string;          
  departureTime: string; 
  price: number;
  availableSeats: number;
}

/* ================= API ================= */

export async function getTrips() {
  const response = await api.get("/trips");
  return response.data as Trip[];
}

export async function createTrip(data: {
  routeId: string;
  date: string;
  departureTime: string;
  price: number;
}) {
  const response = await api.post("/trips", data);
  return response.data;
}

export async function deleteTrip(id: string) {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
}
