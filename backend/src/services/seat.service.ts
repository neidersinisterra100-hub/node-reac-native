import { Types } from "mongoose";
import { SeatReservationModel } from "../models/seatReservation.model.js";

const BLOCK_MINUTES = 5; // ⏱️ tiempo de bloqueo real


export async function confirmSeat(params: {
  tripId: string;
  seatNumber: number;
  userId: string;
}) {
  const { tripId, seatNumber, userId } = params;

  const reservation = await SeatReservationModel.findOneAndUpdate(
    {
      tripId: new Types.ObjectId(tripId),
      seatNumber,
      userId: new Types.ObjectId(userId),
      status: "blocked",
    },
    {
      status: "confirmed",
      expiresAt: null,
    },
    { new: true }
  );

  if (!reservation) {
    throw new Error("SEAT_NOT_BLOCKED");
  }

  return reservation;
}


export async function reserveSeat(params: {
  tripId: string;
  seatNumber: number;
  userId?: string;
}) {
  const { tripId, seatNumber, userId } = params;

  const expiresAt = new Date(
    Date.now() + BLOCK_MINUTES * 60 * 1000
  );

  try {
    const reservation = await SeatReservationModel.create({
      tripId: new Types.ObjectId(tripId),
      seatNumber,
      userId: userId
        ? new Types.ObjectId(userId)
        : undefined,
      status: "blocked",
      expiresAt,
    });

    return reservation;
  } catch (error: any) {
    // 🔒 asiento ya existe
    if (error.code === 11000) {
      throw new Error("SEAT_ALREADY_BLOCKED");
    }
    throw error;
  }
}
