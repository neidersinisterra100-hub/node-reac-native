import { Schema, model, Types } from "mongoose";

const seatReservationSchema = new Schema(
    {
        tripId: {
            type: Schema.Types.ObjectId,
            ref: "Trip",
            required: true,
            index: true
        },

        seatNumber: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["blocked", "confirmed"],
            default: "blocked",
            index: true
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

        expiresAt: {
            type: Date,
            index: true
        }
    },
    {
        timestamps: true
    }
);

// 🔒 No se puede duplicar asiento por viaje
seatReservationSchema.index(
    { tripId: 1, seatNumber: 1 },
    { unique: true }
);

export const SeatReservationModel =
    model("SeatReservation", seatReservationSchema);
