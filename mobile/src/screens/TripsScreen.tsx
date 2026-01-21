import {
  View,
  FlatList,
  Alert,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ship, Calendar, Clock, MapPin } from "lucide-react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { IconButton } from "react-native-paper";

import AppContainer from "../components/ui/AppContainer";
import PrimaryButton from "../components/ui/PrimaryButton";
import { getTrips, deleteTrip, toggleTripActive, Trip } from "../services/trip.service";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

/* =========================================================
   TRIPS SCREEN
   ========================================================= */

/**
 * TripsScreen
 *
 * Responsabilidad:
 * - Mostrar viajes de una ruta específica
 * - Owner/Admin: crear y eliminar viajes
 * - Usuario normal: seleccionar viaje para comprar ticket
 */
export default function TripsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  /* =========================
     PARAMS DE NAVEGACIÓN
     ========================= */

  /**
   * Estos params vienen desde la pantalla anterior (rutas)
   * ⚠️ Más adelante los tiparemos con RootStackParamList
   */
  const { routeId, routeName, companyName, routeActive = true, companyActive = true } = route.params;

  /**
   * Regla de negocio:
   * - Owner / Admin → gestiona viajes
   * - User → compra tickets
   */
  const isOwner =
    user?.role === "owner" || user?.role === "admin";

  /* =========================
     ESTADO
     ========================= */

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  /* =======================================================
     CARGA DE VIAJES
     ======================================================= */

  const loadTrips = async () => {
    try {
      setLoading(true);

      /**
       * Backend:
       * - idealmente debería filtrar por routeId
       * - por ahora filtramos en frontend
       */
      const allTrips = await getTrips();

      const filtered = allTrips.filter((t) => {
        if (typeof t.route === "string") {
          return t.route === routeId;
        }

        // route viene populado
        return t.route?._id === routeId;
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

  useEffect(() => {
    loadTrips();
  }, []);

  /* =======================================================
     ACCIONES
     ======================================================= */

  const handleToggle = async (tripId: string, currentStatus: boolean) => {
    try {
        await toggleTripActive(tripId, !currentStatus);
        setTrips(prev => prev.map(t => (t._id === tripId || t.id === tripId) ? { ...t, isActive: !currentStatus } : t));
    } catch (e) {
        Alert.alert("Error", "No se pudo cambiar el estado. Verifica que la empresa y ruta estén activas.");
    }
  };

  /**
   * Eliminar viaje (solo owner/admin)
   */
  const handleDelete = async (id: string) => {
    Alert.alert(
      "Eliminar Viaje",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTrip(id);
              setTrips((prev) =>
                prev.filter((t) => t._id !== id)
              );
            } catch {
              Alert.alert(
                "Error",
                "No se pudo eliminar"
              );
            }
          },
        },
      ]
    );
  };

  /**
   * Seleccionar viaje
   *
   * - User → abre compra de ticket
   * - Owner/Admin → no hace nada
   */
  const handlePressTrip = (trip: Trip) => {
    if (isOwner) return;

    navigation.navigate("ConfirmTicketModal", {
      tripId: trip._id,
      routeName: routeName || "Ruta seleccionada",
      price: trip.price,
      date: trip.date,
      time: trip.departureTime,
    });
  };

  /* =======================================================
     RENDER ITEM
     ======================================================= */

  const renderItem = ({
    item,
  }: {
    item: Trip;
  }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePressTrip(item)}
      activeOpacity={isOwner ? 1 : 0.7}
    >
      {/* ================= HEADER ================= */}
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ship size={24} color={colors.accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.companyText}>
            {companyName}
          </Text>
          {/* Status Text for mobile management */}
          {isOwner && (
               <Text style={{ fontSize: 10, color: item.isActive ? '#16a34a' : '#9ca3af', fontWeight: 'bold' }}>
                   {item.isActive ? "ACTIVO" : "INACTIVO"}
               </Text>
          )}
        </View>

        {isOwner ? (
          <View style={{ flexDirection: 'row' }}>
             <IconButton
                icon="power"
                iconColor={
                    (!routeActive || !companyActive) && !item.isActive
                    ? "#d1d5db"
                    : item.isActive ? "#10b981" : "#9ca3af"
                }
                size={20}
                onPress={() => {
                    if ((!routeActive || !companyActive) && !item.isActive) {
                        const reason = !companyActive ? "Empresa inactiva" : "Ruta inactiva";
                        Alert.alert("Bloqueado", `No puedes activar este viaje.\n\nMotivo: ${reason}`);
                        return;
                    }
                    handleToggle(item._id || item.id, !!item.isActive);
                }}
             />
             <IconButton
                icon="delete-outline"
                iconColor="#ef4444"
                size={20}
                onPress={() => handleDelete(item._id || item.id)}
             />
          </View>
        ) : (
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              ${item.price}
            </Text>
          </View>
        )}
      </View>

      {/* ================= DETAILS ================= */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Calendar size={14} color="#6b7280" />
          <Text style={styles.detailText}>
            {item.date
              ? format(
                  new Date(item.date),
                  "dd MMM",
                  { locale: es }
                )
              : "N/A"}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.detailText}>
            {item.departureTime}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ship size={14} color="#6b7280" />
          <Text style={styles.detailText}>
            {item.transportType || "Lancha"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <AppContainer>
      {isOwner && (!routeActive || !companyActive) && (
          <View style={{ margin: 16, marginBottom: 0, padding: 10, backgroundColor: '#fff7ed', borderRadius: 8, borderWidth: 1, borderColor: '#ffedd5', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text>⚠️</Text>
              <Text style={{ color: '#c2410c', fontSize: 13, flex: 1 }}>
                 {!companyActive ? "La empresa está inactiva." : "La ruta está inactiva."} No puedes activar viajes.
              </Text>
          </View>
      )}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item, index) => item.id || item._id || index.toString()}
          refreshing={loading}
          onRefresh={loadTrips}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingTop: 10,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isOwner ? (
              <View style={{ marginBottom: 20 }}>
                <PrimaryButton
                  label="Nuevo Viaje"
                  onPress={() =>
                    navigation.navigate(
                      "CreateTrip",
                      { routeId, routeName }
                    )
                  }
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIcon}>
                <MapPin
                  size={32}
                  color="#9ca3af"
                />
              </View>
              <Text style={styles.emptyText}>
                {isOwner
                  ? "Programa viajes para esta ruta."
                  : "No hay viajes programados."}
              </Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}
    </AppContainer>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const styles = StyleSheet.create({
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconBox: {
    backgroundColor: "#e0f2f1",
    padding: 12,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  companyText: {
    fontSize: 12,
    color: "#6b7280",
  },
  priceTag: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: "#059669",
    fontWeight: "bold",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#4b5563",
  },
  emptyBox: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#f3f4f6",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
  },
});



