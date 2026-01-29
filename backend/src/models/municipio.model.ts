import { Schema, model, Document, Types } from "mongoose";

export interface MunicipioDocument extends Document {
    name: string;
    department: string;
    departmentId: Types.ObjectId;
    createdBy: Types.ObjectId;
    isActive: boolean;
    deactivatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MunicipioSchema = new Schema<MunicipioDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true // Asegura que no haya municipios duplicados por nombre
        },
        department: {
            type: String,
            required: true,
            trim: true
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: true,
            index: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        deactivatedAt: {
            type: Date
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtuals (si se requieren, por ejemplo, ciudades)
MunicipioSchema.virtual("cities", {
    ref: "City",
    localField: "_id",
    foreignField: "municipioId"
});

export const MunicipioModel =
    model<MunicipioDocument>("Municipio", MunicipioSchema);
