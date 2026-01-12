import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import { useEffect, useState } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MapPin, Navigation, ShieldCheck } from "lucide-react-native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

import {
  getCompanyRoutes,
  toggleRouteActive,
  deleteRoute,
  Route
} from "../services/route.service";
import { Company } from "../services/company.service"; // Import Company interface

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { RootStackParamList } from "../navigation/types";

// Tipos de Navegación
type CompanyRoutesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CompanyRoutes'>;
type CompanyRoutesScreenRouteProp = RouteProp<RootStackParamList, 'CompanyRoutes'>;

export default function CompanyRoutesScreen() {
  const navigation = useNavigation<CompanyRoutesScreenNavigationProp>();
  const route = useRoute<CompanyRoutesScreenRouteProp>();
  const { user } = useAuth();
  const { theme } = useTheme();

  // Params
  const { companyId, companyName } = route.params;
  const isOwner = user?.role === "owner" || user?.role === "admin";

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<Company | Partial<Company> | null>(null);

  /* ================= LOAD ================= */

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar rutas
      const routesData = await getCompanyRoutes(companyId);
      
      // Eliminar duplicados por _id
      const uniqueRoutes = Array.from(
        new Map(routesData.map(r => [r._id, r])).values()
      );
      setRoutes(uniqueRoutes);

      // Cargar datos frescos de la empresa
      if (routesData.length > 0 && routesData[0].company) {
          // Si el backend popula el campo company, lo usamos
          setCompanyData(routesData[0].company as unknown as Company);
      } else {
           // Fallback básico
           setCompanyData({ _id: companyId, name: companyName });
      }

    } catch {
      Alert.alert("Error", "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= ACTIONS ================= */

  const handleToggle = async (routeId: string, currentStatus: boolean) => {
    try {
      await toggleRouteActive(routeId);
      setRoutes(prev => prev.map(r => r._id === routeId ? { ...r, active: !currentStatus } : r));
    } catch {
      Alert.alert("Error", "No se pudo cambiar el estado");
    }
  };

  const handleDelete = async (routeId: string) => {
    Alert.alert("Eliminar Ruta", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRoute(routeId);
            setRoutes(prev => prev.filter(r => r._id !== routeId));
          } catch {
            Alert.alert("Error", "No se pudo eliminar");
          }
        }
      }
    ]);
  };

  const handleOpenLegal = () => {
      if (!companyData) {
          Alert.alert("Info", "Cargando información de la empresa...");
          return;
      }
      // Aseguramos que companyData cumpla con lo mínimo que espera la pantalla
      navigation.navigate("CompanyLegalInfo", { company: companyData as Company });
  };

  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }: { item: Route }) => (
    <TouchableOpacity
      style={[
          styles.card, 
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          !item.active && isOwner && styles.cardInactive
      ]}
      onPress={() => navigation.navigate("Trips", {
        routeId: item._id,
        routeName: `${item.origin} - ${item.destination}`,
        companyName: companyName
      })}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: theme.dark ? '#333' : '#eef2ff' }]}>
          <Navigation size={24} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>{item.origin} → {item.destination}</Text>
          <Text style={[styles.statusText, { color: item.active ? theme.colors.success : theme.colors.textSecondary }]}>
            {item.active ? "Activa" : "Inactiva"}
          </Text>
        </View>

        {isOwner && (
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon="power"
              iconColor={item.active ? "#10b981" : "#9ca3af"}
              size={20}
              onPress={() => handleToggle(item._id, !!item.active)}
            />
            <IconButton
              icon="delete-outline"
              iconColor="#ef4444"
              size={20}
              onPress={() => handleDelete(item._id)}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <AppContainer>
      {/* 🟢 HEADER CON NEÓN AQUÍ */}
      <AppHeader title={companyName || "Rutas"} neon={true} />

      {/* Botón de Legalidad - Visible para todos */}
      <View style={styles.legalButtonContainer}>
          <TouchableOpacity onPress={handleOpenLegal} style={styles.legalButton}>
               <ShieldCheck size={20} color="#15803d" />
               <Text style={styles.legalButtonText}>Ver Legalidad y Documentos</Text>
          </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ff6b00" />
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={loadData}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isOwner ? (
              <View style={{ marginBottom: 20 }}>
                <PrimaryButton
                  label="Nueva Ruta"
                  onPress={() => navigation.navigate("CreateRoute", { companyId })}        
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <View style={styles.emptyIcon}>
                <MapPin size={32} color="#9ca3af" />
              </View>
              <Text style={{ color: '#6b7280', textAlign: 'center' }}>
                {isOwner ? "Crea rutas para asignar a tus viajes." : "No hay rutas disponibles."}
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
  cardInactive: {
    opacity: 0.7,
    borderColor: '#d1d5db',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    backgroundColor: '#eef2ff', // indigo-50
    padding: 12,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#f3f4f6',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  legalButtonContainer: {
      paddingHorizontal: 4,
      marginBottom: 12,
  },
  legalButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#dcfce7', // green-100
      padding: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#bbf7d0',
      gap: 8,
  },
  legalButtonText: {
      color: '#15803d', // green-700
      fontWeight: '600',
      fontSize: 14,
  }
});

