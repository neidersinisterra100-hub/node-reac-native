import { Schema, model, Types } from "mongoose";

const CompanySchema = new Schema(
  {
    name: { type: String, required: true },
    owner: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      default: 0, // 💰 dinero acumulado
    },
  },
  { timestamps: true }
);

export const CompanyModel = model(
  "Company",
  CompanySchema
);
