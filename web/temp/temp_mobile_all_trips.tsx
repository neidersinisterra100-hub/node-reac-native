import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ship, Calendar, Clock, DollarSign, MapPin } from "lucide-react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import { tripService, Trip } from "../services/trip.service";
import { useAuth } from "../context/AuthContext";

export default function AllTripsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getAll();
      // Filtrar solo viajes futuros si es necesario, o confiar en el backend
      setTrips(data);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los viajes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handlePressTrip = (trip: Trip) => {
    // Si la ruta está poblada, mostramos modal de compra
    if (trip.route && typeof trip.route === 'object') {
        navigation.navigate("ConfirmTicketModal", {
            tripId: trip._id,
            routeName: `${trip.route.origin} - ${trip.route.destination}`,
            price: trip.price,
            date: trip.date,
            time: trip.departureTime
        });
    } else {
        Alert.alert("Error", "Información de ruta incompleta");
    }
  };

  const renderItem = ({ item }: { item: Trip }) => {
    // Safely access route props
    const routeOrigin = item.route && typeof item.route === 'object' ? item.route.origin : 'Origen';
    const routeDest = item.route && typeof item.route === 'object' ? item.route.destination : 'Destino';
    
    return (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => handlePressTrip(item)}
        >
        <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
                <Ship size={24} color="#4f46e5" />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.cardTitle}>{routeOrigin} → {routeDest}</Text>
                <Text style={styles.companyText}>
                    {item.company && typeof item.company === 'object' ? item.company.name : 'Empresa'}
                </Text>
            </View>
            <View style={styles.priceTag}>
                <Text style={styles.priceText}>${item.price}</Text>
            </View>
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
                <Text style={styles.detailText}>{item.transportType}</Text>
            </View>
        </View>
        </TouchableOpacity>
    );
  };

  return (
    <AppContainer>
      <AppHeader title="Próximos Zarpes" neon={true} />

      {loading ? (
           <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#ff6b00" />
          </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={loadTrips}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
             <View style={{alignItems: 'center', marginTop: 40}}>
                 <View style={styles.emptyIcon}>
                    <Ship size={32} color="#9ca3af" />
                 </View>
                <Text style={{color: '#6b7280', textAlign: 'center'}}>
                    No hay viajes programados.
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
        backgroundColor: '#eef2ff', 
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
