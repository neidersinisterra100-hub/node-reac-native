import { User } from "../types/user";

export const isAdmin = (user: User | null) =>
  !!user && user.role === "admin";

export const isOwner = (user: User | null) =>
  !!user && user.role === "owner";

export const isAdminOrOwner = (user: User | null) =>
  !!user && (user.role === "admin" || user.role === "owner");


// import { UserRole } from "../types/user";

// export const canCreateTrips = (role?: UserRole) =>
//   role === UserRole.OWNER;

// export const canAccessSettings = (role?: UserRole) =>
//   role === UserRole.OWNER;
