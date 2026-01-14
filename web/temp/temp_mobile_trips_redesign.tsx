import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ship, Calendar, Clock, MapPin } from "lucide-react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { IconButton } from "react-native-paper";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import { getTrips, deleteTrip, Trip } from "../services/trip.service";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

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
          // @ts-ignore
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
      Alert.alert("Eliminar Viaje", "¿Estás seguro?", [
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
      ]);
  };

  const handlePressTrip = (trip: Trip) => {
      if (isOwner) return; // Owner no compra tickets aquí, solo gestiona

      navigation.navigate("ConfirmTicketModal", {
          tripId: trip._id,
          routeName: routeName || "Ruta seleccionada",
          price: trip.price,
          date: trip.date,
          time: trip.departureTime
      });
  };

  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }: { item: Trip }) => (
    <TouchableOpacity 
        style={styles.card}
        onPress={() => handlePressTrip(item)}
        activeOpacity={isOwner ? 1 : 0.7}
    >
      <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
              <Ship size={24} color={colors.accent} />
          </View>
          <View style={{flex: 1}}>
              <Text style={styles.cardTitle}>{routeName}</Text>
              <Text style={styles.companyText}>{companyName}</Text>
          </View>
          
          {isOwner ? (
              <IconButton 
                  icon="delete-outline" 
                  iconColor="#ef4444" 
                  size={20} 
                  onPress={() => handleDelete(item._id)}
              />
          ) : (
              <View style={styles.priceTag}>
                  <Text style={styles.priceText}>${item.price}</Text>
              </View>
          )}
      </View>

      <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
              <Calendar size={14} color="#6b7280" />
              <Text style={styles.detailText}>
                  {item.date ? format(new Date(item.date), "dd MMM", { locale: es }) : "N/A"}
              </Text>
          </View>
          <View style={styles.detailItem}>
              <Clock size={14} color="#6b7280" />
              <Text style={styles.detailText}>{item.departureTime}</Text>
          </View>
          <View style={styles.detailItem}>
              <Ship size={14} color="#6b7280" />
              <Text style={styles.detailText}>{item.transportType || "Lancha"}</Text>
          </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <AppContainer>
      <AppHeader title={routeName || "Viajes"} neon={true} />

      {loading ? (
           <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={loadTrips}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isOwner ? (
                <View style={{ marginBottom: 20 }}>
                    <PrimaryButton
                        label="Nuevo Viaje"
                        onPress={() => navigation.navigate("CreateTrip", { routeId, routeName })}
                    />
                </View>
            ) : null
          }
          ListEmptyComponent={
             <View style={{alignItems: 'center', marginTop: 40}}>
                 <View style={styles.emptyIcon}>
                    <MapPin size={32} color="#9ca3af" />
                 </View>
                <Text style={{color: '#6b7280', textAlign: 'center'}}>
                    {isOwner ? "Programa viajes para esta ruta." : "No hay viajes programados."}
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    iconBox: {
        backgroundColor: '#e0f2f1', 
        padding: 12,
        borderRadius: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    companyText: {
        fontSize: 12,
        color: '#6b7280',
    },
    priceTag: {
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceText: {
        color: '#059669',
        fontWeight: 'bold',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 12,
        color: '#4b5563',
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
