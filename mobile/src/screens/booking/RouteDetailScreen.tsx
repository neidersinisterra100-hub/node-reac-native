import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { styled } from "nativewind";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MapPinned, CalendarClock, ArrowRight } from "lucide-react-native";
import { ListSkeleton } from "../../components/ui/Skeletons";

import { ScreenContainer } from "../../components/ui/ScreenContainer";
import { Card, PressableCard } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { RootStackParamList } from "../../navigation/types";
import { getTrips, Trip } from "../../services/trip.service";
import { formatTimeAmPm } from "../../utils/time";

const StyledText = styled(Text);
const StyledView = styled(View);

type RouteDetailsRouteProp = RouteProp<RootStackParamList, "RouteDetails">;

export function RouteDetailScreen() {
  const route = useRoute<RouteDetailsRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { routeId, origin, destination, companyName } = route.params;

  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    loadRouteTrips();
  }, [routeId, origin, destination]);

  const loadRouteTrips = async () => {
    try {
      setLoading(true);
      const allTrips = await getTrips();

      const byRouteId = allTrips.filter((trip: any) => {
        const tripRouteId =
          typeof trip.route === "object"
            ? trip.route?.id || trip.route?._id
            : trip.route;
        return routeId && tripRouteId === routeId;
      });

      const filteredByPath = allTrips.filter((trip: any) => {
        if (typeof trip.route !== "object") return false;
        return trip.route?.origin === origin && trip.route?.destination === destination;
      });

      const finalTrips = byRouteId.length > 0 ? byRouteId : filteredByPath;
      setTrips(finalTrips.slice(0, 5));
    } catch (error) {
      console.log("Error loading route trips", error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const routeLabel = useMemo(() => `${origin} - ${destination}`, [origin, destination]);
  const resolvedCompanyName = useMemo(() => {
    if (companyName && companyName !== "Empresa") {
      return companyName;
    }

    const fromTrip = trips.find((trip: any) => {
      if (typeof trip.company === "object" && trip.company?.name) return true;
      return false;
    });
    if (fromTrip && typeof fromTrip.company === "object") {
      return fromTrip.company.name;
    }

    return "Empresa";
  }, [companyName, trips]);

  return (
    <ScreenContainer withPadding={false}>
      <StyledView className="flex-1">
        <StyledView className="flex-row items-center px-4 py-4">
          <Button
            title="Atrás"
            onPress={() => navigation.goBack()}
            variant="ghost"
            className="p-0 mr-4"
          />
          <StyledText className="text-xl font-bold text-nautic-primary">Detalle de Ruta</StyledText>
        </StyledView>

        <FlatList
          data={trips}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          ListHeaderComponent={
            <Card className="p-0 overflow-hidden">
              <StyledView className="bg-nautic-primary p-6 items-center">
                <MapPinned size={46} color="#FFFFFF" />
                <StyledText className="mt-2 text-xl font-bold text-white uppercase">
                  Ruta Activa
                </StyledText>
              </StyledView>

              <StyledView className="p-6">
                <StyledText className="text-xs font-bold uppercase text-gray-400">Trayecto</StyledText>
                <StyledText className="text-lg font-bold text-nautic-text mt-1">{routeLabel}</StyledText>

                <StyledText className="text-xs font-bold uppercase text-gray-400 mt-5">Empresa</StyledText>
                <StyledText className="text-base font-bold text-nautic-text mt-1">
                  {resolvedCompanyName}
                </StyledText>

                <Button
                  title="Ver todos los viajes"
                  className="mt-6"
                  onPress={() =>
                    navigation.navigate("AllTrips", {
                      origin,
                      destination,
                    })
                  }
                />
              </StyledView>
            </Card>
          }
          renderItem={({ item }) => (
            <PressableCard
              className="mb-3"
              onPress={() =>
                navigation.navigate("TripDetails", {
                  tripId: item._id || item.id,
                  trip: item,
                })
              }
            >
              <StyledView className="flex-row items-center justify-between">
                <StyledView className="flex-row items-center">
                  <StyledView className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center mr-3">
                    <CalendarClock size={18} color="#10B981" />
                  </StyledView>
                  <StyledView>
                    <StyledText className="font-bold text-gray-800">
                      {item.date} • {formatTimeAmPm(item.departureTime)}
                    </StyledText>
                    <StyledText className="text-xs text-gray-500">
                      ${Number(item.price || 0).toLocaleString("es-CO")} • {item.transportType || "Lancha"}
                    </StyledText>
                  </StyledView>
                </StyledView>
                <ArrowRight size={18} color="#0B4F9C" />
              </StyledView>
            </PressableCard>
          )}
          ListEmptyComponent={
            loading ? (
              <ListSkeleton count={3} />
            ) : (
              <StyledView className="items-center justify-center py-10 px-2">
                <StyledText className="text-gray-500 mb-3">
                  No hay viajes disponibles para esta ruta.
                </StyledText>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("AllTrips", {
                      origin,
                      destination,
                    })
                  }
                >
                  <StyledText className="text-nautic-primary font-bold">Buscar en lista completa</StyledText>
                </TouchableOpacity>
              </StyledView>
            )
          }
        />
      </StyledView>
    </ScreenContainer>
  );
}
