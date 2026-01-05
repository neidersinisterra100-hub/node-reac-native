import { Schema, model, Types } from "mongoose";

const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },

    transportTypes: {
      type: [String],
      default: ["lancha"], // lancha | barco | metrera | bus | etc
    },
  },
  { timestamps: true }
);

export const CompanyModel = model(
  "Company",
  CompanySchema
);



// import { Schema, model, Types } from "mongoose";

// const CompanySchema = new Schema(
//   {
//     name: { type: String, required: true },
//     owner: {
//       type: Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     balance: {
//       type: Number,
//       default: 0, // 💰 dinero acumulado
//     },
//   },
//   { timestamps: true }
// );

// export const CompanyModel = model(
//   "Company",
//   CompanySchema
// );
