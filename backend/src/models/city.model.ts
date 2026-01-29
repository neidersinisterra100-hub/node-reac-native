import { Schema, model, Document, Types } from "mongoose";

export interface ICity extends Document {
    name: string;
    department: string;
    departmentId: Types.ObjectId;
    municipioId: Types.ObjectId;
    createdBy: Types.ObjectId;
    isActive: boolean;
}

const CitySchema = new Schema<ICity>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        department: { type: String, required: true, trim: true },
        departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },

        // 🔥 Link Jerárquico
        municipioId: {
            type: Schema.Types.ObjectId,
            ref: "Municipio",
            required: true,
            index: true
        },

        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const CityModel = model<ICity>("City", CitySchema);
