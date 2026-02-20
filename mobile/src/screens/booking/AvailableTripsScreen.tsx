import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { styled } from "nativewind";
import { ScreenContainer } from "../../components/ui/ScreenContainer";
import { PressableCard } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { getTrips, Trip } from "../../services/trip.service";
import { getAllCompanies } from "../../services/company.service";
import { Clock, Users, ArrowRight, Search } from "lucide-react-native";
import { formatTimeAmPm } from "../../utils/time";

const StyledText = styled(Text);
const StyledView = styled(View);

type AvailableTripsRouteProp = RouteProp<RootStackParamList, "AllTrips">;

export const AvailableTripsScreen = () => {
  const route = useRoute<AvailableTripsRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { origin, destination } = route.params || {};

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyNamesById, setCompanyNamesById] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTrips();
  }, [origin, destination]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const [allTrips, companies] = await Promise.all([
        getTrips(),
        getAllCompanies(),
      ]);

      let filtered = allTrips;

      if (origin && destination) {
        filtered = allTrips.filter(
          (t: any) =>
            t.route?.origin === origin &&
            t.route?.destination === destination
        );
      }

      setTrips(filtered);

      const companyMap = companies.reduce<Record<string, string>>((acc, company: any) => {
        if (company.id) acc[company.id] = company.name;
        if (company._id) acc[company._id] = company.name;
        return acc;
      }, {});
      setCompanyNamesById(companyMap);
    } finally {
      setLoading(false);
    }
  };

  const getTripCompanyName = (item: Trip) => {
    if (typeof item.company === "object" && item.company?.name) {
      return item.company.name;
    }

    const companyId =
      typeof item.company === "string"
        ? item.company
        : item.company?.id || item.company?._id;

    if (companyId && companyNamesById[companyId]) {
      return companyNamesById[companyId];
    }

    return "Empresa";
  };

  const renderItem = ({ item }: { item: Trip }) => (
    <PressableCard
      onPress={() =>
        navigation.navigate("TripDetails", {
          tripId: item._id || item.id,
          trip: item,
        })
      }
      className="mt-2"
    >
      {/* HEADER */}
      <StyledView className="flex-row justify-between items-start mb-2">
        <StyledView className="bg-blue-100 px-3 py-1 rounded-full">
          <StyledText className="text-nautic-primary text-xs font-bold uppercase">
            {item.transportType || "Lancha"}
          </StyledText>
        </StyledView>

        <StyledText className="text-lg font-bold text-nautic-primary">
          ${item.price?.toLocaleString()}
        </StyledText>
      </StyledView>

      {/* DATE */}
      <StyledView className="flex-row items-center mb-4 bg-blue-50 p-2 rounded-lg">
        <Clock size={20} color="#00B4D8" />
        <StyledText className="ml-2 font-bold text-nautic-primary">
          {item.date} • {formatTimeAmPm(item.departureTime)}
        </StyledText>
      </StyledView>

      <StyledText className="mb-3 text-xs text-gray-500">
        {getTripCompanyName(item)}
      </StyledText>

      {/* FOOTER */}
      <StyledView className="flex-row justify-between items-center border-t border-gray-100 pt-3">
        <StyledView className="flex-row items-center">
          <Users size={16} color="#64748B" />
          <StyledText className="ml-2 text-sm text-gray-500">
            {item.capacity || 0} cupos
          </StyledText>
        </StyledView>

        <StyledView className="flex-row items-center">
          <StyledText className="mr-1 font-bold text-nautic-accent">
            Ver detalle
          </StyledText>
          <ArrowRight size={16} color="#00B4D8" />
        </StyledView>
      </StyledView>
    </PressableCard>
  );

  return (
    <ScreenContainer withPadding={false}>
      {/* HEADER */}
      <StyledView className="px-4 pt-4 pb-2 bg-white border-b border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <StyledText className="font-bold text-nautic-primary">
            Atrás
          </StyledText>
        </TouchableOpacity>

        <StyledView className="items-center">
          <StyledText className="text-xs text-nautic-lightText">
            VIAJES DE
          </StyledText>
          <StyledText className="text-lg font-bold text-nautic-primary">
            {origin || "Todos"} → {destination || "Todos"}
          </StyledText>
        </StyledView>

        <TouchableOpacity
          onPress={() => navigation.navigate("LocationSelection")}
        >
          <Search size={24} color="#0B4F9C" />
        </TouchableOpacity>
      </StyledView>

      {/* LIST */}
      <FlatList
        data={trips}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTrips} />
        }
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: 100,
          paddingHorizontal: 16, // 🔒 EXACTAMENTE igual que Routes
        }}
        ListEmptyComponent={
          !loading ? (
            <StyledView className="items-center justify-center p-8 mt-10">
              <StyledText className="text-center text-nautic-lightText mb-4">
                No se encontraron viajes disponibles.
              </StyledText>
              <Button
                title="Volver a buscar"
                onPress={() => navigation.goBack()}
                variant="outline"
              />
            </StyledView>
          ) : null
        }
      />
    </ScreenContainer>
  );
};





// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
// import { styled } from 'nativewind';
// import { ScreenContainer } from '../../components/ui/ScreenContainer';
// import { Card, PressableCard } from '../../components/ui/Card';
// import { Button } from '../../components/ui/Button';
// import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../../navigation/types';
// import { getTrips as getAllTrips, Trip } from '../../services/trip.service'; // Aliasing for compatibility
// import { format } from 'date-fns';
// import { es } from 'date-fns/locale';
// import { Clock, Users, ArrowRight, Search } from 'lucide-react-native';

// const StyledText = styled(Text);
// const StyledView = styled(View);

// type AvailableTripsRouteProp = RouteProp<RootStackParamList, 'AllTrips'>;

// // We might need to extend RootStackParamList to include search params for AllTrips if not present
// // Assuming local modification or handling
// export const AvailableTripsScreen = () => {
//     const route = useRoute<AvailableTripsRouteProp>();
//     const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

//     // @ts-ignore - Parameters passed from LocationSelection but maybe not strictly typed yet
//     const { origin, destination } = route.params || {};

//     const [trips, setTrips] = useState<Trip[]>([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         loadTrips();
//     }, [origin, destination]);

//     const loadTrips = async () => {
//         setLoading(true);
//         try {
//             // Fetch ALL trips and filter client side for now, 
//             // as endpoint seems to be getAllTrips()
//             const allTrips = await getAllTrips();

//             let filtered = allTrips;

//             if (origin && destination) {
//                 filtered = allTrips.filter(
//                     (t: any) =>
//                         // Route object might be populated or just ID. 
//                         // If it's populated:
//                         t.route?.origin === origin &&
//                         t.route?.destination === destination
//                     // If backend doesn't populate route, we can't filter easily this way without routeId
//                     // Assuming populated based on usual mongoose patterns or frontend needs
//                 );
//             }

//             // Filter only active and future trips
//             // filtered = filtered.filter(t => t.isActive); 

//             setTrips(filtered);
//         } catch (error) {
//             console.error(error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const renderItem = ({ item }: { item: Trip }) => (
//         <PressableCard
//             onPress={() => navigation.navigate('TripDetails', {
//                 tripId: item._id || item.id,
//                 trip: item // 👈 Pass full object to avoid 404 fetch
//             })}
//             className="mx-4 mt-2"
//         >
//             <StyledView className="flex-row justify-between items-start mb-2">
//                 <StyledView className="bg-blue-100 px-3 py-1 rounded-full">
//                     <StyledText className="text-nautic-primary text-xs font-bold uppercase">{item.transportType || 'Lancha'}</StyledText>
//                 </StyledView>
//                 <StyledText className="text-lg font-bold text-nautic-primary">${item.price?.toLocaleString()}</StyledText>
//             </StyledView>

//             <StyledView className="flex-row items-center mb-4 bg-blue-50 p-2 rounded-lg">
//                 <Clock size={20} color="#00B4D8" />
//                 <StyledText className="text-nautic-primary ml-2 font-bold text-base">
//                     {item.date} • {item.departureTime}
//                 </StyledText>
//             </StyledView>

//             <StyledView className="flex-row justify-between items-center border-t border-gray-100 pt-3">
//                 <StyledView className="flex-row items-center">
//                     <Users size={16} color="#64748B" />
//                     <StyledText className="text-gray-500 ml-2 text-sm">{item.capacity || 0} cupos</StyledText>
//                 </StyledView>
//                 <StyledView className="flex-row items-center">
//                     <StyledText className="text-nautic-accent font-bold mr-1">Ver Detalle</StyledText>
//                     <ArrowRight size={16} color="#00B4D8" />
//                 </StyledView>
//             </StyledView>
//         </PressableCard>
//     );

//     return (
//         <ScreenContainer withPadding={false}>
//             <StyledView className="px-4 pt-4 pb-2 bg-white border-b border-gray-100 z-10 flex-row items-center justify-between">
//                 <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
//                     {/* Back Icon */}
//                     <StyledText className="text-nautic-primary font-bold">Atrás</StyledText>
//                 </TouchableOpacity>
//                 <StyledView className="items-center">
//                     <StyledText className="text-nautic-lightText text-xs">VIAJES DE</StyledText>
//                     <StyledText className="text-nautic-primary font-bold text-lg">
//                         {origin || 'Todos'} ➡️ {destination || 'Todos'}
//                     </StyledText>
//                 </StyledView>
//                 <TouchableOpacity onPress={() => navigation.navigate('LocationSelection')} className="p-2">
//                     <Search size={24} color="#0B4F9C" />
//                 </TouchableOpacity>
//             </StyledView>

//             <FlatList
//                 data={trips}
//                 keyExtractor={(item) => item._id || item.id}
//                 renderItem={renderItem}
//                 contentContainerStyle={{ paddingVertical: 16 }}
//                 refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTrips} />}
//                 ListEmptyComponent={
//                     !loading ? (
//                         <StyledView className="items-center justify-center p-8 mt-10">
//                             <StyledText className="text-nautic-lightText text-center mb-4">No se encontraron viajes disponibles para esta ruta.</StyledText>
//                             <Button title="Volver a buscar" onPress={() => navigation.goBack()} variant="outline" />
//                         </StyledView>
//                     ) : null
//                 }
//             />
//         </ScreenContainer>
//     );
// };
