export type UserRole = "user" | "owner" | "admin";

export interface AuthUser {
  id: string;
  role: UserRole;
}