// import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
// import { useEffect, useState } from "react";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { Ship, Calendar, Clock, MapPin } from "lucide-react-native";
// import { format } from "date-fns";
// import { es } from "date-fns/locale";
// import { IconButton } from "react-native-paper";

// import AppContainer from "../components/ui/AppContainer";
// import AppHeader from "../components/ui/AppHeader";
// import PrimaryButton from "../components/ui/PrimaryButton";
// import { getTrips, deleteTrip, Trip } from "../services/trip.service";
// import { useAuth } from "../context/AuthContext";
// import { colors } from "../theme/colors";

// export default function TripsScreen() {
//   const navigation = useNavigation<any>();
//   const route = useRoute<any>();
//   const { user } = useAuth();

//   // Params
//   const { routeId, routeName, companyName } = route.params;
//   const isOwner = user?.role === "owner" || user?.role === "admin";

//   const [trips, setTrips] = useState<Trip[]>([]);
//   const [loading, setLoading] = useState(false);

//   /* ================= LOAD ================= */

//   const loadTrips = async () => {
//     try {
//       setLoading(true);
//       const allTrips = await getTrips();
//       // Filtrar localmente por routeId
//       const filtered = allTrips.filter(t => {
//           if (typeof t.route === 'string') return t.route === routeId;
//           // @ts-ignore
//           return t.route?._id === routeId;
//       });
//       setTrips(filtered);
//     } catch {
//       Alert.alert("Error", "No se pudieron cargar los viajes");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadTrips();
//   }, []);

//   /* ================= ACTIONS ================= */

//   const handleDelete = async (id: string) => {
//       Alert.alert("Eliminar Viaje", "¿Estás seguro?", [
//           { text: "Cancelar", style: "cancel" },
//           { 
//               text: "Eliminar", 
//               style: "destructive", 
//               onPress: async () => {
//                   try {
//                       await deleteTrip(id);
//                       setTrips(prev => prev.filter(t => t._id !== id));
//                   } catch {
//                       Alert.alert("Error", "No se pudo eliminar");
//                   }
//               }
//           }
//       ]);
//   };

//   const handlePressTrip = (trip: Trip) => {
//       if (isOwner) return; // Owner no compra tickets aquí, solo gestiona

