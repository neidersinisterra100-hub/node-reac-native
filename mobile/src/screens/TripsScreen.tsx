import { View, FlatList, Alert, TouchableOpacity, Text } from "react-native";
import { IconButton } from "react-native-paper";
import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MapPin, Calendar, Clock, DollarSign } from "lucide-react-native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

import { getTrips, deleteTrip, Trip } from "../services/trip.service";
import { useAuth } from "../context/AuthContext";

export default function TripsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  
  // Params
  const { routeId, routeName, companyName } = route.params;
  const isOwner = user?.role === "owner" || user?.role === "admin";

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */

  const loadTrips = async () => {
    try {
      setLoading(true);
      const allTrips = await getTrips();
      // Filtrar localmente por routeId
      const filtered = allTrips.filter(t => {
          if (typeof t.route === 'string') return t.route === routeId;
          return t.route?._id === routeId;
      });
      setTrips(filtered);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los viajes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  /* ================= ACTIONS ================= */

  const handleDelete = async (id: string) => {
      Alert.alert(
          "Eliminar Viaje",
          "¿Estás seguro?",
          [
              { text: "Cancelar", style: "cancel" },
              { 
                  text: "Eliminar", 
                  style: "destructive",
                  onPress: async () => {
                      try {
                          await deleteTrip(id);
                          setTrips(prev => prev.filter(t => t._id !== id));
                      } catch {
                          Alert.alert("Error", "No se pudo eliminar");
                      }
                  }
              }
          ]
      );
  };

  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }: { item: Trip }) => (
    <View className="bg-white rounded-2xl p-5 border border-transparent mb-4 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
          <View className="flex-row items-center gap-2">
             <Calendar size={16} color="#6b7280" />
             <Text className="text-gray-600 font-medium">{new Date(item.date).toLocaleDateString()}</Text>
          </View>
          <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 font-bold text-xs">${item.price}</Text>
          </View>
      </View>

      <View className="flex-row items-center gap-2 mb-4">
          <Clock size={16} color="#6b7280" />
          <Text className="text-gray-800 font-bold text-xl">{item.departureTime}</Text>
      </View>

      <View className="flex-row items-center gap-2 mb-4">
          <Text className="text-gray-500 text-sm">{companyName}</Text>
      </View>
      
      {/* ACCIONES OWNER vs USER */}
      {isOwner ? (
          <View className="flex-row justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
              <IconButton 
                  icon="delete-outline" 
                  iconColor="#ef4444" 
                  size={20}
                  onPress={() => handleDelete(item._id)}
              />
          </View>
      ) : (
          <PrimaryButton 
              label="Reservar"
              onPress={() => Alert.alert("Próximamente", "Función de reserva en desarrollo")}
              variant="primary"
          />
      )}
    </View>
  );

  return (
    <AppContainer>
      <AppHeader title={routeName || "Viajes"} />

      <FlatList
        data={trips}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={loadTrips}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          isOwner ? (
              <View className="mb-4">
                  <PrimaryButton
                    label="Nuevo Viaje"
                    onPress={() => navigation.navigate("CreateTrip", { routeId })}
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
                    {isOwner ? "Programa viajes para esta ruta." : "No hay viajes programados."}
                </Text>
            </View>
          ) : null
        }
        renderItem={renderItem}
      />
    </AppContainer>
  );
}
