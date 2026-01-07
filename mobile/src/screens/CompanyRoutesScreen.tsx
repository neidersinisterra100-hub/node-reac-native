import { View, StyleSheet, FlatList, Alert, Switch, TouchableOpacity } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

import {
  getCompanyRoutes,
  toggleRouteActive,
  deleteRoute,
  Route
} from "../services/route.service";

import { useAuth } from "../context/AuthContext";
import { spacing } from "../theme/spacing";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

export default function CompanyRoutesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  
  // Params
  const { companyId, companyName } = route.params;
  const isOwner = user?.role === "owner" || user?.role === "admin";

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await getCompanyRoutes(companyId);
      setRoutes(data);
    } catch {
      Alert.alert("Error", "No se pudieron cargar las rutas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  /* ================= ACTIONS ================= */

  const handleToggle = async (routeId: string, currentStatus: boolean) => {
    try {
      await toggleRouteActive(routeId);
      setRoutes(prev => prev.map(r => r._id === routeId ? { ...r, active: !currentStatus } : r));
    } catch {
      Alert.alert("Error", "No se pudo cambiar el estado");
    }
  };

  const handleDelete = async (routeId: string) => {
      Alert.alert(
          "Eliminar Ruta",
          "¿Estás seguro? Se borrarán los viajes asociados.",
          [
              { text: "Cancelar", style: "cancel" },
              { 
                  text: "Eliminar", 
                  style: "destructive",
                  onPress: async () => {
                      try {
                          await deleteRoute(routeId);
                          setRoutes(prev => prev.filter(r => r._id !== routeId));
                      } catch {
                          Alert.alert("Error", "No se pudo eliminar");
                      }
                  }
              }
          ]
      );
  };

  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }: { item: Route }) => (
    <TouchableOpacity 
        style={[styles.card, !item.active && isOwner && styles.cardInactive]}
        onPress={() => navigation.navigate("Trips", { // Asumo que existe TripsScreen registrado como "Trips"
            routeId: item._id,
            routeName: `${item.origin} - ${item.destination}`,
            companyName: companyName
        })}
    >
      <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
             <IconButton icon="map-marker-path" iconColor={colors.secondary} size={24} />
          </View>
          <View style={{flex: 1}}>
              <Text style={styles.cardTitle}>{item.origin} → {item.destination}</Text>
              <Text style={styles.cardSubtitle}>
                  {item.active ? "Activa" : "Inactiva"}
              </Text>
          </View>
          
          {/* ACCIONES OWNER */}
          {isOwner && (
              <View style={styles.actions}>
                  <IconButton 
                      icon="power" 
                      iconColor={item.active ? colors.success : colors.textSecondary} 
                      size={20}
                      onPress={() => handleToggle(item._id, !!item.active)}
                  />
                  <IconButton 
                      icon="delete-outline" 
                      iconColor={colors.error} 
                      size={20}
                      onPress={() => handleDelete(item._id)}
                  />
              </View>
          )}
      </View>
    </TouchableOpacity>
  );

  return (
    <AppContainer>
      <AppHeader title={companyName || "Rutas"} />

      <View style={styles.container}>
        <FlatList
          data={routes}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={loadRoutes}
          contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isOwner ? (
                <View style={{ marginBottom: spacing.md }}>
                    <PrimaryButton
                    label="Nueva Ruta"
                    onPress={() => navigation.navigate("CreateRoute", { companyId })}
                    />
                </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.emptyText}>
                No hay rutas disponibles en esta empresa.
              </Text>
            ) : null
          }
          renderItem={renderItem}
        />
      </View>
    </AppContainer>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardInactive: {
      opacity: 0.7,
      borderColor: colors.textSecondary,
  },
  cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
  },
  iconContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      width: 48,
      height: 48,
      justifyContent: "center",
      alignItems: "center",
  },
  cardTitle: {
      ...typography.header,
      fontSize: 16,
      color: colors.textPrimary,
  },
  cardSubtitle: {
      ...typography.body,
      color: colors.textSecondary,
      fontSize: 14,
  },
  actions: {
      flexDirection: "row",
  },
  emptyText: {
    marginTop: spacing.lg,
    color: colors.textSecondary,
    textAlign: "center",
    ...typography.body,
  }
});
