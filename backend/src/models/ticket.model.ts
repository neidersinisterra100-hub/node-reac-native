import { Schema, model, Types } from "mongoose";

const TicketSchema = new Schema(
  {
    trip: {
      type: Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },

    company: {
      type: Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    routeName: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    transport: {
      type: String,
      default: "lancha", // lancha | barco | metrera | bus
    },

    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const TicketModel = model("Ticket", TicketSchema);



// import { Schema, model, Types } from "mongoose";

// const TicketSchema = new Schema(
//   {
//     trip: {
//       type: Types.ObjectId,
//       ref: "Trip"
//     },
//     company: {
//       type: Types.ObjectId, ref: "Company"
//     },
//     user: {
//       type: Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     routeName: {
//       type: String,
//       required: true,
//     },

//     price: {
//       type: Number,
//       required: true,
//     },

//     transport: {
//       type: String,
//       default: "Lancha rápida",
//     },

//     code: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     date: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// export default model("TicketModel", TicketSchema);
