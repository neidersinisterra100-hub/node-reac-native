import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { styled } from "nativewind";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Ship,
  Calendar,
  Clock,
  Power,
  Trash2,
  Plus,
  ArrowLeft,
} from "lucide-react-native";

import { ScreenContainer } from "../components/ui/ScreenContainer";
import { Card } from "../components/ui/Card";
import { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  getTrips,
  deleteTrip,
  toggleTripActive,
} from "../services/trip.service";
import { Trip } from "../types/trip";
import { formatTimeAmPm } from "../utils/time";

/* ================= STYLED ================= */

const StyledText = styled(Text);
const StyledView = styled(View);

/* ================= ROUTE ================= */

type TripsScreenRouteProp = RouteProp<
  RootStackParamList,
  "Trips"
>;

/* =========================================================
   TRIPS SCREEN — OWNER ONLY
   ========================================================= */

export default function TripsScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();
  const route = useRoute<TripsScreenRouteProp>();

  const {
    routeId,
    routeName,
    companyName,
    routeActive = true,
    companyActive = true,
  } = route.params;

  const { user } = useAuth();
  const { isDark } = useTheme();

  /* =======================================================
     GUARDIA DE SEGURIDAD
     -------------------------------------------------------
     ❌ user / admin → NO pueden estar aquí
     ======================================================= */

  useEffect(() => {
    if (user?.role !== "owner") {
      navigation.replace("AllTrips");
      return;
    }

    loadTrips();
  }, []);

  /* =======================================================
     STATE
     ======================================================= */

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  /* =======================================================
     DATA
     ======================================================= */

  const loadTrips = async () => {
    try {
      setLoading(true);

      const allTrips = await getTrips();

      // Filtrar por ruta
      const filtered = allTrips.filter((t) => {
        if (typeof t.route === "string") {
          return t.route === routeId;
        }
        return (
          t.route?._id === routeId ||
          t.route?.id === routeId
        );
      });

      setTrips(filtered);
    } catch {
      Alert.alert(
        "Error",
        "No se pudieron cargar los viajes"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     ACTIONS
     ======================================================= */

  const resolveTripCompanyId = (trip: Trip): string | null => {
    if (typeof trip.company === "string") return trip.company;
    return trip.company?.id || trip.company?._id || null;
  };

  const handleToggle = async (trip: Trip) => {
    const tripId = trip._id || trip.id;
    const companyId = resolveTripCompanyId(trip);
    if (!tripId || !companyId) {
      Alert.alert("Error", "No se pudo identificar la empresa del viaje");
      return;
    }

    try {
      await toggleTripActive(tripId, companyId);

      setTrips((prev) =>
        prev.map((t) =>
          t._id === tripId || t.id === tripId
            ? { ...t, isActive: !t.isActive }
            : t
        )
      );
    } catch {
      Alert.alert(
        "Error",
        "No se pudo cambiar el estado del viaje"
      );
    }
  };

  const handleDelete = (trip: Trip) => {
    const tripId = trip._id || trip.id;
    const companyId = resolveTripCompanyId(trip);
    if (!tripId || !companyId) {
      Alert.alert("Error", "No se pudo identificar la empresa del viaje");
      return;
    }

    Alert.alert(
      "Eliminar viaje",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTrip(tripId, companyId);
              setTrips((prev) =>
                prev.filter(
                  (t) =>
                    (t._id || t.id) !== tripId
                )
              );
            } catch {
              Alert.alert(
                "Error",
                "No se pudo eliminar el viaje"
              );
            }
          },
        },
      ]
    );
  };

  /* =======================================================
     RENDER ITEM
     ======================================================= */

  const renderItem = ({ item }: { item: Trip }) => {
    const isActive = item.isActive;

    return (
      <Card
        className={`mb-3 p-4 ${
          !isActive
            ? "opacity-60 bg-gray-50"
            : ""
        }`}
      >
        <StyledView className="flex-row justify-between items-start mb-2">
          <StyledView className="flex-row items-center">
            <StyledView className="bg-nautic-secondary p-2 rounded-lg mr-3">
              <Ship size={20} color="#0B4F9C" />
            </StyledView>

            <StyledView>
              <StyledText className="font-bold text-nautic-primary text-base">
                {routeName}
              </StyledText>
              <StyledText className="text-xs text-gray-500">
                {companyName}
              </StyledText>
            </StyledView>
          </StyledView>

          <StyledView
            className={`px-2 py-1 rounded ${
              isActive
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            <StyledText
              className={`text-xs font-bold ${
                isActive
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {isActive ? "ACTIVO" : "INACTIVO"}
            </StyledText>
          </StyledView>
        </StyledView>

        {/* INFO */}
        <StyledView className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
          <StyledView className="flex-row items-center">
            <Calendar size={14} color="#64748B" />
            <StyledText className="ml-1 text-xs text-gray-500">
              {format(
                new Date(item.date),
                "dd MMM yyyy",
                { locale: es }
              )}
            </StyledText>
          </StyledView>

          <StyledView className="flex-row items-center">
            <Clock size={14} color="#64748B" />
            <StyledText className="ml-1 text-xs text-gray-500">
              {formatTimeAmPm(item.departureTime)}
            </StyledText>
          </StyledView>

          <StyledText className="text-xs text-gray-500">
            {item.transportType}
          </StyledText>
        </StyledView>

        {/* ACTIONS */}
        <StyledView className="flex-row justify-end mt-3 space-x-3 border-t border-gray-100 pt-2">
          <TouchableOpacity
            onPress={() => {
              if (!routeActive || !companyActive) {
                Alert.alert(
                  "Bloqueado",
                  "Empresa o ruta inactiva"
                );
                return;
              }
              handleToggle(item);
            }}
            className={`p-2 rounded-full ${
              isActive
                ? "bg-green-100"
                : "bg-gray-200"
            }`}
          >
            <Power
              size={18}
              color={
                isActive
                  ? "#15803d"
                  : "#9ca3af"
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item)}
            className="p-2 rounded-full bg-red-100"
          >
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </StyledView>
      </Card>
    );
  };

  /* =======================================================
     UI
     ======================================================= */

  return (
    <ScreenContainer withPadding={false}>
      {/* HEADER */}
      <StyledView
        className={`${
          isDark
            ? "bg-dark-surface"
            : "bg-nautic-primary"
        } pt-12 pb-6 px-6 rounded-b-[24px] mb-4 flex-row items-center gap-4`}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-white/20 p-2 rounded-full"
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <StyledText className="text-white text-xl font-bold">
            Viajes Programados
          </StyledText>
          <StyledText className="text-white/70 text-sm">
            {routeName}
          </StyledText>
        </View>
      </StyledView>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0B4F9C"
          className="mt-8"
        />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) =>
            item._id || item.id
          }
          renderItem={renderItem}
          contentContainerStyle={{
            padding: 16,
          }}
          ListEmptyComponent={
            <StyledView className="items-center mt-10">
              <Ship size={48} color="#cbd5e1" />
              <StyledText className="text-gray-400 mt-4 text-center">
                No hay viajes creados para esta ruta.
              </StyledText>
            </StyledView>
          }
        />
      )}

      {/* FAB — CREATE TRIP */}
      {!loading && (
        <StyledView className="absolute bottom-6 right-6">
          <TouchableOpacity
            className="bg-nautic-accent w-14 h-14 rounded-full items-center justify-center shadow-lg"
            onPress={() =>
              navigation.navigate("CreateTrip", {
                routeId,
                routeName,
              })
            }
          >
            <Plus size={30} color="white" />
          </TouchableOpacity>
        </StyledView>
      )}
    </ScreenContainer>
  );
}



// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
// import { styled } from 'nativewind';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { format } from 'date-fns';
// import { es } from 'date-fns/locale';
// import { Ship, Calendar, Clock, MapPin, Power, Trash2, Plus, ArrowLeft } from 'lucide-react-native';

// import { ScreenContainer } from '../components/ui/ScreenContainer';
// import { Card } from '../components/ui/Card';
// import { Button } from '../components/ui/Button'; // Assuming Button exists or reusing similar
// import { RootStackParamList } from '../navigation/types';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
// import { getTrips, deleteTrip, toggleTripActive, Trip } from '../services/trip.service';

// const StyledText = styled(Text);
// const StyledView = styled(View);

// type TripsScreenRouteProp = RouteProp<RootStackParamList, 'Trips'>;

// export default function TripsScreen() {
//   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
//   const route = useRoute<TripsScreenRouteProp>();
 
//   // Params with defaults
//   const { routeId, routeName, companyName, routeActive = true, companyActive = true } = route.params;

//   const { user } = useAuth();
//   const { isDark } = useTheme();
//   const isOwner = user?.role === 'owner' || user?.role === 'admin';

//   const [trips, setTrips] = useState<Trip[]>([]);
//   const [loading, setLoading] = useState(true);

//  useEffect(() => {
//   // 🔐 USUARIO NORMAL → FLUJO NUEVO
//   if (!isOwner) {
//     navigation.replace("AllTrips", {
//       origin: undefined,
//       destination: undefined,
//     });
//     return;
//   }

