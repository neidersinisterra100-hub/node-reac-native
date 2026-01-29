import { Schema, model, Types } from "mongoose";

const auditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      index: true, 
      // ejemplos:
      // department.create
      // municipio.deactivate
      // trip.activate
      // trip.auto_deactivate
    },

    entity: {
      type: String,
      required: true,
      index: true,
      // department | municipio | city | company | route | trip | schedule
    },

    entityId: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },

    performedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    source: {
      type: String,
      enum: ["manual", "system", "n8n"],
      default: "manual",
      index: true,
    },

    metadata: {
      type: Object,
    },
  },
  { timestamps: true }
);

export const AuditLogModel =
  model("AuditLog", auditLogSchema);
