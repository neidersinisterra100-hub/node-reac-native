import { useAuth } from "../context/AuthContext";

export function useOwnerActions() {
  const { user } = useAuth();

  const isOwner = user?.role === "owner";

  return {
    isOwner,
    canCreate: isOwner,
  };
}



// import { useAuth } from "../context/AuthContext";
// import { canCreateTrip } from "../utils/canCreateTrip";

// export function useOwnerActions() {
//   const { user } = useAuth();

//   const isOwner = user?.role === "OWNER";

//   const canCreate =
//     isOwner && user?.ownerId
//       ? canCreateTrip(user.ownerId)
//       : false;

//   return {
//     isOwner,
//     canCreate,
//   };
// }