//   // 🏢 OWNER / ADMIN → GESTIÓN
//   loadTrips();
// }, []);

//   const loadTrips = async () => {
//     try {
//       setLoading(true);
//       const allTrips = await getTrips();
//       // Filter by routeId
//       const filtered = allTrips.filter((t) => {
//         if (typeof t.route === "string") {
//           return t.route === routeId;
//         }
//         return t.route?._id === routeId || t.route?.id === routeId;
//       });
//       setTrips(filtered);
//     } catch {
//       Alert.alert("Error", "No se pudieron cargar los viajes");
//     } finally {
//       setLoading(false);
//     }
//   };

// const handleToggle = async (tripId: string) => {
//   try {
//     await toggleTripActive(tripId);

//     setTrips(prev =>
//       prev.map(t =>
//         (t._id === tripId || t.id === tripId)
//           ? { ...t, isActive: !t.isActive }
//           : t
//       )
//     );
//   } catch {
//     Alert.alert(
//       "Error",
//       "No se pudo cambiar el estado. Verifica empresa o ruta."
//     );
//   }
// };

//   const handleDelete = (id: string) => {
//     Alert.alert("Eliminar Viaje", "¿Estás seguro?", [
//       { text: "Cancelar", style: "cancel" },
//       {
//         text: "Eliminar",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await deleteTrip(id);
//             setTrips((prev) => prev.filter((t) => (t._id || t.id) !== id));
//           } catch {
//             Alert.alert("Error", "No se pudo eliminar");
//           }
//         },
//       },
//     ]);
//   };

//   const handlePressTrip = (trip: Trip) => {
//     if (isOwner) return;

//     // User booking flow logic (Old logic forwarded to ConfirmTicketModal, 
//     // but new flow uses TripDetailScreen. We should probably redirect there for consistency 
//     // if this screen is strictly for Company Management or Legacy User flow. 
//     // But assuming this is Company View mostly now. 
//     // If user accesses this, they might expect booking. 
//     // Let's keep legacy behavior for now or redirect to TripDetails?
//     // Given 'TripDetails' exists in new flow, let's try to use it if possible, 
//     // but TripDetails expects 'tripId'.

//     // navigation.navigate('TripDetails', { tripId: trip._id || trip.id });

//     // Using Legacy Modal for safety as requested "No Business Logic Changes" 
//     // implies minimizing disruption.
//     navigation.navigate("ConfirmTicketModal" as any, { // Cast as any if Type issue persists
//       tripId: trip._id || trip.id,
//       routeName: routeName || "Ruta seleccionada",
//       price: trip.price,
//       date: trip.date,
//       time: trip.departureTime,
//     });
//   };

//   const renderItem = ({ item }: { item: Trip }) => {
//     const isActive = item.isActive ?? true; // Default to true if undefined for UI
//     return (
//       <Card className={`mb-3 p-4 ${!isActive ? 'opacity-70 bg-gray-50' : ''}`}>
//         <TouchableOpacity
//           activeOpacity={isOwner ? 1 : 0.7}
//           onPress={() => handlePressTrip(item)}
//         >
//           <StyledView className="flex-row justify-between items-start mb-2">
//             <StyledView className="flex-row items-center">
//               <StyledView className="bg-nautic-secondary p-2 rounded-lg mr-2">
//                 <Ship size={20} color="#0B4F9C" />
//               </StyledView>
//               <StyledView>
//                 <StyledText className="font-bold text-nautic-primary text-base">
//                   {routeName}
//                 </StyledText>
//                 <StyledText className="text-xs text-gray-500">
//                   {companyName}
//                 </StyledText>
//               </StyledView>
//             </StyledView>
//             {isOwner ? (
//               <StyledView className={`px-2 py-1 rounded ${isActive ? 'bg-green-100' : 'bg-red-100'}`}>
//                 <StyledText className={`text-xs font-bold ${isActive ? 'text-green-700' : 'text-red-700'}`}>
//                   {isActive ? 'ACTIVO' : 'INACTIVO'}
//                 </StyledText>
//               </StyledView>
//             ) : (
//               <StyledView className="bg-green-50 px-2 py-1 rounded">
//                 <StyledText className="text-green-700 font-bold">${item.price}</StyledText>
//               </StyledView>
//             )}
//           </StyledView>

