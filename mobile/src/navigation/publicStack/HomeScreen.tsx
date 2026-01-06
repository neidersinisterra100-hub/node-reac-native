import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
} from "react-native";
import { Text } from "react-native-paper";
import {
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { useCallback, useState } from "react";

import AppContainer from "../../components/ui/AppContainer";
import AppHeader from "../../components/ui/AppHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";
import StatCard from "../../components/ui/StatCard";

import { useAuth } from "../../context/AuthContext";
import { getTrips } from "../../services/trip.service";

import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { colors } from "../../theme/colors";

type TripItem = {
  _id: string;
  price: number;
  departureTime: string;
  date: string;
  route: {
    origin: string;
    destination: string;
  };
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await getTrips();
      setTrips(data);
    } catch (error) {
      console.log("❌ Error cargando viajes", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  /* ================= ACTION ================= */

  const handleBuyTicket = (trip: TripItem) => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }

    navigation
      .getParent()
      ?.navigate("ConfirmTicketModal", {
        routeName: `${trip.route.origin} → ${trip.route.destination}`,
        price: trip.price,
        tripId: trip._id,
      });
  };

  /* ================= RENDER ================= */

  return (
    <AppContainer>
      <AppHeader
        showGreeting
        subtitle="Viajes disponibles hoy"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* ===== STATS ===== */}
        <View style={styles.statsRow}>
          <StatCard
            label="Viajes activos"
            value={String(trips.length)}
          />
        </View>

        {/* ===== LISTADO ===== */}
        {trips.map((trip) => (
          <View key={trip._id} style={styles.card}>
            {/* ORIGEN → DESTINO */}
            <Text style={styles.routeText}>
              {trip.route.origin}{" "}
              <Text style={styles.arrow}>→</Text>{" "}
              {trip.route.destination}
            </Text>

            {/* INFO */}
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>
                🕒 {trip.departureTime}
              </Text>
              <Text style={styles.infoText}>
                📅 {trip.date}
              </Text>
            </View>

            {/* PRICE */}
            <Text style={styles.price}>
              ${trip.price.toLocaleString()}
            </Text>

            <PrimaryButton
              label="Comprar tiquete"
              onPress={() => handleBuyTicket(trip)}
            />
          </View>
        ))}

        {!loading && trips.length === 0 && (
          <Text style={styles.empty}>
            No hay viajes disponibles
          </Text>
        )}
      </ScrollView>
    </AppContainer>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },

  statsRow: {
    marginBottom: spacing.lg,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },

  routeText: {
    ...typography.title,
    fontWeight: "700",
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },

  arrow: {
    color: colors.primary,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  infoText: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  price: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
  },

  empty: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});




// import {
//   ScrollView,
//   StyleSheet,
//   View,
//   Alert,
// } from "react-native";
// import { Text } from "react-native-paper";
// import {
//   useNavigation,
//   useFocusEffect,
// } from "@react-navigation/native";
// import { useCallback, useState } from "react";

// import AppContainer from "../../components/ui/AppContainer";
// import AppHeader from "../../components/ui/AppHeader";
// import StatCard from "../../components/ui/StatCard";
// import PrimaryButton from "../../components/ui/PrimaryButton";
// import ListItem from "../../components/ui/ListItem";

// import { useOwnerActions } from "../../hooks/useOwnerActions";
// import { useAuth } from "../../context/AuthContext";
// import { getTrips } from "../../services/trip.service";

// import { spacing } from "../../theme/spacing";
// import { typography } from "../../theme/typography";
// import { colors } from "../../theme/colors";

// /* ================= TYPES ================= */

// type TripItem = {
//   _id: string;
//   price: number;
//   departureTime: string;
//   route: {
//     origin: string;
//     destination: string;
//   } | null;
// };

// export default function HomeScreen() {
//   const { isOwner } = useOwnerActions();
//   const { user } = useAuth();
//   const navigation = useNavigation<any>();

//   const [trips, setTrips] = useState<TripItem[]>([]);
//   const [loading, setLoading] = useState(false);

//   /* ================= LOAD TRIPS ================= */

//   const loadTrips = async () => {
//     try {
//       setLoading(true);
//       const data = await getTrips();
//       setTrips(data);
//     } catch (error) {
//       console.log("❌ Error cargando viajes", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadTrips();
//     }, [])
//   );

//   /* ================= ACTIONS ================= */

//   const handleBuyTicket = (trip: TripItem) => {
//     if (!user) {
//       navigation.navigate("Login");
//       return;
//     }

//     if (!trip.route) return;

//     navigation
//       .getParent()
//       ?.navigate("ConfirmTicketModal", {
//         routeName: `${trip.route.origin} → ${trip.route.destination}`,
//         price: trip.price,
//         tripId: trip._id,
//       });
//   };

//   const handleCreateTrip = () => {
//     if (!isOwner) {
//       Alert.alert(
//         "Acceso restringido",
//         "Solo owners pueden crear viajes"
//       );
//       return;
//     }

//     navigation.navigate("CreateTrip");
//   };

//   /* ================= RENDER ================= */

//   return (
//     <AppContainer>
//       <AppHeader
//         showGreeting
//         subtitle="Aquí tienes un resumen de hoy"
//       />

//       <ScrollView contentContainerStyle={styles.content}>
//         {/* ===== OWNER DASHBOARD ===== */}
//         {isOwner && (
//           <>
//             <Text style={styles.sectionTitle}>
//               Resumen general
//             </Text>

//             <View style={styles.row}>
//               <StatCard
//                 label="Viajes activos"
//                 value={String(trips.length)}
//               />
//               <StatCard label="Rutas" value="—" />
//             </View>

//             <PrimaryButton
//               label="Crear nuevo viaje"
//               onPress={handleCreateTrip}
//             />
//           </>
//         )}

//         {/* ===== VIAJES DISPONIBLES ===== */}
//         <Text style={styles.sectionTitle}>
//           Rutas disponibles
//         </Text>

//         {trips.map((trip) => {
//           if (!trip.route) return null;

//           return (
//             <View
//               key={trip._id}
//               style={styles.routeCard}
//             >
//               <ListItem
//                 title={`${trip.route.origin} → ${trip.route.destination}`}
//                 subtitle={`Salida: ${trip.departureTime}`}
//                 trailing={`$${trip.price}`}
//               />

//               <PrimaryButton
//                 label="Comprar tiquete"
//                 onPress={() => handleBuyTicket(trip)}
//               />
//             </View>
//           );
//         })}

//         {!loading && trips.length === 0 && (
//           <Text style={styles.infoText}>
//             No hay viajes disponibles
//           </Text>
//         )}
//       </ScrollView>
//     </AppContainer>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   content: {
//     padding: spacing.lg,
//   },
//   sectionTitle: {
//     ...typography.label,
//     color: colors.textSecondary,
//     marginBottom: spacing.sm,
//     marginTop: spacing.lg,
//   },
//   infoText: {
//     marginTop: spacing.sm,
//     color: colors.textSecondary,
//   },
//   row: {
//     flexDirection: "row",
//     gap: spacing.sm,
//     marginBottom: spacing.sm,
//   },
//   routeCard: {
//     backgroundColor: "#FFF",
//     borderRadius: 16,
//     padding: spacing.md,
//     borderWidth: 1,
//     borderColor: colors.border,
//     marginBottom: spacing.md,
//   },
// });
