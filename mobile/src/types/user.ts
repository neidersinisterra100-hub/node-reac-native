export enum UserRole {
  // USER = "user",
  // ADMIN = "admin",
  USER = "user",
  ADMIN = "admin",
  OWNER = "owner",
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ownerId?: string;
};


// export type UserRole = "OWNER" | "DRIVER" | "ADMIN";

// export type User = {
//   id: string;
//   name: string;
//   role: UserRole;

//   // Solo aplica si role === "OWNER"
//   ownerId?: string;
// };
