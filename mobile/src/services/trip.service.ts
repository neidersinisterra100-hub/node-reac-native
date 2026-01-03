import { api } from "./api";

export type Trip = {
  _id: string;
  date: string;
  departureTime: string;
  price: number;
  route: {
    origin: string;
    destination: string;
  };
};

export async function getTrips(): Promise<Trip[]> {
  const response = await api.get<Trip[]>("/trips");
  return response.data;
}


// export async function getTrips() {
//   const response = await api.get("/trips");
//   return response.data;
// }

export async function createTrip(data: {
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  price: number;
}) {
  const response = await api.post("/trips", data);
  return response.data;
}
