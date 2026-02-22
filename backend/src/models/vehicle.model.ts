import mongoose, { Schema, model, Document, Types } from "mongoose";

export enum VehicleType {
    STANDARD = "standard",
    XL = "xl",
    PREMIUM = "premium",
}

export interface IVehicle extends Document {
    brand: string;
    model: string;
    plate: string;
    color: string;
    type: VehicleType;
    ownerId: Types.ObjectId; // User (Driver) ID
    active: boolean;
}

const VehicleSchema = new Schema<IVehicle>(
    {
        brand: { type: String, required: true },
        model: { type: String, required: true },
        plate: { type: String, required: true, unique: true },
        color: { type: String, required: true },
        type: {
            type: String,
            enum: Object.values(VehicleType),
            default: VehicleType.STANDARD,
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const VehicleModel =
    mongoose.models.Vehicle || model<IVehicle>("Vehicle", VehicleSchema);
