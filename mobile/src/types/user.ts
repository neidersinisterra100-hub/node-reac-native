export enum UserRole {
  OWNER = "OWNER",
  DRIVER = "DRIVER",
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
