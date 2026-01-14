import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { MapPin, Navigation } from "lucide-react-native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import { routeService, Route } from "../services/route.service";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

export default function AllRoutesScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await routeService.getAll();
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

  const renderItem = ({ item }: { item: Route }) => {
    // Intentar obtener nombre de empresa si viene populado
    const companyName = item.company && typeof item.company === 'object' ? (item.company as any).name : 'Empresa';

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Trips", {
                routeId: item._id,
                routeName: `${item.origin} - ${item.destination}`,
                companyName: companyName
            })}
        >
        <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
                <Navigation size={24} color={colors.accent} />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.cardTitle}>{item.origin} → {item.destination}</Text>
                <Text style={styles.companyText}>{companyName}</Text>
                <Text style={styles.cardSubtitle}>
                    {user?.role === 'owner' ? 'Toca para gestionar viajes' : 'Ver horarios disponibles'}
                </Text>
            </View>
        </View>
        </TouchableOpacity>
    );
  };

  return (
    <AppContainer>
      <AppHeader title="Todas las Rutas" neon={true} />

      {loading ? (
           <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={loadRoutes}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
             <View style={{alignItems: 'center', marginTop: 40}}>
                 <View style={styles.emptyIcon}>
                    <MapPin size={32} color="#9ca3af" />
                 </View>
                <Text style={{color: '#6b7280', textAlign: 'center'}}>
                    No se encontraron rutas disponibles.
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
    },
    iconBox: {
        backgroundColor: '#e0f2f1', // Cyan muy claro
        padding: 12,
        borderRadius: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    companyText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary, // Navy
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#6b7280',
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