//           <StyledView className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
//             <StyledView className="flex-row items-center">
//               <Calendar size={14} color="#64748B" />
//               <StyledText className="text-xs text-gray-500 ml-1">
//                 {item.date ? format(new Date(item.date), "dd MMM", { locale: es }) : "N/A"}
//               </StyledText>
//             </StyledView>
//             <StyledView className="flex-row items-center">
//               <Clock size={14} color="#64748B" />
//               <StyledText className="text-xs text-gray-500 ml-1">{item.departureTime}</StyledText>
//             </StyledView>
//             <StyledText className="text-xs text-gray-500">{item.transportType}</StyledText>
//           </StyledView>
//         </TouchableOpacity>

//         {isOwner && (
//           <StyledView className="flex-row justify-end mt-3 space-x-3 border-t border-gray-100 pt-2">
//             <TouchableOpacity
//               onPress={() => {
//                 if ((!routeActive || !companyActive) && !isActive) {
//                   Alert.alert("Bloqueado", "Empresa o Ruta inactiva.");
//                   return;
//                 }
//                 handleToggle(item._id || item.id);

//               }}
//               className={`p-2 rounded-full ${isActive ? 'bg-green-100' : 'bg-gray-200'}`}
//             >
//               <Power size={18} color={isActive ? '#15803d' : '#9ca3af'} />
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={() => handleDelete(item._id || item.id)}
//               className="p-2 rounded-full bg-red-100"
//             >
//               <Trash2 size={18} color="#ef4444" />
//             </TouchableOpacity>
//           </StyledView>
//         )}
//       </Card>
//     );
//   };

//   return (
//     <ScreenContainer withPadding={false}>
//       <StyledView className={`${isDark ? 'bg-dark-surface' : 'bg-nautic-primary'} pt-12 pb-6 px-6 rounded-b-[24px] shadow-sm mb-4 flex-row items-center gap-4`}>
//         <TouchableOpacity onPress={() => navigation.goBack()} className="bg-white/20 p-2 rounded-full">
//           <ArrowLeft size={24} color="white" />
//         </TouchableOpacity>
//         <View style={{ flex: 1 }}>
//           <StyledText className="text-white text-xl font-bold">Viajes Programados</StyledText>
//           <StyledText className="text-white/70 text-sm">{routeName}</StyledText>
//         </View>
//       </StyledView>

//       {isOwner && (!routeActive || !companyActive) && (
//         <StyledView className="mx-4 mb-4 bg-orange-50 p-3 rounded-lg border border-orange-200 flex-row items-center">
//           <StyledText className="mr-2">⚠️</StyledText>
//           <StyledText className="text-orange-800 text-xs flex-1">
//             {!companyActive ? "Empresa inactiva." : "Ruta inactiva."} No puedes activar viajes.
//           </StyledText>
//         </StyledView>
//       )}

//       {loading ? (
//         <ActivityIndicator size="large" color="#0B4F9C" className="mt-8" />
//       ) : (
//         <FlatList
//           data={trips}
//           keyExtractor={(item, index) => item.id || item._id || index.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={{ padding: 16 }}
//           ListEmptyComponent={
//             <StyledView className="items-center mt-10">
//               <Ship size={48} color="#cbd5e1" />
//               <StyledText className="text-gray-400 mt-4 text-center">
//                 {isOwner ? "Programa viajes para esta ruta." : "No hay viajes programados."}
//               </StyledText>
//             </StyledView>
//           }
//         />
//       )}

//       {isOwner && !loading && (
//         <StyledView className="absolute bottom-6 right-6">
//           <TouchableOpacity
//             className="bg-nautic-accent w-14 h-14 rounded-full items-center justify-center shadow-lg elevation-5"
//             onPress={() => navigation.navigate("CreateTrip", { routeId, routeName })}
//           >
//             <Plus size={30} color="white" />
//           </TouchableOpacity>
//         </StyledView>
//       )}
//     </ScreenContainer>
//   );
// };
