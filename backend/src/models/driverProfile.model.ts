import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IDriverProfile extends Document {
    userId: Types.ObjectId;
    vehicleId?: Types.ObjectId;
    rating: number;
    totalRatings: number;
    isOnline: boolean;
    isAvailable: boolean; // Not in a ride
    currentLocation?: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
}

const DriverProfileSchema = new Schema<IDriverProfile>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        vehicleId: {
            type: Schema.Types.ObjectId,
            ref: "Vehicle",
        },
        rating: { type: Number, default: 5.0 },
        totalRatings: { type: Number, default: 0 },
        isOnline: { type: Boolean, default: false },
        isAvailable: { type: Boolean, default: true },
        currentLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },
    },
    { timestamps: true }
);

// Geo-index for spatial queries
DriverProfileSchema.index({ currentLocation: "2dsphere" });

export const DriverProfileModel =
    mongoose.models.DriverProfile ||
    model<IDriverProfile>("DriverProfile", DriverProfileSchema);