//       navigation.navigate("ConfirmTicketModal", {
//           tripId: trip._id,
//           routeName: routeName || "Ruta seleccionada",
//           price: trip.price,
//           date: trip.date,
//           time: trip.departureTime
//       });
//   };

//   /* ================= RENDER ITEM ================= */

//   const renderItem = ({ item }: { item: Trip }) => (
//     <TouchableOpacity 
//         style={styles.card}
//         onPress={() => handlePressTrip(item)}
//         activeOpacity={isOwner ? 1 : 0.7}
//     >
//       <View style={styles.cardHeader}>
//           <View style={styles.iconBox}>
//               <Ship size={24} color={colors.accent} />
//           </View>
//           <View style={{flex: 1}}>
//               <Text style={styles.cardTitle}>{routeName}</Text>
//               <Text style={styles.companyText}>{companyName}</Text>
//           </View>
          
//           {isOwner ? (
//               <IconButton 
//                   icon="delete-outline" 
//                   iconColor="#ef4444" 
//                   size={20} 
//                   onPress={() => handleDelete(item._id)}
//               />
//           ) : (
//               <View style={styles.priceTag}>
//                   <Text style={styles.priceText}>${item.price}</Text>
//               </View>
//           )}
//       </View>

//       <View style={styles.detailsRow}>
//           <View style={styles.detailItem}>
//               <Calendar size={14} color="#6b7280" />
//               <Text style={styles.detailText}>
//                   {item.date ? format(new Date(item.date), "dd MMM", { locale: es }) : "N/A"}
//               </Text>
//           </View>
//           <View style={styles.detailItem}>
//               <Clock size={14} color="#6b7280" />
//               <Text style={styles.detailText}>{item.departureTime}</Text>
//           </View>
//           <View style={styles.detailItem}>
//               <Ship size={14} color="#6b7280" />
//               <Text style={styles.detailText}>{item.transportType || "Lancha"}</Text>
//           </View>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <AppContainer>
//       {/* <AppHeader title={routeName || "Viajes"} neon={true} /> */}

//       {loading ? (
//            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
//               <ActivityIndicator size="large" color={colors.primary} />
//           </View>
//       ) : (
//         <FlatList
//           data={trips}
//           keyExtractor={(item) => item._id}
//           refreshing={loading}
//           onRefresh={loadTrips}
//           contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
//           showsVerticalScrollIndicator={false}
//           ListHeaderComponent={
//             isOwner ? (
//                 <View style={{ marginBottom: 20 }}>
//                     <PrimaryButton
//                         label="Nuevo Viaje"
//                         onPress={() => navigation.navigate("CreateTrip", { routeId, routeName })}
//                     />
//                 </View>
//             ) : null
//           }
//           ListEmptyComponent={
//              <View style={{alignItems: 'center', marginTop: 40}}>
//                  <View style={styles.emptyIcon}>
//                     <MapPin size={32} color="#9ca3af" />
//                  </View>
//                 <Text style={{color: '#6b7280', textAlign: 'center'}}>
//                     {isOwner ? "Programa viajes para esta ruta." : "No hay viajes programados."}
//                 </Text>
//             </View>
//           }
//           renderItem={renderItem}
//         />
//       )}
//     </AppContainer>
//   );
// }

// const styles = StyleSheet.create({
//     card: {
//         backgroundColor: 'white',
//         borderRadius: 16,
//         padding: 16,
//         marginBottom: 16,
//         borderWidth: 1,
//         borderColor: '#e5e7eb',
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.05,
//         shadowRadius: 4,
//         elevation: 2,
//     },
//     cardHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 12,
//         marginBottom: 12,
//     },
//     iconBox: {
//         backgroundColor: '#e0f2f1', 
//         padding: 12,
//         borderRadius: 12,
//     },
//     cardTitle: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: '#1f2937',
//     },
//     companyText: {
//         fontSize: 12,
//         color: '#6b7280',
//     },
//     priceTag: {
//         backgroundColor: '#ecfdf5',
//         paddingHorizontal: 10,
//         paddingVertical: 4,
//         borderRadius: 8,
//     },
//     priceText: {
//         color: '#059669',
//         fontWeight: 'bold',
//     },
//     detailsRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         borderTopWidth: 1,
//         borderTopColor: '#f3f4f6',
//         paddingTop: 12,
//     },
//     detailItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 4,
//     },
//     detailText: {
//         fontSize: 12,
//         color: '#4b5563',
//     },
//     emptyIcon: {
//         width: 64,
//         height: 64,
//         backgroundColor: '#f3f4f6',
//         borderRadius: 32,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 16,
//     }
// });