// import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
// import { IconButton, Button } from "react-native-paper"; // Import Button
// import { useEffect, useState } from "react";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { MapPin, Navigation, ShieldCheck } from "lucide-react-native"; // Import ShieldCheck

// import AppContainer from "../components/ui/AppContainer";
// import AppHeader from "../components/ui/AppHeader";
// import PrimaryButton from "../components/ui/PrimaryButton";

// import {
//   getCompanyRoutes,
//   toggleRouteActive,
//   deleteRoute,
//   Route
// } from "../services/route.service";
// import { getMyCompanies } from "../services/company.service"; // Import para obtener datos frescos de la empresa

// import { useAuth } from "../context/AuthContext";

// export default function CompanyRoutesScreen() {
//   const navigation = useNavigation<any>();
//   const route = useRoute<any>();
//   const { user } = useAuth();

//   // Params
//   const { companyId, companyName } = route.params;
//   const isOwner = user?.role === "owner" || user?.role === "admin";

//   const [routes, setRoutes] = useState<Route[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [companyData, setCompanyData] = useState<any>(null); // Estado para guardar la info completa de la empresa

//   /* ================= LOAD ================= */

//   const loadData = async () => {
//     try {
//       setLoading(true);

//       // Cargar rutas
//       const routesData = await getCompanyRoutes(companyId);
      
//       // Eliminar duplicados por _id
//       const uniqueRoutes = Array.from(
//         new Map(routesData.map(r => [r._id, r])).values()
//       );
//       setRoutes(uniqueRoutes);

//       // Cargar datos frescos de la empresa (para tener el objeto compliance actualizado)
//       // Nota: Idealmente deberíamos tener un endpoint getCompanyById, pero por ahora podemos
//       // buscar en la lista de companies o asumir que si venimos de MyCompanies ya tenemos datos,
//       // pero getCompanyRoutes no devuelve la info de la empresa.
//       // Solución rápida: Si es owner, usamos getMyCompanies y filtramos. Si es user, necesitariamos un endpoint publico de detalle.
//       // Por simplicidad, pasaremos el objeto company desde la pantalla anterior si es posible, 
//       // o agregaremos un fetch si es necesario. 
      
//       // *MEJORA*: Para asegurar que el botón legal funcione, vamos a intentar obtener la info de la empresa.
//       // Como no tenemos un getCompanyById público implementado en este contexto exacto,
//       // vamos a asumir que si el usuario quiere ver legalidad, podemos navegar con un objeto parcial
//       // o implementar la llamada si es crítico.
//       // Para este paso, asumiremos que companyId es suficiente para futuras llamadas, 
//       // PERO para CompanyLegalInfoScreen necesitamos el objeto `company`.
//       // Vamos a simular obtenerlo o recuperarlo de la navegación si se pasó (que no se pasó antes).
      
//       // *SOLUCIÓN*: Vamos a implementar un pequeño fetch auxiliar o pasar datos.
//       // Dado que getCompanyRoutes retorna rutas, y las rutas tienen populate('company'), 
//       // podemos sacar la info de la empresa del primer resultado de rutas!
      
//       if (routesData.length > 0 && routesData[0].company) {
//           // routesData[0].company es un objeto poblado si el backend lo permite
//           setCompanyData(routesData[0].company);
//       } else {
//            // Fallback básico si no hay rutas o no está poblado
//            setCompanyData({ _id: companyId, name: companyName });
//       }

//     } catch {
//       Alert.alert("Error", "No se pudieron cargar los datos");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   /* ================= ACTIONS ================= */

//   const handleToggle = async (routeId: string, currentStatus: boolean) => {
//     try {
//       await toggleRouteActive(routeId);
//       setRoutes(prev => prev.map(r => r._id === routeId ? { ...r, active: !currentStatus } : r));
//     } catch {
//       Alert.alert("Error", "No se pudo cambiar el estado");
//     }
//   };

