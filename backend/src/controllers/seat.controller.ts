import { RequestHandler } from "express";
import { TripModel } from "../models/trip.model.js";
import { SeatReservationModel } from "../models/seatReservation.model.js";

export const getTripSeats: RequestHandler = async (req, res) => {
    const { tripId } = req.params;

    const trip = await TripModel.findById(tripId);
    if (!trip) {
        return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const reservations = await SeatReservationModel.find({
        tripId,
        status: { $in: ["blocked", "confirmed"] }
    });

    const takenSeats = reservations.map(r => r.seatNumber);

    const seats = Array.from({ length: trip.capacity }, (_, i) => {
        const seatNumber = i + 1;
        return {
            seatNumber,
            available: !takenSeats.includes(seatNumber)
        };
    });

    return res.json(seats);
};
