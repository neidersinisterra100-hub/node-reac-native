import {
  View,
  FlatList,
  Alert,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Map, ArrowRight } from "lucide-react-native";
import { styled } from "nativewind";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import { getAllRoutes, Route } from "../services/route.service";
import { getAllCompanies } from "../services/company.service";
import { getTrips } from "../services/trip.service";
import { useAuth } from "../context/AuthContext";

const StyledView = styled(View);

export default function AllRoutesScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyNamesById, setCompanyNamesById] = useState<Record<string, string>>({});
  const [companyByRouteKey, setCompanyByRouteKey] = useState<Record<string, string>>({});

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const [routesData, companiesData] = await Promise.all([
        getAllRoutes(),
        getAllCompanies(),
      ]);

      setRoutes(routesData);

      const companyMap = companiesData.reduce<Record<string, string>>((acc, company: any) => {
        if (company.id) acc[company.id] = company.name;
        if (company._id) acc[company._id] = company.name;
        return acc;
      }, {});
      setCompanyNamesById(companyMap);

      const allTrips = await getTrips();
      const routeMap = allTrips.reduce<Record<string, string>>((acc, trip: any) => {
        if (typeof trip.route !== "object") return acc;
        const key = `${trip.route.origin}__${trip.route.destination}`;
        if (acc[key]) return acc;

        if (typeof trip.company === "object" && trip.company?.name) {
          acc[key] = trip.company.name;
          return acc;
        }

        const tripCompanyId =
          typeof trip.company === "string"
            ? trip.company
            : trip.company?.id || trip.company?._id;
        if (tripCompanyId && companyMap[tripCompanyId]) {
          acc[key] = companyMap[tripCompanyId];
        }
        return acc;
      }, {});
      setCompanyByRouteKey(routeMap);
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
    const companyName =
      item.company && typeof item.company === "object"
        ? (item.company as any).name
        : (typeof item.company === "string" && companyNamesById[item.company])
          ? companyNamesById[item.company]
          : companyByRouteKey[`${item.origin}__${item.destination}`] || "Empresa";

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("RouteDetails", {
            routeId: item.id || item._id,
            origin: item.origin,
            destination: item.destination,
            companyName,
          })
        }
        className="mb-4 p-5 shadow-sm border-0 bg-white dark:bg-dark-surface rounded-2xl"
        style={{ borderLeftWidth: 4, borderLeftColor: "#0B4F9C" }}
      >
        <StyledView className="flex-row items-center">
          <StyledView className="bg-blue-50 dark:bg-blue-900/40 p-2.5 rounded-xl mr-4">
            <Map size={22} color="#0B4F9C" />
          </StyledView>

          <StyledView className="flex-1">
            <Text className="font-extrabold text-nautic-primary dark:text-blue-400 text-lg leading-tight">
              {item.origin}
            </Text>
            <StyledView className="flex-row items-center mt-1">
              <ArrowRight size={12} color="#94a3b8" />
              <Text className="ml-1 text-sm text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                {item.destination}
              </Text>
            </StyledView>
            <StyledView className="flex-row items-center mt-2">
              <StyledView className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                <Text className="text-[10px] text-nautic-primary font-black uppercase">
                  {companyName}
                </Text>
              </StyledView>
            </StyledView>
          </StyledView>
        </StyledView>
      </TouchableOpacity>
    );
  };

  return (
    <AppContainer>
      <AppHeader
        title="Todas las Rutas"
        neon
        showBack
        showAvatar={false}
      />

      {loading ? (
        <StyledView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00B4D8" />
        </StyledView>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id || item._id || ""}
          refreshing={loading}
          onRefresh={loadRoutes}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: 100,
            paddingHorizontal: 16, // ✅ mismo ancho que Viajes
          }}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
        />
      )}
    </AppContainer>
  );
}


// import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator } from "react-native";
// import { useEffect, useState } from "react";
// import { useNavigation } from "@react-navigation/native";
// import { Navigation } from "lucide-react-native";
// import { styled } from "nativewind";

// import AppContainer from "../components/ui/AppContainer";
// import AppHeader from "../components/ui/AppHeader";
// import { getAllRoutes, Route } from "../services/route.service";
// import { useAuth } from "../context/AuthContext";

// const StyledView = styled(View);

// export default function AllRoutesScreen() {
//   const navigation = useNavigation<any>();
//   const { user } = useAuth();

//   const [routes, setRoutes] = useState<Route[]>([]);
//   const [loading, setLoading] = useState(false);

//   const loadRoutes = async () => {
//     try {
//       setLoading(true);
//       const data = await getAllRoutes();
//       setRoutes(data);
//     } catch {
//       Alert.alert("Error", "No se pudieron cargar las rutas");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadRoutes();
//   }, []);

//   const renderItem = ({ item }: { item: Route }) => {
//     const companyName =
//       item.company && typeof item.company === "object"
//         ? (item.company as any).name
//         : "Empresa";

//     return (
//       <TouchableOpacity
//         onPress={() =>
//           navigation.navigate("Trips", {
//             routeId: item.id || item._id,
//             routeName: `${item.origin} - ${item.destination}`,
//             companyName,
//           })
//         }
//         className="
//           mb-4
//           rounded-2xl
//           border
//           border-slate-200
//           bg-white
//           p-4
//           shadow-sm

//           dark:border-dark-border
//           dark:bg-dark-surface
//         "
//       >
//         <View className="flex-row items-center gap-3">
//           {/* Icono */}
//           <View className="rounded-xl bg-nautic-secondary p-3 dark:bg-dark-bg">
//             <Navigation size={22} className="text-nautic-accent" />
//           </View>

//           {/* Texto */}
//           <View className="flex-1">
//             <Text className="text-base font-semibold text-slate-800 dark:text-dark-text">
//               {item.origin} → {item.destination}
//             </Text>

//             <Text className="text-sm font-medium text-nautic-primary dark:text-nautic-accent">
//               {companyName}
//             </Text>

//             <Text className="mt-1 text-xs text-slate-500 dark:text-dark-textMuted">
//               {user?.role === "owner"
//                 ? "Toca para gestionar viajes"
//                 : "Ver horarios disponibles"}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <AppContainer>
//       <AppHeader title="Todas las Rutas" neon showBack showAvatar={false} />

//       {loading ? (
//         <StyledView className="flex-1 items-center justify-center">
//           <ActivityIndicator size="large" className="text-nautic-accent" />
//         </StyledView>
//       ) : (
//         <FlatList
//           data={routes}
//           keyExtractor={(item) => item.id || item._id || ""}
//           refreshing={loading}
//           onRefresh={loadRoutes}
//           contentContainerStyle={{
//             paddingTop: 10,
//             paddingBottom: 100,
//             paddingHorizontal: 16, // 🔒 MISMO QUE VIAJES
//           }}
//           showsVerticalScrollIndicator={false}
//           renderItem={renderItem}
//         />
//       )}
//     </AppContainer>
//   );
// }
