export type UserRole = "user" | "owner" | "admin" | "super_owner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
