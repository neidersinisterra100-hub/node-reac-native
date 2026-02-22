import mongoose, { Schema, model, Document, Types } from "mongoose";

export enum RideStatus {
    WAITING = "waiting",
    ACCEPTED = "accepted",
    ARRIVED = "arrived",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export interface IRideRequest extends Document {
    customerId: Types.ObjectId;
    driverId?: Types.ObjectId;
    vehicleId?: Types.ObjectId;

    origin: {
        address: string;
        coordinates: [number, number]; // [lng, lat]
    };
    destination: {
        address: string;
        coordinates: [number, number]; // [lng, lat]
    };

    status: RideStatus;
    price: number;
    distance?: number; // In km
    duration?: number; // In minutes

    requestedAt: Date;
    acceptedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
}

const RideRequestSchema = new Schema<IRideRequest>(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        driverId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        vehicleId: {
            type: Schema.Types.ObjectId,
            ref: "Vehicle",
        },
        origin: {
            address: { type: String, required: true },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        destination: {
            address: { type: String, required: true },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        status: {
            type: String,
            enum: Object.values(RideStatus),
            default: RideStatus.WAITING,
            index: true,
        },
        price: { type: Number, required: true },
        distance: { type: Number },
        duration: { type: Number },
        requestedAt: { type: Date, default: Date.now },
        acceptedAt: { type: Date },
        startedAt: { type: Date },
        completedAt: { type: Date },
    },
    { timestamps: true }
);

export const RideRequestModel =
    mongoose.models.RideRequest || model<IRideRequest>("RideRequest", RideRequestSchema);
