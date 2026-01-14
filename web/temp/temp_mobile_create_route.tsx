import { View, Alert, TextInput as RNTextInput, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

import { createRoute } from "../services/route.service";
import { spacing } from "../theme/spacing";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

export default function CreateRouteScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { companyId } = route.params;

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!origin.trim() || !destination.trim()) {
      Alert.alert("Campos requeridos", "Ingresa origen y destino");
      return;
    }

    setLoading(true);

    try {
      await createRoute({
        origin: origin.trim(),
        destination: destination.trim(),
        companyId
      });
      Alert.alert("Éxito", "Ruta creada correctamente");
      navigation.goBack();
    } catch (error: any) {
      console.log("Error create route:", error);
      Alert.alert("Error", error?.message || "No se pudo crear la ruta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <AppHeader title="Nueva Ruta" />

      <View style={styles.card}>
        <Text style={styles.label}>Origen</Text>
        <RNTextInput
            style={styles.input}
            placeholder="Ej: Buenaventura"
            placeholderTextColor={colors.textSecondary}
            value={origin}
            onChangeText={setOrigin}
        />

        <Text style={styles.label}>Destino</Text>
        <RNTextInput
            style={styles.input}
            placeholder="Ej: Juanchaco"
            placeholderTextColor={colors.textSecondary}
            value={destination}
            onChangeText={setDestination}
        />

        <View style={{ marginTop: spacing.lg }}>
            <PrimaryButton
            label={loading ? "Guardando..." : "Guardar Ruta"}
            onPress={handleCreate}
            disabled={loading}
            />
        </View>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: "500",
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  }
});
