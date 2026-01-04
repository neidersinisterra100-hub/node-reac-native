import { User } from "../types/user";

export const isAdminOrOwner = (user: User | null) => {
  return !!user && (user.role === "admin" || user.role === "owner");
};
