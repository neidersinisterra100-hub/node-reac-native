import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Clock, Ship } from 'lucide-react-native';
import { Trip } from '../../services/trip.service';
import { api } from '../../services/api';
import { ActivityIndicator } from "react-native";

const StyledText = styled(Text);
const StyledView = styled(View);

type TripDetailRouteProp = RouteProp<RootStackParamList, 'TripDetails'>;

export const TripDetailScreen = () => {
  const route = useRoute<TripDetailRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { tripId, trip: initialTrip } = route.params;

  const [trip, setTrip] = useState<Trip | null>(initialTrip || null);
  const [loading, setLoading] = useState(!initialTrip);

  useEffect(() => {
    if (!initialTrip && tripId) {
      loadTripDetails();
    }
  }, [tripId, initialTrip]);

  const loadTripDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Trip>(`/trips/${tripId}`);
      setTrip(data);
    } catch (error) {
      console.error("Error loading trip details:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <ScreenContainer>
        <StyledView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0B4F9C" />
        </StyledView>
      </ScreenContainer>
    );
  }

  if (!trip) {
    return (
      <ScreenContainer>
        <StyledView className="flex-1 items-center justify-center">
          <StyledText className="mb-4 text-gray-500">
            Viaje no encontrado
          </StyledText>
          <Button title="Volver" onPress={() => navigation.goBack()} />
        </StyledView>
      </ScreenContainer>
    );
  }

  const routeName =
    typeof trip.route === "object"
      ? `${trip.route.origin} - ${trip.route.destination}`
      : "Ruta seleccionada";


  /* ================= VIEW ================= */

  return (
    <ScreenContainer withPadding={false}>
      <StyledView className="flex-1">
        {/* HEADER */}
        <StyledView className="flex-row items-center px-4 py-4">
          <Button
            title="Atrás"
            onPress={() => navigation.goBack()}
            variant="ghost"
            className="p-0 mr-4"
          />
          <StyledText className="text-xl font-bold text-nautic-primary">
            Detalle del Viaje
          </StyledText>
        </StyledView>

        {/* CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 120, // 👈 espacio para el footer
          }}
        >
          <Card className="p-0 overflow-hidden">
            {/* CARD HEADER */}
            <StyledView className="bg-nautic-primary p-6 items-center">
              <Ship size={48} color="#FFFFFF" />
              <StyledText className="mt-2 text-xl font-bold text-white uppercase">
                {trip.transportType || "Lancha"}
              </StyledText>
            </StyledView>

            {/* CARD BODY */}
            <StyledView className="p-6">
              {/* ROUTE */}
              <StyledView className="mb-6 flex-row items-center">
                <StyledView className="mr-4 items-center">
                  <StyledView className="h-3 w-3 rounded-full bg-nautic-primary" />
                  <StyledView className="my-1 h-10 w-0.5 bg-gray-200" />
                  <StyledView className="h-3 w-3 rounded-full bg-nautic-accent" />
                </StyledView>

                <StyledView>
                  <StyledView className="mb-4">
                    <StyledText className="text-xs font-bold uppercase text-gray-400">
                      Origen
                    </StyledText>
                    <StyledText className="text-lg font-bold text-nautic-text">
                      {typeof trip.route === "object"
                        ? trip.route.origin
                        : "Origen"}
                    </StyledText>
                  </StyledView>

                  <StyledView>
                    <StyledText className="text-xs font-bold uppercase text-gray-400">
                      Destino
                    </StyledText>
                    <StyledText className="text-lg font-bold text-nautic-text">
                      {typeof trip.route === "object"
                        ? trip.route.destination
                        : "Destino"}
                    </StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>

              {/* INFO */}
              <StyledView className="mb-6 flex-row justify-between rounded-xl bg-gray-50 p-4">
                <StyledView>
                  <StyledText className="mb-1 text-xs font-bold uppercase text-gray-400">
                    Fecha
                  </StyledText>
                  <StyledText className="font-bold text-nautic-navy">
                    {trip.date}
                  </StyledText>
                </StyledView>

                <StyledView>
                  <StyledText className="mb-1 text-xs font-bold uppercase text-gray-400">
                    Hora
                  </StyledText>
                  <StyledText className="font-bold text-nautic-navy">
                    {trip.departureTime}
                  </StyledText>
                </StyledView>

                <StyledView>
                  <StyledText className="mb-1 text-xs font-bold uppercase text-gray-400">
                    Precio
                  </StyledText>
                  <StyledText className="text-lg font-bold text-nautic-primary">
                    ${trip.price?.toLocaleString()}
                  </StyledText>
                </StyledView>
              </StyledView>

              {/* COMPANY */}
              <StyledView>
                <StyledText className="mb-2 text-sm text-gray-400">
                  Empresa operadora
                </StyledText>
                <StyledText className="text-base font-bold text-nautic-text">
                  {typeof trip.company === "object"
                    ? trip.company.name
                    : "NauticGo Partner"}
                </StyledText>
              </StyledView>
            </StyledView>
          </Card>
        </ScrollView>

        {/* FIXED FOOTER */}
        <StyledView className="border-t border-gray-200 bg-white p-4">
          <Button
            title="Seleccionar Asientos"
            onPress={() => {
              if (!trip) return;

              const routeName =
                typeof trip.route === "object"
                  ? `${trip.route.origin} - ${trip.route.destination}`
                  : "Ruta seleccionada";

              navigation.navigate('SeatSelection', {
                tripId: trip._id || trip.id,
                routeName,
                price: trip.price,
                date: trip.date,
                time: trip.departureTime,
              });
            }}
          />
        </StyledView>
      </StyledView>
    </ScreenContainer>
  );
};