//   const handleDelete = async (routeId: string) => {
//     Alert.alert("Eliminar Ruta", "¿Estás seguro?", [
//       { text: "Cancelar", style: "cancel" },
//       {
//         text: "Eliminar",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await deleteRoute(routeId);
//             setRoutes(prev => prev.filter(r => r._id !== routeId));
//           } catch {
//             Alert.alert("Error", "No se pudo eliminar");
//           }
//         }
//       }
//     ]);
//   };

//   const handleOpenLegal = () => {
//       if (!companyData) {
//           Alert.alert("Info", "Cargando información de la empresa...");
//           return;
//       }
//       navigation.navigate("CompanyLegalInfo", { company: companyData });
//   };

//   /* ================= RENDER ITEM ================= */

//   const renderItem = ({ item }: { item: Route }) => (
//     <TouchableOpacity
//       style={[styles.card, !item.active && isOwner && styles.cardInactive]}
//       onPress={() => navigation.navigate("Trips", {
//         routeId: item._id,
//         routeName: `${item.origin} - ${item.destination}`,
//         companyName: companyName
//       })}
//     >
//       <View style={styles.cardHeader}>
//         <View style={styles.iconBox}>
//           <Navigation size={24} color="#4f46e5" />
//         </View>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.cardTitle}>{item.origin} → {item.destination}</Text>
//           <Text style={[styles.statusText, { color: item.active ? '#16a34a' : '#9ca3af' }]}>
//             {item.active ? "Activa" : "Inactiva"}
//           </Text>
//         </View>

//         {isOwner && (
//           <View style={{ flexDirection: 'row' }}>
//             <IconButton
//               icon="power"
//               iconColor={item.active ? "#10b981" : "#9ca3af"}
//               size={20}
//               onPress={() => handleToggle(item._id, !!item.active)}
//             />
//             <IconButton
//               icon="delete-outline"
//               iconColor="#ef4444"
//               size={20}
//               onPress={() => handleDelete(item._id)}
//             />
//           </View>
//         )}
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <AppContainer>
//       {/* 🟢 HEADER CON NEÓN AQUÍ */}
//       <AppHeader title={companyName || "Rutas"} neon={true} />

//       {/* Botón de Legalidad - Visible para todos */}
//       <View style={styles.legalButtonContainer}>
//           <TouchableOpacity onPress={handleOpenLegal} style={styles.legalButton}>
//                <ShieldCheck size={20} color="#15803d" />
//                <Text style={styles.legalButtonText}>Ver Legalidad y Documentos</Text>
//           </TouchableOpacity>
//       </View>

//       {loading ? (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//           <ActivityIndicator size="large" color="#ff6b00" />
//         </View>
//       ) : (
//         <FlatList
//           data={routes}
//           keyExtractor={(item) => item._id}
//           refreshing={loading}
//           onRefresh={loadData}
//           contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
//           showsVerticalScrollIndicator={false}
//           ListHeaderComponent={
//             isOwner ? (
//               <View style={{ marginBottom: 20 }}>
//                 <PrimaryButton
//                   label="Nueva Ruta"
//                   onPress={() => navigation.navigate("CreateRoute", { companyId })}        
//                 />
//               </View>
//             ) : null
//           }
//           ListEmptyComponent={
//             <View style={{ alignItems: 'center', marginTop: 40 }}>
//               <View style={styles.emptyIcon}>
//                 <MapPin size={32} color="#9ca3af" />
//               </View>
//               <Text style={{ color: '#6b7280', textAlign: 'center' }}>
//                 {isOwner ? "Crea rutas para asignar a tus viajes." : "No hay rutas disponibles."}
//               </Text>
//             </View>
//           }
//           renderItem={renderItem}
//         />
//       )}
//     </AppContainer>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardInactive: {
//     opacity: 0.7,
//     borderColor: '#d1d5db',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   iconBox: {
//     backgroundColor: '#eef2ff', // indigo-50
//     padding: 12,
//     borderRadius: 12,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1f2937',
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   emptyIcon: {
//     width: 64,
//     height: 64,
//     backgroundColor: '#f3f4f6',
//     borderRadius: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   legalButtonContainer: {
//       paddingHorizontal: 4,
//       marginBottom: 12,
//   },
//   legalButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#dcfce7', // green-100
//       padding: 10,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: '#bbf7d0',
//       gap: 8,
//   },
//   legalButtonText: {
//       color: '#15803d', // green-700
//       fontWeight: '600',
//       fontSize: 14,
//   }
// });
