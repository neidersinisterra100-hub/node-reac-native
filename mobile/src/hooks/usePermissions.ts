import { useAuth } from "../context/AuthContext";
import {
  isAdmin,
  isOwner,
  isAdminOrOwner,
} from "../utils/permissions";

export function usePermissions() {
  const { user } = useAuth();

  return {
    user,
    isAdmin: isAdmin(user),
    isOwner: isOwner(user),
    isAdminOrOwner: isAdminOrOwner(user),
  };
}
