import { Schema, model, Types } from "mongoose";

const TicketSchema = new Schema(
  {
    trip: {
      type: Types.ObjectId,
      ref: "Trip"
    },
    company: {
      type: Types.ObjectId, ref: "Company"
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    routeName: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    transport: {
      type: String,
      default: "Lancha rápida",
    },

    code: {
      type: String,
      required: true,
      unique: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default model("TicketModel", TicketSchema);
