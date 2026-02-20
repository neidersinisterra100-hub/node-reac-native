import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface ICompanyInvitation extends Document {
    companyId: Types.ObjectId;
    email: string;
    token: string;
    expiresAt: Date;
    status: "pending" | "accepted" | "expired";
}

const CompanyInvitationSchema = new Schema<ICompanyInvitation>(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "expired"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Indexes
CompanyInvitationSchema.index({ token: 1 });
CompanyInvitationSchema.index({ companyId: 1, email: 1 }); // Prevent duplicates active invitations?

export const CompanyInvitationModel =
    mongoose.models.CompanyInvitation ||
    model<ICompanyInvitation>("CompanyInvitation", CompanyInvitationSchema);
