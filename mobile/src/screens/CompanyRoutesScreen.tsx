import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { styled } from "nativewind";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ScreenContainer } from "../components/ui/ScreenContainer";
import { Card } from "../components/ui/Card";
import { getCompanyRoutes, toggleRouteActive, deleteRoute, Route } from "../services/route.service";
import { useAuth } from "../context/AuthContext";
import { MapPin, Power, Trash2, Plus, ArrowLeft } from "lucide-react-native";

const StyledText = styled(Text);
const StyledView = styled(View);

type CompanyRoutesScreenRouteProp = RouteProp<
  RootStackParamList,
  "CompanyRoutes"
>;

export const CompanyRoutesScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<CompanyRoutesScreenRouteProp>();

  const companyId = route.params?.companyId;
  const companyName = route.params?.companyName;

  const { user } = useAuth();
  const isOwner = user?.role === "owner" || user?.role === "admin";

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD ROUTES
  ========================= */
  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    loadRoutes();
  }, [companyId]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await getCompanyRoutes(companyId);
      const unique = Array.from(
        new Map(data.map(r => [r._id || r.id, r])).values()
      );
      setRoutes(unique);
    } catch (e) {
      Alert.alert("Error", "No se pudieron cargar las rutas.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ACTIONS
  ========================= */
  const handleToggle = async (id: string, active: boolean) => {
    try {
      await toggleRouteActive(id);
      setRoutes(prev =>
        prev.map(r =>
          (r._id || r.id) === id
            ? { ...r, active: !active, isActive: !active }
            : r
        )
      );
    } catch {
      Alert.alert("Error", "No se pudo cambiar el estado.");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Eliminar ruta", "¿Seguro que deseas eliminarla?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRoute(id);
            setRoutes(prev =>
              prev.filter(r => (r._id || r.id) !== id)
            );
          } catch {
            Alert.alert("Error", "No se pudo eliminar.");
          }
        },
      },
    ]);
  };

  /* =========================
     ITEM
  ========================= */
  const renderItem = ({ item }: { item: Route }) => {
  const active = Boolean(item.isActive ?? item.active);
  // const renderItem = ({ item }: { item: Route }) => {
  //   const active = item.isActive ?? item.active;

    return (
      <Card
        className={`mb-3 p-4 flex-row justify-between items-center ${
          !active ? "opacity-60" : ""
        }`}
      >
        <TouchableOpacity
          className="flex-1"
          onPress={() =>
            navigation.navigate("Trips", {
              routeId: item._id || item.id,
              routeName: `${item.origin} - ${item.destination}`,
              companyName,
            })
          }
        >
          <StyledView className="flex-row items-center mb-1">
            <StyledView className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
              <MapPin size={20} color="#0B4F9C" />
            </StyledView>

            <StyledView>
              <StyledText className="font-bold text-nautic-primary dark:text-blue-400 text-lg">
                {item.origin}
              </StyledText>
              <StyledText className="text-xs text-slate-400 font-bold">
                DESTINO: {item.destination}
              </StyledText>
            </StyledView>
          </StyledView>

          <StyledText
            className={`text-xs font-bold mt-1 ${
              active ? "text-green-600" : "text-slate-400"
            }`}
          >
            {active ? "ACTIVA" : "INACTIVA"}
          </StyledText>
        </TouchableOpacity>

        {isOwner && (
          <StyledView className="flex-row items-center">
            <TouchableOpacity
              onPress={() =>
                handleToggle(item._id || item.id, active)
              }
              className={`p-2 rounded-full ${
                active
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <Power
                size={18}
                color={active ? "#15803d" : "#94a3b8"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDelete(item._id || item.id)}
              className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 ml-2"
            >
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </StyledView>
        )}
      </Card>
    );
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <ScreenContainer withPadding={false}>
      {/* HEADER */}
      <StyledView className="bg-nautic-primary dark:bg-slate-900 pt-12 pb-6 px-6 rounded-b-3xl shadow-sm mb-4 flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-white/20 p-2 rounded-full"
        >
          <ArrowLeft size={22} color="white" />
        </TouchableOpacity>

        <StyledText className="text-white text-xl font-bold flex-1">
          {companyName || "Gestión de rutas"}
        </StyledText>
      </StyledView>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0B4F9C"
          className="mt-8"
        />
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item, i) =>
            item._id || item.id || String(i)
          }
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <StyledText className="text-center text-slate-400 mt-10">
              No hay rutas registradas.
            </StyledText>
          }
        />
      )}

      {/* FAB */}
      {isOwner && !loading && (
        <StyledView className="absolute bottom-6 right-6">
          <TouchableOpacity
            className="bg-nautic-accent w-14 h-14 rounded-full items-center justify-center shadow-lg"
            onPress={() =>
              navigation.navigate("CreateRoute", {
                companyId: companyId!,
              })
            }
          >
            <Plus size={28} color="white" />
          </TouchableOpacity>
        </StyledView>
      )}
    </ScreenContainer>
  );
};



// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
// import { styled } from 'nativewind';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../navigation/types';
// import { ScreenContainer } from '../components/ui/ScreenContainer';
// import { Card } from '../components/ui/Card';
// import { Button } from '../components/ui/Button';
// import { getCompanyRoutes, toggleRouteActive, deleteRoute, Route } from '../services/route.service';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
// import { MapPin, Power, Trash2, Plus, ArrowLeft } from 'lucide-react-native';

// const StyledText = styled(Text);
// const StyledView = styled(View);

// type CompanyRoutesScreenRouteProp = RouteProp<RootStackParamList, 'CompanyRoutes'>;

// export const CompanyRoutesScreen = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
//   const route = useRoute<CompanyRoutesScreenRouteProp>();

//   // Obtener parámetros de manera segura, con fallback
//   const companyId = route.params?.companyId;
//   const companyName = route.params?.companyName;

//   const { user } = useAuth();
//   const { isDark } = useTheme();
//   const isOwner = user?.role === 'owner' || user?.role === 'admin';

//   const [routes, setRoutes] = useState<Route[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (companyId) {
//       loadRoutes();
//     } else {
//       console.error("No companyId provided to CompanyRoutesScreen");
//       setLoading(false);
//     }
//   }, [companyId]);

//   const loadRoutes = async () => {
//     try {
//       setLoading(true);
//       const data = await getCompanyRoutes(companyId);
//       // Eliminar duplicados
//       const uniqueRoutes = Array.from(new Map(data.map(r => [r._id || r.id, r])).values());
//       setRoutes(uniqueRoutes);
//     } catch (error) {
//       console.error("Error loading routes", error);
//       Alert.alert("Error", "No se pudieron cargar las rutas.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggle = async (routeId: string, currentStatus: boolean) => {
//     try {
//       await toggleRouteActive(routeId);
//       setRoutes(prev => prev.map(r =>
//         (r._id || r.id) === routeId
//           ? { ...r, active: !currentStatus, isActive: !currentStatus }
//           : r
//       ));
//     } catch {
//       Alert.alert("Error", "No se pudo cambiar el estado.");
//     }
//   };

//   const handleDelete = (routeId: string) => {
//     Alert.alert("Eliminar Ruta", "¿Estás seguro?", [
//       { text: "Cancelar", style: "cancel" },
//       {
//         text: "Eliminar",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await deleteRoute(routeId);
//             setRoutes(prev => prev.filter(r => (r._id || r.id) !== routeId));
//           } catch {
//             Alert.alert("Error", "No se pudo eliminar.");
//           }
//         }
//       }
//     ]);
//   };

//   const renderItem = ({ item }: { item: Route }) => (
//     <Card className={`mb-3 p-4 flex-row justify-between items-center ${!(item.isActive ?? item.active) ? 'opacity-60' : ''}`}>
//       <TouchableOpacity
//         className="flex-1"
//         onPress={() => navigation.navigate('Trips', {
//           routeId: item._id || item.id,
//           routeName: `${item.origin} - ${item.destination}`,
//           companyName: companyName
//         })}
//       >
//         <StyledView className="flex-row items-center mb-1">
//           <StyledView className="bg-blue-50 p-2 rounded-lg mr-3">
//             <MapPin size={20} color="#0B4F9C" />
//           </StyledView>
//           <StyledView>
//             <StyledText className="font-bold text-nautic-primary text-lg">{item.origin}</StyledText>
//             <StyledText className="text-xs text-gray-400 font-bold">DESTINO: {item.destination}</StyledText>
//           </StyledView>
//         </StyledView>
//         <StyledText className={`text-xs font-bold mt-1 ${(item.isActive ?? item.active) ? 'text-green-600' : 'text-gray-400'}`}>
//           {(item.isActive ?? item.active) ? 'ACTIVA' : 'INACTIVA'}
//         </StyledText>
//       </TouchableOpacity>

//       {isOwner && (
//         <StyledView className="flex-row items-center space-x-2">
//           <TouchableOpacity
//             onPress={() => handleToggle(item._id || item.id, !!(item.isActive ?? item.active))}
//             className={`p-2 rounded-full ${(item.isActive ?? item.active) ? 'bg-green-100' : 'bg-gray-100'}`}
//           >
//             <Power size={18} color={(item.isActive ?? item.active) ? '#15803d' : '#9ca3af'} />
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => handleDelete(item._id || item.id)}
//             className="p-2 rounded-full bg-red-50 ml-2"
//           >
//             <Trash2 size={18} color="#ef4444" />
//           </TouchableOpacity>
//         </StyledView>
//       )}
//     </Card>
//   );

//   return (
//     <ScreenContainer withPadding={false}>
//       <StyledView className={`${isDark ? 'bg-dark-surface' : 'bg-nautic-primary'} pt-12 pb-6 px-6 rounded-b-[24px] shadow-sm mb-4 flex-row items-center gap-4`}>
//         <TouchableOpacity onPress={() => navigation.goBack()} className="bg-white/20 p-2 rounded-full">
//           <ArrowLeft size={24} color="white" />
//         </TouchableOpacity>
//         <StyledText className="text-white text-xl font-bold flex-1">{companyName || 'Gestión de Rutas'}</StyledText>
//       </StyledView>

//       {loading ? (
//         <ActivityIndicator size="large" color="#0B4F9C" className="mt-8" />
//       ) : (
//         <FlatList
//           data={routes}
//           keyExtractor={(item, idx) => item._id || item.id || idx.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={{ padding: 16 }}
//           ListEmptyComponent={
//             <StyledText className={`text-center ${isDark ? 'text-dark-textMuted' : 'text-gray-400'} mt-10`}>No hay rutas registradas.</StyledText>
//           }
//         />
//       )}

//       {isOwner && !loading && (
//         <StyledView className="absolute bottom-6 right-6">
//           <TouchableOpacity
//             className="bg-nautic-accent w-14 h-14 rounded-full items-center justify-center shadow-lg elevation-5"
//             onPress={() => navigation.navigate('CreateRoute', { companyId: companyId! })}
//           >
//             <Plus size={30} color="white" />
//           </TouchableOpacity>
//         </StyledView>
//       )}
//     </ScreenContainer>
//   );
// };
