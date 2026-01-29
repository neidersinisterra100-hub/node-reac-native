import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ship, Calendar, Clock } from "lucide-react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { styled } from "nativewind";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import { tripService, Trip } from "../services/trip.service";

const StyledView = styled(View);
const StyledText = styled(Text);

export default function AllTripsScreen() {
  const navigation = useNavigation<any>();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getAll();
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
    if (trip.route && typeof trip.route === "object") {
      navigation.navigate("ConfirmTicketModal", {
        tripId: trip._id ?? trip.id,
        routeName: `${trip.route.origin} - ${trip.route.destination}`,
        price: trip.price,
        date: trip.date,
        time: trip.departureTime,
      });
    } else {
      Alert.alert("Error", "Información de ruta incompleta");
    }
  };

  const renderItem = ({ item }: { item: Trip }) => {
    const routeName =
      item.route && typeof item.route === "object"
        ? `${item.route.origin} - ${item.route.destination}`
        : "Ruta no definida";

    return (
      <TouchableOpacity
        onPress={() => handlePressTrip(item)}
        className="
          bg-white dark:bg-dark-surface
          border border-gray-200 dark:border-dark-border
          rounded-2xl p-4 mb-4
        "
      >
        {/* ===== HEADER ===== */}
        <StyledView className="flex-row items-center mb-3 space-x-3">
          <StyledView className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-xl">
            <Ship className="text-indigo-600 dark:text-indigo-400" size={24} />
          </StyledView>

          <StyledView className="flex-1">
            <StyledText className="text-slate-800 dark:text-dark-text font-bold">
              {item.company && typeof item.company === "object"
                ? item.company.name
                : "Empresa"}
            </StyledText>

            <StyledText className="text-slate-500 dark:text-dark-textMuted text-xs">
              {routeName}
            </StyledText>
          </StyledView>

          <StyledView className="bg-emerald-50 dark:bg-emerald-900 px-3 py-1 rounded-lg">
            <StyledText className="text-emerald-600 dark:text-emerald-400 font-bold">
              ${item.price}
            </StyledText>
          </StyledView>
        </StyledView>

        {/* ===== DETAILS ===== */}
        <StyledView className="flex-row justify-between border-t border-gray-100 dark:border-dark-border pt-3">
          <StyledView className="flex-row items-center space-x-1">
            <Calendar size={14} className="text-slate-500 dark:text-dark-textMuted" />
            <StyledText className="text-xs text-slate-600 dark:text-dark-textMuted">
              {format(new Date(item.date), "dd MMM", { locale: es })}
            </StyledText>
          </StyledView>

          <StyledView className="flex-row items-center space-x-1">
            <Clock size={14} className="text-slate-500 dark:text-dark-textMuted" />
            <StyledText className="text-xs text-slate-600 dark:text-dark-textMuted">
              {item.departureTime}
            </StyledText>
          </StyledView>

          <StyledView className="flex-row items-center space-x-1">
            <Ship size={14} className="text-slate-500 dark:text-dark-textMuted" />
            <StyledText className="text-xs text-slate-600 dark:text-dark-textMuted">
              {item.transportType}
            </StyledText>
          </StyledView>
        </StyledView>
      </TouchableOpacity>
    );
  };

  return (
    <AppContainer>
      <AppHeader
        title="Próximos Zarpes"
        neon
        showBack
        showAvatar={false}
      />

      {loading ? (
        <StyledView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00B4D8" />
        </StyledView>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item, index) =>
            item._id || item.id || index.toString()
          }
          refreshing={loading}
          onRefresh={loadTrips}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <StyledView className="items-center mt-10">
              <StyledView className="w-16 h-16 bg-gray-100 dark:bg-dark-surface rounded-full items-center justify-center mb-4">
                <Ship size={32} className="text-slate-400" />
              </StyledView>
              <StyledText className="text-slate-500 dark:text-dark-textMuted">
                No hay viajes programados.
              </StyledText>
            </StyledView>
          }
          renderItem={renderItem}
        />
      )}
    </AppContainer>
  );
}
