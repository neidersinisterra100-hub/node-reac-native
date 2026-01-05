import { View, StyleSheet, FlatList, Alert } from "react-native";
import { Text } from "react-native-paper";
import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import ListItem from "../components/ui/ListItem";

import { getCompanyRoutes } from "../services/route.service";
import { useAuth } from "../context/AuthContext";

import { spacing } from "../theme/spacing";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

/* ================= TYPES ================= */

type RouteItem = {
  _id: string;
  origin: string;
  destination: string;
};

export default function CompanyRoutesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  const { companyId, companyName } = route.params;

  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ROUTES ================= */

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await getCompanyRoutes(companyId);
      setRoutes(data);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "No se pudieron cargar las rutas"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  /* ================= GUARD ================= */

  if (!user || user.role !== "owner") {
    return (
      <AppContainer>
        <AppHeader title="Rutas" />
        <View style={styles.center}>
          <Text style={typography.body}>
            No tienes permisos para ver esta sección
          </Text>
        </View>
      </AppContainer>
    );
  }

  /* ================= ACTIONS ================= */

  const handleCreateRoute = () => {
    navigation.navigate("CreateRoute", { companyId });
  };

  const handleCreateTrip = (routeId: string) => {
    navigation.navigate("CreateTrip", { routeId });
  };

  /* ================= RENDER ================= */

  return (
    <AppContainer>
      <AppHeader title={`Rutas · ${companyName}`} />

      <View style={styles.container}>
        <PrimaryButton
          label="Crear nueva ruta"
          onPress={handleCreateRoute}
        />

        <FlatList
          data={routes}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={loadRoutes}
          contentContainerStyle={{ marginTop: spacing.lg }}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.emptyText}>
                Esta empresa aún no tiene rutas
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <ListItem
                title={`${item.origin} → ${item.destination}`}
              />

              <PrimaryButton
                label="Crear viaje"
                onPress={() => handleCreateTrip(item._id)}
              />
            </View>
          )}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  emptyText: {
    marginTop: spacing.lg,
    color: colors.textSecondary,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
});
