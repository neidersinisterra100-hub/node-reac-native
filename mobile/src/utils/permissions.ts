import { UserRole } from "../types/user";

export const canCreateTrips = (role?: UserRole) =>
  role === UserRole.OWNER;

export const canAccessSettings = (role?: UserRole) =>
  role === UserRole.OWNER;
