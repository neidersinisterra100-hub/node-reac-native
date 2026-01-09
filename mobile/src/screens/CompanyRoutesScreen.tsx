import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MapPin, Navigation } from "lucide-react-native";

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

      // 🔒 eliminar duplicados por _id
      const unique = Array.from(
        new Map(data.map(r => [r._id, r])).values()
      );
      console.log("Unique routes:", unique);
      setRoutes(unique);

      // const data = await getCompanyRoutes(companyId);
      // setRoutes(data);
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
    Alert.alert("Eliminar Ruta", "¿Estás seguro?", [
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
    ]);
  };

  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }: { item: Route }) => (
    <TouchableOpacity
      style={[styles.card, !item.active && isOwner && styles.cardInactive]}
      onPress={() => navigation.navigate("Trips", {
        routeId: item._id,
        routeName: `${item.origin} - ${item.destination}`,
        companyName: companyName
      })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Navigation size={24} color="#4f46e5" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.origin} → {item.destination}</Text>
          <Text style={[styles.statusText, { color: item.active ? '#16a34a' : '#9ca3af' }]}>
            {item.active ? "Activa" : "Inactiva"}
          </Text>
        </View>

        {isOwner && (
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon="power"
              iconColor={item.active ? "#10b981" : "#9ca3af"}
              size={20}
              onPress={() => handleToggle(item._id, !!item.active)}
            />
            <IconButton
              icon="delete-outline"
              iconColor="#ef4444"
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
      {/* 🟢 HEADER CON NEÓN AQUÍ */}
      <AppHeader title={companyName || "Rutas"} neon={true} />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ff6b00" />
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={loadRoutes}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isOwner ? (
              <View style={{ marginBottom: 20 }}>
                <PrimaryButton
                  label="Nueva Ruta"
                  onPress={() => navigation.navigate("CreateRoute", { companyId })}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <View style={styles.emptyIcon}>
                <MapPin size={32} color="#9ca3af" />
              </View>
              <Text style={{ color: '#6b7280', textAlign: 'center' }}>
                {isOwner ? "Crea rutas para asignar a tus viajes." : "No hay rutas disponibles."}
              </Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInactive: {
    opacity: 0.7,
    borderColor: '#d1d5db',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    backgroundColor: '#eef2ff', // indigo-50
    padding: 12,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#f3f4f6',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  }
});
