import { View, FlatList, Alert, TouchableOpacity, Text, Switch } from "react-native";
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
        className={`bg-white rounded-2xl p-4 border mb-4 shadow-sm ${(!item.active && isOwner) ? 'border-gray-300 opacity-70' : 'border-transparent'}`}
        onPress={() => navigation.navigate("Trips", { 
            routeId: item._id,
            routeName: `${item.origin} - ${item.destination}`,
            companyName: companyName
        })}
    >
      <View className="flex-row items-center gap-3">
          <View className="bg-indigo-50 p-3 rounded-xl">
             <Navigation size={24} color="#4f46e5" />
          </View>
          <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">{item.origin} → {item.destination}</Text>
              <Text className={`text-xs ${item.active ? 'text-green-600' : 'text-gray-400'}`}>
                  {item.active ? "Activa" : "Inactiva"}
              </Text>
          </View>
          
          {/* ACCIONES OWNER */}
          {isOwner && (
              <View className="flex-row">
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
      <AppHeader title={companyName || "Rutas"} />

      <FlatList
        data={routes}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={loadRoutes}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          isOwner ? (
              <View className="mb-4">
                  <PrimaryButton
                    label="Nueva Ruta"
                    onPress={() => navigation.navigate("CreateRoute", { companyId })}
                  />
              </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
             <View className="items-center justify-center py-10">
                 <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <MapPin size={32} color="#9ca3af" />
                 </View>
                <Text className="text-gray-500 text-center text-base">
                    {isOwner ? "Crea rutas para asignar a tus viajes." : "No hay rutas disponibles por el momento."}
                </Text>
            </View>
          ) : null
        }
        renderItem={renderItem}
      />
    </AppContainer>
  );
}
