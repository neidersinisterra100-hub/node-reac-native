import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import StatCard from "../components/ui/StatCard";
import PrimaryButton from "../components/ui/PrimaryButton";
import ListItem from "../components/ui/ListItem";

import { useOwnerActions } from "../hooks/useOwnerActions";
import { useAuth } from "../context/AuthContext";

import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { colors } from "../theme/colors";

export default function HomeScreen() {
  // ✅ dominio owner
  const { isOwner, canCreate } = useOwnerActions();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  // const handleBuyTicket = (route: string) => {
  //   if (!user) {
  //     navigation.navigate("Login");
  //     return;
  //   }

  //   console.log("Comprar tiquete:", route);
  // };
  const handleBuyTicket = (routeName: string) => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }

    navigation.getParent()?.navigate("ConfirmTicketModal", {
      routeName,
      price: "160000",
    });
  };


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
                value="12"
                hint="+2 hoy"
              />
              <StatCard label="Rutas" value="5" />
            </View>

            <View style={styles.row}>
              <StatCard
                label="Ingresos"
                value="$1.250.000"
                hint="+8%"
              />
              <StatCard
                label="Pendientes"
                value="18"
                hint="Revisar"
              />
            </View>

            {/* ===== Acción principal owner ===== */}
            {canCreate && (
              <PrimaryButton
                label="Crear nuevo viaje"
                onPress={() => { }}
              />
            )}

            {!canCreate && (
              <Text style={styles.infoText}>
                No tienes viajes habilitados hoy
              </Text>
            )}
          </>
        )}

        {/* ===== RUTAS DISPONIBLES (PÚBLICO) ===== */}
        <Text style={styles.sectionTitle}>
          Rutas disponibles
        </Text>

        <View style={styles.routeCard}>
          <ListItem
            title="Timbiquí → Buenaventura"
            subtitle="Lancha rápida"
            trailing="$160.000"
          />

          <PrimaryButton
            label="Comprar tiquete"
            onPress={() =>
              handleBuyTicket(
                "Timbiquí - Buenaventura"
              )
            }
          />
        </View>

        <View style={styles.routeCard}>
          <ListItem
            title="Buenaventura → Timbiquí"
            subtitle="Lancha rápida"
            trailing="$160.000"
          />

          <PrimaryButton
            label="Comprar tiquete"
            onPress={() =>
              handleBuyTicket(
                "Buenaventura - Timbiquí"
              )
            }
          />
        </View>

        {/* ===== Actividad reciente (owner) ===== */}
        {isOwner && (
          <>
            <Text style={styles.sectionTitle}>
              Actividad reciente
            </Text>

            <ListItem
              title="Ruta Centro → Norte"
              subtitle="Hoy · 8:30 AM"
              trailing="$25.000"
            />

            <ListItem
              title="Ruta Sur → Centro"
              subtitle="Ayer · 6:15 PM"
              trailing="$18.000"
            />

            <ListItem
              title="Ruta Norte → Terminal"
              subtitle="Ayer · 4:40 PM"
              trailing="$22.500"
            />
          </>
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
