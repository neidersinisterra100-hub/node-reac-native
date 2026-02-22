import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { ListSkeleton } from "../components/ui/Skeletons";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ship, Calendar, Clock } from "lucide-react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { styled } from "nativewind";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import { tripService, Trip } from "../services/trip.service";
import { formatTimeAmPm } from "../utils/time";

const StyledView = styled(View);
const StyledText = styled(Text);

export default function AllTripsScreen() {
  const navigation = useNavigation<any>();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getAll();
      setTrips(data);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los viajes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handlePressTrip = (trip: Trip) => {
    if (!trip.isActive) {
      Alert.alert("Viaje no disponible", "Este viaje está desactivado");
      return;
    }

    if (!trip.route || typeof trip.route !== "object") {
      Alert.alert("Error", "Información de ruta incompleta");
      return;
    }

    navigation.navigate("SeatSelection", {
      tripId: trip._id ?? trip.id,
      routeName: `${trip.route.origin} - ${trip.route.destination}`,
      price: trip.price,
      date: trip.date,
      time: trip.departureTime,

      // 🔐 BLOQUEO POR CAPACIDAD
      capacity: trip.capacity,
      soldSeats: trip.soldSeats ?? 0, // backend
      isActive: trip.isActive,
    });
  };


  const renderItem = ({ item }: { item: Trip }) => {
    const isActive = item.isActive ?? true;


    const routeName =
      item.route && typeof item.route === "object"
        ? `${item.route.origin} - ${item.route.destination}`
        : "Ruta no definida";

    return (
      <TouchableOpacity
        disabled={!isActive}
        onPress={() => handlePressTrip(item)}
        className={`
       bg-white dark:bg-dark-surface
         border border-gray-200 dark:border-dark-border
          rounded-2xl p-4 mb-4
          ${!isActive ? "opacity-50" : ""}
         `}
      >
        {!isActive && (
          <StyledText className="text-xs text-red-500 font-bold mb-2">
            VIAJE NO DISPONIBLE
          </StyledText>
        )}

        {/* ===== HEADER ===== */}
        <StyledView className="flex-row items-center mb-3 space-x-3">
          <StyledView className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-xl">
            <Ship className="text-indigo-600 dark:text-indigo-400" size={24} />
          </StyledView>

          <StyledView className="flex-1">
            <StyledView className="flex-row flex-wrap items-center">
              <Text className="font-extrabold text-indigo-700 dark:text-indigo-400 text-lg leading-tight mr-2">
                {item.route && typeof item.route === "object" ? item.route.origin : "Origen"}
              </Text>

              <StyledView className="flex-row items-center">
                <Ship size={12} color="#64748b" style={{ marginRight: 4 }} />
                <Text className="text-sm text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                  {item.route && typeof item.route === "object" ? item.route.destination : "Destino"}
                </Text>
              </StyledView>
            </StyledView>

            <StyledView className="flex-row items-center mt-2">
              <StyledView className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                <Text className="text-[10px] text-nautic-primary font-black uppercase">
                  {item.company && typeof item.company === "object" ? item.company.name : "Empresa"}
                </Text>
              </StyledView>
            </StyledView>
          </StyledView>

          <StyledView className="bg-emerald-50 dark:bg-emerald-900 px-3 py-1 rounded-lg">
            <StyledText className="text-emerald-600 dark:text-emerald-400 font-bold">
              ${item.price}
            </StyledText>
          </StyledView>
        </StyledView>

        {/* ===== DETAILS ===== */}
        <StyledView className="flex-row justify-between border-t border-gray-100 dark:border-dark-border pt-3">
          <StyledView className="flex-row items-center space-x-1">
            <Calendar size={14} className="text-slate-500 dark:text-dark-textMuted" />
            <StyledText className="text-xs text-slate-600 dark:text-dark-textMuted">
              {format(new Date(item.date), "dd MMM", { locale: es })}
            </StyledText>
          </StyledView>

          <StyledView className="flex-row items-center space-x-1">
            <Clock size={14} className="text-slate-500 dark:text-dark-textMuted" />
            <StyledText className="text-xs text-slate-600 dark:text-dark-textMuted">
              {formatTimeAmPm(item.departureTime)}
            </StyledText>
          </StyledView>

          <StyledView className="flex-row items-center space-x-1">
            <Ship size={14} className="text-slate-500 dark:text-dark-textMuted" />
            <StyledText className="text-xs text-slate-600 dark:text-dark-textMuted">
              {item.transportType}
            </StyledText>
          </StyledView>
        </StyledView>
      </TouchableOpacity>
    );
  };

  return (
    <AppContainer>
      <AppHeader
        title="Próximos Zarpes"
        neon
        showBack
        showAvatar={false}
      />

      {loading ? (
        <ListSkeleton count={5} />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item, index) =>
            item._id || item.id || index.toString()
          }
          refreshing={loading}
          onRefresh={loadTrips}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <StyledView className="items-center mt-10">
              <StyledView className="w-16 h-16 bg-gray-100 dark:bg-dark-surface rounded-full items-center justify-center mb-4">
                <Ship size={32} className="text-slate-400" />
              </StyledView>
              <StyledText className="text-slate-500 dark:text-dark-textMuted">
                No hay viajes programados.
              </StyledText>
            </StyledView>
          }
          renderItem={renderItem}
        />
      )}
    </AppContainer>
  );
}



// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   ActivityIndicator,
//   TouchableOpacity,
// } from "react-native";
// import { styled } from "nativewind";
// import { useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { format } from "date-fns";
// import { es } from "date-fns/locale";
// import { Ship, Calendar, Clock } from "lucide-react-native";

// import { ScreenContainer } from "../components/ui/ScreenContainer";
// import { Card } from "../components/ui/Card";
// import { Button } from "../components/ui/Button";
// import { RootStackParamList } from "../navigation/types";
// import { getTrips, Trip } from "../services/trip.service";

// const StyledText = styled(Text);
// const StyledView = styled(View);

// export default function AllTripsScreen() {
//   const navigation =
//     useNavigation<NativeStackNavigationProp<RootStackParamList>>();

//   const [trips, setTrips] = useState<Trip[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadTrips();
//   }, []);

//   const loadTrips = async () => {
//     try {
//       setLoading(true);
//       const data = await getTrips(); // backend filtra activos
//       setTrips(data);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderItem = ({ item }: { item: Trip }) => (
//     <TouchableOpacity
//       className="mb-3 p-4"
//       onPress={() =>
//         navigation.navigate("TripDetails", {
//           tripId: item._id || item.id,
//         })
//       }
//     >
//       <StyledView className="flex-row justify-between items-start mb-2">
//         <StyledView className="flex-row items-center">
//           <StyledView className="bg-nautic-secondary p-2 rounded-lg mr-3">
//             <Ship size={20} color="#0B4F9C" />
//           </StyledView>

//           <StyledView>
//             <StyledText className="font-bold text-nautic-primary text-base">
//               {typeof item.route === "object"
//                 ? `${item.route.origin} - ${item.route.destination}`
//                 : "Ruta"}
//             </StyledText>

//             <StyledText className="text-xs text-gray-500">
//               {typeof item.company === "object"
//                 ? item.company.name
//                 : ""}
//             </StyledText>
//           </StyledView>
//         </StyledView>

//         <StyledText className="text-green-700 font-bold">
//           ${item.price}
//         </StyledText>
//       </StyledView>

//       <StyledView className="flex-row justify-between pt-2 border-t border-gray-100">
//         <StyledView className="flex-row items-center">
//           <Calendar size={14} color="#64748B" />
//           <StyledText className="ml-1 text-xs text-gray-500">
//             {format(new Date(item.date), "dd MMM", {
//               locale: es,
//             })}
//           </StyledText>
//         </StyledView>

//         <StyledView className="flex-row items-center">
//           <Clock size={14} color="#64748B" />
//           <StyledText className="ml-1 text-xs text-gray-500">
//             {item.departureTime}
//           </StyledText>
//         </StyledView>

//         <StyledText className="text-xs text-gray-500">
//           {item.transportType}
//         </StyledText>
//       </StyledView>
//     </TouchableOpacity>
//   );

//   return (
//     <ScreenContainer>
//       {loading ? (
//         <ActivityIndicator size="large" />
//       ) : (
//         <FlatList
//           data={trips}
//           keyExtractor={(item) => item._id || item.id}
//           renderItem={renderItem}
//           contentContainerStyle={{ padding: 16 }}
//           ListEmptyComponent={
//             <StyledView className="items-center mt-10">
//               <Ship size={48} color="#cbd5e1" />
//               <StyledText className="text-gray-400 mt-4">
//                 No hay viajes disponibles
//               </StyledText>
//             </StyledView>
//           }
//         />
//       )}
//     </ScreenContainer>
//   );
// }
