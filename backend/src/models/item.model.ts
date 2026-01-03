import { Schema, model } from "mongoose";

const ItemSchema = new Schema({
  name: { type: String, required: true },
  schedule: { type: Date, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  price: { type: Number, required: true },
});

export const ItemModel = model("Item", ItemSchema);
