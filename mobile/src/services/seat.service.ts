import { api } from "./api";

export interface Seat {
    seatNumber: number;
    available: boolean;
}

export async function getTripSeats(tripId: string): Promise<Seat[]> {
    const { data } = await api.get<Seat[]>(
        `/trips/${tripId}/seats`
    );
    return data;
}
