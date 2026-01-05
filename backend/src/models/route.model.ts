import { Schema, model, Types } from "mongoose";

const RouteSchema = new Schema(
  {
    origin: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: Types.ObjectId,
      ref: "Company",
      required: true,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    active: {
      type: Boolean,
      default: true, // 👈 visible por defecto
    },
  },
  { timestamps: true }
);

export const RouteModel = model(
  "Route",
  RouteSchema
);


// import { Schema, model, Types } from "mongoose";

// const RouteSchema = new Schema(
//   {
//     origin: String,
//     destination: String,
//     company: {
//       type: Types.ObjectId,
//       ref: "Company",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// export const RouteModel = model(
//   "Route",
//   RouteSchema
// );


