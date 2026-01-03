import {
  View,
  StyleSheet,
  BackHandler,
} from "react-native";
import { Text, Appbar } from "react-native-paper";
import {
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { useCallback } from "react";

import AppContainer from "../../components/ui/AppContainer";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types/user";

export default function SettingsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const handleClose = () => {
    navigation.goBack();
  };

  /* ================= ANDROID BACK HANDLER ================= */
  useFocusEffect(
    useCallback(() => {
      const subscription =
        BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            handleClose();
            return true; // ⛔ bloquea comportamiento por defecto
          }
        );

      return () => {
        subscription.remove(); // ✅ API correcta
      };
    }, [])
  );

  // 🔐 Seguridad extra
  if (!user || user.role !== UserRole.OWNER) {
    return (
      <AppContainer>
        <Appbar.Header style={styles.header}>
          <Appbar.Content
            title="Configuración"
            titleStyle={styles.headerTitle}
          />
          <Appbar.Action
            icon="close"
            onPress={handleClose}
            color={colors.textPrimary}
          />
        </Appbar.Header>

        <View style={styles.center}>
          <Text style={[typography.body, styles.bodyText]}>
            No tienes permisos para acceder a esta sección.
          </Text>
        </View>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      {/* HEADER DEL MODAL */}
      <Appbar.Header style={styles.header}>
        <Appbar.Content
          title="Configuración"
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action
          icon="close"
          onPress={handleClose}
          color={colors.textPrimary}
        />
      </Appbar.Header>

      <View style={styles.container}>
        <Text style={[typography.title, styles.sectionTitle]}>
          General
        </Text>

        <View style={styles.card}>
          <Text style={[typography.body, styles.bodyText]}>
            Aquí podrás configurar:
          </Text>

          <Text style={styles.item}>• Empresa</Text>
          <Text style={styles.item}>• Rutas</Text>
          <Text style={styles.item}>• Vehículos</Text>
          <Text style={styles.item}>• Usuarios</Text>
        </View>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  headerTitle: {
    color: colors.textPrimary,
    fontWeight: "700",
  },

  container: {
    padding: spacing.lg,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },

  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  bodyText: {
    color: colors.textPrimary,
  },

  card: {
    marginTop: spacing.md,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  item: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontWeight: "500",
  },
});

// import { View, StyleSheet } from "react-native";
// import { Text, Appbar } from "react-native-paper";
// import { useNavigation } from "@react-navigation/native";

// import AppContainer from "../components/ui/AppContainer";
// import { colors } from "../theme/colors";
// import { spacing } from "../theme/spacing";
// import { typography } from "../theme/typography";
// import { useAuth } from "../context/AuthContext";
// import { UserRole } from "../types/user";

// export default function SettingsScreen() {
//   const { user } = useAuth();
//   const navigation = useNavigation();

//   const handleClose = () => {
//     navigation.goBack();
//   };

//   // 🔐 Seguridad extra
//   if (!user || user.role !== UserRole.OWNER) {
//     return (
//       <AppContainer>
//         {/* HEADER DEL MODAL */}
//         <Appbar.Header style={styles.header}>
//           <Appbar.Content
//             title="Configuración"
//             titleStyle={styles.headerTitle}
//           />
//           <Appbar.Action
//             icon="close"
//             onPress={handleClose}
//             color={colors.textPrimary} // 👈 FORZADO
//           />
//         </Appbar.Header>

//         <View style={styles.center}>
//           <Text style={[typography.body, styles.bodyText]}>
//             No tienes permisos para acceder a esta sección.
//           </Text>
//         </View>
//       </AppContainer>
//     );
//   }

//   return (
//     <AppContainer>
//       {/* HEADER DEL MODAL */}
//       <Appbar.Header style={styles.header}>
//         <Appbar.Content
//           title="Configuración"
//           titleStyle={styles.headerTitle}
//         />
//         <Appbar.Action
//           icon="close"
//           onPress={handleClose}
//           color={colors.textPrimary} // 👈 FORZADO
//         />
//       </Appbar.Header>

//       <View style={styles.container}>
//         <Text style={[typography.title, styles.sectionTitle]}>
//           General
//         </Text>

//         <View style={styles.card}>
//           <Text style={[typography.body, styles.bodyText]}>
//             Aquí podrás configurar:
//           </Text>

//           <Text style={styles.item}>• Empresa</Text>
//           <Text style={styles.item}>• Rutas</Text>
//           <Text style={styles.item}>• Vehículos</Text>
//           <Text style={styles.item}>• Usuarios</Text>
//         </View>
//       </View>
//     </AppContainer>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: colors.surface,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//   },

//   headerTitle: {
//     color: colors.textPrimary,
//     fontWeight: "700",
//   },

//   container: {
//     padding: spacing.lg,
//   },

//   center: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: spacing.lg,
//   },

//   sectionTitle: {
//     color: colors.textPrimary,
//     marginBottom: spacing.sm,
//   },

//   bodyText: {
//     color: colors.textPrimary,
//   },

//   card: {
//     marginTop: spacing.md,
//     backgroundColor: "#FFF",
//     borderRadius: 16,
//     padding: spacing.lg,
//     borderWidth: 1,
//     borderColor: colors.border,
//   },

//   item: {
//     marginTop: spacing.sm,
//     color: colors.textPrimary,
//     fontWeight: "500",
//   },
// });
