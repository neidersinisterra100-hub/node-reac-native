import { Schema, model, Document } from "mongoose";

export type UserRole = "user" | "owner" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "owner", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", UserSchema);



// import { Schema, model, Document } from "mongoose";

// export interface IUser extends Document {
//   name: string;
//   email: string;
//   password: string;
//   role: "OWNER" | "USER";
// }

// const UserSchema = new Schema<IUser>(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: {
//       type: String,
//       enum: ["OWNER", "USER"],
//       default: "USER",
//     },
//   },
//   { timestamps: true }
// );

// export const UserModel = model<IUser>("User", UserSchema);
