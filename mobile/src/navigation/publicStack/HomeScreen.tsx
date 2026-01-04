import { ScrollView, StyleSheet, View, } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation, useFocusEffect, } from "@react-navigation/native";
import { useCallback, useState } from "react";

import AppContainer from "../../components/ui/AppContainer";
import AppHeader from "../../components/ui/AppHeader";
import StatCard from "../../components/ui/StatCard";
import PrimaryButton from "../../components/ui/PrimaryButton";
import ListItem from "../../components/ui/ListItem";

import { useOwnerActions } from "../../hooks/useOwnerActions";
import { useAuth } from "../../context/AuthContext";
import { getTrips } from "../../services/trip.service";

import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { colors } from "../../theme/colors";

export default function HomeScreen() {
  // ✅ dominio owner
  const { isOwner, canCreate } = useOwnerActions();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD TRIPS ================= */

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

  // 🔄 Se ejecuta cada vez que vuelves a Home
  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  /* ================= ACTIONS ================= */

  const handleBuyTicket = (trip: any) => {
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
        subtitle="Aquí tienes un resumen de hoy"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* ===== Resumen (solo owners) ===== */}
        {isOwner && (
          <>
            <Text style={styles.sectionTitle}>
              Resumen general
            </Text>

            <View style={styles.row}>
              <StatCard
                label="Viajes activos"
                value={String(trips.length)}
              />
              <StatCard label="Rutas" value="—" />
            </View>

            {/* ===== Acción principal owner ===== */}
            {!canCreate && (
              <PrimaryButton
                label="Crear nuevo viaje"
                onPress={() =>
                  navigation.navigate("CreateTrip")
                }
              />
            )}

            {!canCreate && (
              <Text style={styles.infoText}>
                No tienes viajes habilitados hoy
              </Text>
            )}
          </>
        )}

        {/* ===== RUTAS DISPONIBLES ===== */}
        <Text style={styles.sectionTitle}>
          Rutas disponibles
        </Text>

        {trips.map((trip) => (
          <View
            key={trip._id}
            style={styles.routeCard}
          >
            <ListItem
              title={`${trip.route.origin} → ${trip.route.destination}`}
              subtitle={`Salida: ${trip.departureTime}`}
              trailing={`$${trip.price}`}
            />

            <PrimaryButton
              label="Comprar tiquete"
              onPress={() => handleBuyTicket(trip)}
            />
          </View>
        ))}

        {!loading && trips.length === 0 && (
          <Text style={styles.infoText}>
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

  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },

  infoText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },

  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  routeCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
});


// import { ScrollView, StyleSheet, View } from "react-native";
// import { Text } from "react-native-paper";

// import AppContainer from "../components/ui/AppContainer";
// import AppHeader from "../components/ui/AppHeader";
// import StatCard from "../components/ui/StatCard";
// import PrimaryButton from "../components/ui/PrimaryButton";
// import ListItem from "../components/ui/ListItem";

// import { useOwnerActions } from "../hooks/useOwnerActions";

// import { spacing } from "../theme/spacing";
// import { typography } from "../theme/typography";
// import { colors } from "../theme/colors";

// export default function HomeScreen() {
//   // ✅ SOLO el hook de dominio
//   const { isOwner, canCreate } = useOwnerActions();

//   return (
//     <AppContainer>
//       {/* ✅ title obligatorio */}
//       <AppHeader
//         showGreeting
//         subtitle="Aquí tienes un resumen de hoy"
//       />


//       <ScrollView contentContainerStyle={styles.content}>
//         {/* ===== Resumen ===== */}
//         <Text style={styles.sectionTitle}>Resumen general</Text>

//         <View style={styles.row}>
//           <StatCard label="Viajes activos" value="12" hint="+2 hoy" />
//           <StatCard label="Rutas" value="5" />
//         </View>

//         <View style={styles.row}>
//           <StatCard label="Ingresos" value="$1.250.000" hint="+8%" />
//           <StatCard label="Pendientes" value="18" hint="Revisar" />
//         </View>

//         {/* ===== Acción principal ===== */}
//         {isOwner && canCreate && (
//           <PrimaryButton
//             label="Crear nuevo viaje"
//             onPress={() => { }}
//           />
//         )}

//         {isOwner && !canCreate && (
//           <Text style={styles.infoText}>
//             No tienes viajes habilitados hoy
//           </Text>
//         )}

//         {/* ===== Actividad reciente ===== */}
//         <Text style={styles.sectionTitle}>Actividad reciente</Text>

//         <ListItem
//           title="Ruta Centro → Norte"
//           subtitle="Hoy · 8:30 AM"
//           trailing="$25.000"
//         />

//         <ListItem
//           title="Ruta Sur → Centro"
//           subtitle="Ayer · 6:15 PM"
//           trailing="$18.000"
//         />

//         <ListItem
//           title="Ruta Norte → Terminal"
//           subtitle="Ayer · 4:40 PM"
//           trailing="$22.500"
//         />
//       </ScrollView>
//     </AppContainer>
//   );
// }

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
// });
