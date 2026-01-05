import { View, StyleSheet, Alert } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

import { createCompany } from "../services/company.service";
import { spacing } from "../theme/spacing";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { useAuth } from "../context/AuthContext";

export default function CreateCompanyScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SUBMIT ================= */

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Nombre requerido",
        "Ingresa el nombre de la empresa"
      );
      return;
    }

    // 🔐 Seguridad extra (normalizado)
    if (!user || user.role.toLowerCase() !== "owner") {
      Alert.alert(
        "Acceso restringido",
        "Solo los owners pueden crear empresas"
      );
      return;
    }

    setLoading(true);

    try {
      await createCompany(name.trim());

      Alert.alert(
        "Empresa creada",
        "La empresa se creó correctamente"
      );

      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "No se pudo crear la empresa"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <AppContainer>
      <AppHeader title="Crear empresa" />

      <View style={styles.container}>
        <Text style={[typography.label, styles.label]}>
          Nombre de la empresa
        </Text>

        <TextInput
          mode="outlined"
          placeholder="Ej: Transportes Pacífico"
          value={name}
          onChangeText={setName}
          style={styles.input}
          activeOutlineColor={colors.primary}
        />

        <PrimaryButton
          label={loading ? "Creando..." : "Crear empresa"}
          onPress={handleCreate}
          disabled={loading}
        />
      </View>
    </AppContainer>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    marginBottom: spacing.lg,
    backgroundColor: "#FFF",
  },
});



// import { View, StyleSheet, Alert } from "react-native";
// import { Text, TextInput } from "react-native-paper";
// import { useState } from "react";
// import { useNavigation } from "@react-navigation/native";

// import AppContainer from "../components/ui/AppContainer";
// import AppHeader from "../components/ui/AppHeader";
// import PrimaryButton from "../components/ui/PrimaryButton";

// import { createCompany } from "../services/company.service";
// import { spacing } from "../theme/spacing";
// import { colors } from "../theme/colors";
// import { typography } from "../theme/typography";
// import { useAuth } from "../context/AuthContext";

// export default function CreateCompanyScreen() {
//   const navigation = useNavigation<any>();
//   const { user } = useAuth();

//   const [name, setName] = useState("");
//   const [loading, setLoading] = useState(false);

//   /* ================= SUBMIT ================= */

//   const handleCreate = async () => {
//     if (!name.trim()) {
//       Alert.alert(
//         "Nombre requerido",
//         "Ingresa el nombre de la empresa"
//       );
//       return;
//     }

//     // 🔐 Seguridad extra
//     if (!user || user.role !== "owner") {
//       Alert.alert(
//         "Acceso restringido",
//         "Solo los owners pueden crear empresas"
//       );
//       return;
//     }

//     setLoading(true);

//     try {
//       await createCompany(name.trim());

//       Alert.alert(
//         "Empresa creada",
//         "La empresa se creó correctamente"
//       );

//       navigation.goBack();
//     } catch (error: any) {
//       Alert.alert(
//         "Error",
//         error?.response?.data?.message ||
//           "No se pudo crear la empresa"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= RENDER ================= */

//   return (
//     <AppContainer>
//       <AppHeader title="Crear empresa" />

//       <View style={styles.container}>
//         <Text style={[typography.label, styles.label]}>
//           Nombre de la empresa
//         </Text>

//         <TextInput
//           mode="outlined"
//           placeholder="Ej: Transportes Pacífico"
//           value={name}
//           onChangeText={setName}
//           style={styles.input}
//           activeOutlineColor={colors.primary}
//         />

//         <PrimaryButton
//           label={loading ? "Creando..." : "Crear empresa"}
//           onPress={handleCreate}
//           disabled={loading}
//         />
//       </View>
//     </AppContainer>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: {
//     padding: spacing.lg,
//   },
//   label: {
//     color: colors.textSecondary,
//     marginBottom: spacing.xs,
//   },
//   input: {
//     marginBottom: spacing.lg,
//     backgroundColor: "#FFF",
//   },
// });
