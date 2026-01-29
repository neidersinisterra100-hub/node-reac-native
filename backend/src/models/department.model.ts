import { Schema, model, Document, Types } from "mongoose";

export interface DepartmentDocument extends Document {
    name: string;
    createdBy: Types.ObjectId;
    isActive: boolean;
    deactivatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const DepartmentSchema = new Schema<DepartmentDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
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

// Virtuals for cascading / reverse lookup if needed later
DepartmentSchema.virtual("municipios", {
    ref: "Municipio",
    localField: "_id",
    foreignField: "departmentId"
});

export const DepartmentModel = model<DepartmentDocument>("Department", DepartmentSchema);
