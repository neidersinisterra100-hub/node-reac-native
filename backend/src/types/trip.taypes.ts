import { Types } from "mongoose";

export interface TripWithSoldSeats {
  _id: Types.ObjectId;
  soldSeats: number;
  [key: string]: any; // 👈 permite el resto del DTO sin reescribir todo
}
