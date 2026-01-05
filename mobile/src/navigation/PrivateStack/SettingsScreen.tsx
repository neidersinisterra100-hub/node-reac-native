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
import { isAdminOrOwner } from "../../utils/roles";

import { webTextFix } from "../../theme/webTextFix";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function SettingsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const handleClose = () => {
    navigation.goBack();
  };

  const handleCreateCompany = () => {
    navigation.navigate("CreateCompany");
  };

  const handleMyCompanies = () => {
    navigation.navigate("MyCompanies");
  };

  /* ================= ANDROID BACK HANDLER ================= */
  useFocusEffect(
    useCallback(() => {
      const subscription =
        BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            handleClose();
            return true;
          }
        );

      return () => subscription.remove();
    }, [])
  );

  /* ================= ACCESS CONTROL ================= */

  if (!isAdminOrOwner(user)) {
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

  /* ================= RENDER ================= */

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

      <View style={styles.container}>
        <Text style={[typography.title, styles.sectionTitle]}>
          General
        </Text>

        {/* ===== GESTIÓN DE EMPRESAS ===== */}
        <View style={styles.card}>
          <Text style={[typography.body, styles.bodyText]}>
            Gestión
          </Text>

          <PrimaryButton
            label="Crear empresa"
            onPress={handleCreateCompany}
          />

          <PrimaryButton
            label="Mis empresas"
            // variant="secondary"
            onPress={handleMyCompanies}
          />
        </View>

        {/* ===== INFO ===== */}
        <View style={styles.card}>
          <Text style={[typography.body, styles.bodyText]}>
            Aquí podrás configurar:
          </Text>

          <Text style={styles.item}>• Empresas</Text>
          <Text style={styles.item}>• Rutas</Text>
          <Text style={styles.item}>• Vehículos</Text>
          <Text style={styles.item}>• Usuarios</Text>
        </View>
      </View>
    </AppContainer>
  );
}

/* ================= STYLES ================= */

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
    ...webTextFix,
  },
  bodyText: {
    color: colors.textPrimary,
    ...webTextFix,
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
    ...webTextFix,
  },
});




// import {
//   View,
//   StyleSheet,
//   BackHandler,
// } from "react-native";
// import { Text, Appbar } from "react-native-paper";
// import {
//   useNavigation,
//   useFocusEffect,
// } from "@react-navigation/native";
// import { useCallback } from "react";

// import AppContainer from "../../components/ui/AppContainer";
// import { colors } from "../../theme/colors";
// import { spacing } from "../../theme/spacing";
// import { typography } from "../../theme/typography";
// import { usePermissions } from "../../hooks/usePermissions";

// export default function SettingsScreen() {
//   const navigation = useNavigation();
//   const { isAdminOrOwner } = usePermissions();

//   const handleClose = () => {
//     navigation.goBack();
//   };

//   useFocusEffect(
//     useCallback(() => {
//       const sub = BackHandler.addEventListener(
//         "hardwareBackPress",
//         () => {
//           handleClose();
//           return true;
//         }
//       );

//       return () => sub.remove();
//     }, [])
//   );

//   if (!isAdminOrOwner) {
//     return (
//       <AppContainer>
//         <Appbar.Header style={styles.header}>
//           <Appbar.Content title="Configuración" />
//           <Appbar.Action icon="close" onPress={handleClose} />
//         </Appbar.Header>

//         <View style={styles.center}>
//           <Text style={styles.text}>
//             No tienes permisos para acceder a esta sección
//           </Text>
//         </View>
//       </AppContainer>
//     );
//   }

//   return (
//     <AppContainer>
//       <Appbar.Header style={styles.header}>
//         <Appbar.Content title="Configuración" />
//         <Appbar.Action icon="close" onPress={handleClose} />
//       </Appbar.Header>

//       <View style={styles.container}>
//         <Text style={styles.title}>General</Text>

//         <View style={styles.card}>
//           <Text style={styles.text}>• Empresa</Text>
//           <Text style={styles.text}>• Rutas</Text>
//           <Text style={styles.text}>• Viajes</Text>
//           <Text style={styles.text}>• Usuarios</Text>
//         </View>
//       </View>
//     </AppContainer>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: colors.surface,
//   },
//   container: {
//     padding: spacing.lg,
//   },
//   center: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   title: {
//     ...typography.title,
//     marginBottom: spacing.md,
//   },
//   card: {
//     backgroundColor: "#fff",
//     padding: spacing.lg,
//     borderRadius: 16,
//   },
//   text: {
//     ...typography.body,
//     marginBottom: spacing.sm,
//   },
// });
