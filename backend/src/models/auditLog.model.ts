import { Schema, model, Types } from "mongoose";

const auditLogSchema = new Schema(
  {
    action: { type: String, required: true }, // company.deactivate, trip.activate
    entity: { type: String, required: true }, // company | route | trip
    entityId: { type: Types.ObjectId, required: true },
    performedBy: { type: Types.ObjectId, ref: "User", required: true },
    metadata: { type: Object },
  },
  { timestamps: true }
);

export const AuditLogModel = model("AuditLog", auditLogSchema);
