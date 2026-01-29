// import mongoose, { Schema, model, Types, Document } from "mongoose";

// /* =========================================================
//    ROLES
//    ========================================================= */
// export type UserRole = "user" | "owner" | "admin" | "super_owner";

// /* =========================================================
//    USER DOCUMENT (TS)
//    ========================================================= */
// export interface UserDocument extends Document {
//   name: string;
//   email: string;
//   password: string;
//   role: UserRole;
//   verified: boolean;

//   // 🔥 CLAVE PARA JWT / OWNERSHIP
//   companyId?: Types.ObjectId | null;

//   // FUTURO
//   managedCompanies?: Types.ObjectId[];
// }

// /* =========================================================
//    SCHEMA
//    ========================================================= */
// const UserSchema = new Schema<UserDocument>(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },

//     role: {
//       type: String,
//       enum: ["user", "owner", "admin", "super_owner"],
//       default: "user",
//     },

//     verified: {
//       type: Boolean,
//       default: false,
//     },

//     companyId: {
//       type: Schema.Types.ObjectId,
//       ref: "Company",
//       default: null,
//       index: true,
//     },

//     managedCompanies: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "Company",
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// /* =========================================================
//    EXPORT ÚNICO
//    ========================================================= */
// export const UserModel =
//   mongoose.models.User || model<UserDocument>("User", UserSchema);
