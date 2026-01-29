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
import { Navigation } from "lucide-react-native";
import { styled } from "nativewind";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import { getAllRoutes, Route } from "../services/route.service";
import { useAuth } from "../context/AuthContext";

const StyledView = styled(View);

export default function AllRoutesScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await getAllRoutes();
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
    const companyName =
      item.company && typeof item.company === "object"
        ? (item.company as any).name
        : "Empresa";

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("AllTrips", {
            origin: item.origin,
            destination: item.destination,
          })
        }
        className="
          mb-4
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm

          dark:border-dark-border
          dark:bg-dark-surface
        "
      >
        <View className="flex-row items-center gap-3">
          {/* Icono */}
          <View className="rounded-xl bg-nautic-secondary p-3 dark:bg-dark-bg">
            <Navigation size={22} className="text-nautic-accent" />
          </View>

          {/* Texto */}
          <View className="flex-1">
            <Text className="text-base font-semibold text-slate-800 dark:text-dark-text">
              {item.origin} → {item.destination}
            </Text>

            <Text className="text-sm font-medium text-nautic-primary dark:text-nautic-accent">
              {companyName}
            </Text>

            <Text className="mt-1 text-xs text-slate-500 dark:text-dark-textMuted">
              {user?.role === "owner"
                ? "Toca para gestionar viajes"
                : "Ver horarios disponibles"}
            </Text>
          </View>
        </View>
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
