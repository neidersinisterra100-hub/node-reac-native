import { View, StyleSheet, Alert } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useState } from "react";
import {
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

import { createRoute } from "../services/route.service";
import { useAuth } from "../context/AuthContext";

import { spacing } from "../theme/spacing";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import FormField from "../components/ui/FormField";

/* ================= TYPES ================= */

type CreateRouteParams = {
  companyId: string;
};

type RouteParams = RouteProp<
  { CreateRoute: CreateRouteParams },
  "CreateRoute"
>;

/* ================= SCREEN ================= */

export default function CreateRouteScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteParams>();
  const { user } = useAuth();

  const { companyId } = route.params ?? {};

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= GUARD ================= */

  if (!companyId) {
    Alert.alert(
      "Error",
      "No se recibió la empresa"
    );
    navigation.goBack();
    return null;
  }

  /* ================= SUBMIT ================= */

  const handleCreateRoute = async () => {
    if (!origin.trim() || !destination.trim()) {
      Alert.alert(
        "Campos requeridos",
        "Origen y destino son obligatorios"
      );
      return;
    }

    if (!user || user.role !== "owner") {
      Alert.alert(
        "Acceso restringido",
        "Solo los owners pueden crear rutas"
      );
      return;
    }

    setLoading(true);

    try {
      await createRoute({
        origin: origin.trim(),
        destination: destination.trim(),
        companyId,
      });

      Alert.alert(
        "Ruta creada",
        "La ruta se creó correctamente"
      );

      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        "No se pudo crear la ruta"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <AppContainer>
      <AppHeader title="Crear ruta" showBack />

      <View style={styles.container}>
        <FormField
          label="Origen"
          value={origin}
          onChangeText={setOrigin}
          placeholder="Ej: Timbiquí"
        />

        <FormField
          label="Destino"
          value={destination}
          onChangeText={setDestination}
          placeholder="Ej: Buenaventura"
        />

        <PrimaryButton
          label={loading ? "Creando..." : "Crear ruta"}
          onPress={handleCreateRoute}
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
    marginBottom: spacing.md,
    backgroundColor: "#FFF",
  },
});