// import React, { useEffect, useState } from 'react';
// import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
// import { styled } from 'nativewind';
// import { ScreenContainer } from '../../components/ui/ScreenContainer';
// import { Button } from '../../components/ui/Button';
// import { Card } from '../../components/ui/Card';
// import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../../navigation/types';
// import { api } from '../../services/api';
// import { Trip } from '../../services/trip.service';
// import { Clock, MapPin, DollarSign, Ship } from 'lucide-react-native';

// const StyledText = styled(Text);
// const StyledView = styled(View);

// type TripDetailRouteProp = RouteProp<RootStackParamList, 'TripDetails'>;

// export const TripDetailScreen = () => {
//     const route = useRoute<TripDetailRouteProp>();
//     const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
//     const { tripId, trip: initialTrip } = route.params;

//     const [trip, setTrip] = useState<Trip | null>(initialTrip || null);
//     const [loading, setLoading] = useState(!initialTrip);

//     useEffect(() => {
//         if (!initialTrip && tripId) {
//             loadTripDetails();
//         }
//     }, [tripId, initialTrip]);

//     const loadTripDetails = async () => {
//         try {
//             setLoading(true);
//             const { data } = await api.get<Trip>(`/trips/${tripId}`);
//             setTrip(data);
//         } catch (error) {
//             console.error("Error loading trip details:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) {
//         return (
//             <ScreenContainer>
//                 <StyledView className="flex-1 justify-center items-center">
//                     <ActivityIndicator size="large" color="#0B4F9C" />
//                 </StyledView>
//             </ScreenContainer>
//         );
//     }

//     if (!trip) {
//         return (
//             <ScreenContainer>
//                 <StyledView className="flex-1 justify-center items-center">
//                     <StyledText>Viaje no encontrado</StyledText>
//                     <Button title="Volver" onPress={() => navigation.goBack()} className="mt-4" />
//                 </StyledView>
//             </ScreenContainer>
//         );
//     }

//     return (
//         <ScreenContainer withPadding>
//             <StyledView className="flex-1">
//                 <StyledView className="flex-row items-center mb-6 mt-2">
//                     <Button
//                         title="Atrás"
//                         onPress={() => navigation.goBack()}
//                         variant="ghost"
//                         className="p-0 mr-4"
//                     />
//                     <StyledText className="text-xl font-bold text-nautic-primary">Detalle del Viaje</StyledText>
//                 </StyledView>

//                 <ScrollView showsVerticalScrollIndicator={false}>
//                     <Card className="p-0 overflow-hidden">
//                         <StyledView className="bg-nautic-primary p-6 items-center">
//                             <Ship size={48} color="#FFFFFF" />
//                             <StyledText className="text-white text-xl font-bold mt-2 uppercase">{trip.transportType || 'Lancha'}</StyledText>
//                         </StyledView>

//                         <StyledView className="p-6">
//                             {/* Route Info */}
//                             <StyledView className="flex-row items-center mb-6">
//                                 <StyledView className="items-center mr-4">
//                                     <StyledView className="w-3 h-3 rounded-full bg-nautic-primary" />
//                                     <StyledView className="w-0.5 h-10 bg-gray-200 my-1" />
//                                     <StyledView className="w-3 h-3 rounded-full bg-nautic-accent" />
//                                 </StyledView>
//                                 <StyledView>
//                                     <StyledView className="mb-4">
//                                         <StyledText className="text-xs text-gray-400 font-bold uppercase">Origen</StyledText>
//                                         <StyledText className="text-lg font-bold text-nautic-text">
//                                             {typeof trip.route === 'object' ? trip.route.origin : 'Origen'}
//                                         </StyledText>
//                                     </StyledView>
//                                     <StyledView>
//                                         <StyledText className="text-xs text-gray-400 font-bold uppercase">Destino</StyledText>
//                                         <StyledText className="text-lg font-bold text-nautic-text">
//                                             {typeof trip.route === 'object' ? trip.route.destination : 'Destino'}
//                                         </StyledText>
//                                     </StyledView>
//                                 </StyledView>
//                             </StyledView>

//                             <StyledView className="flex-row justify-between mb-6 bg-gray-50 p-4 rounded-xl">
//                                 <StyledView>
//                                     <StyledText className="text-gray-400 text-xs font-bold uppercase mb-1">Fecha</StyledText>
//                                     <StyledText className="text-nautic-navy font-bold">{trip.date}</StyledText>
//                                 </StyledView>
//                                 <StyledView>
//                                     <StyledText className="text-gray-400 text-xs font-bold uppercase mb-1">Hora</StyledText>
//                                     <StyledText className="text-nautic-navy font-bold">{trip.departureTime}</StyledText>
//                                 </StyledView>
//                                 <StyledView>
//                                     <StyledText className="text-gray-400 text-xs font-bold uppercase mb-1">Precio</StyledText>
//                                     <StyledText className="text-nautic-primary font-bold text-lg">${trip.price?.toLocaleString()}</StyledText>
//                                 </StyledView>
//                             </StyledView>

//                             <StyledView>
//                                 <StyledText className="text-gray-400 text-sm mb-2">Empresa operadora</StyledText>
//                                 <StyledText className="font-bold text-nautic-text text-base">
//                                     {typeof trip.company === 'object' ? trip.company.name : 'NauticGo Partner'}
//                                 </StyledText>
//                             </StyledView>
//                         </StyledView>
//                     </Card>
//                 </ScrollView>

//                 <StyledView className="py-4">
//                     <Button
//                         title="Seleccionar Asientos"
//                         onPress={() => navigation.navigate('SeatSelection', { tripId: trip._id || trip.id })}
//                     />
//                 </StyledView>
//             </StyledView>
//         </ScreenContainer>
//     );
// };
