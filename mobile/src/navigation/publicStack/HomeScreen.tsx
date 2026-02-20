// import {
//   ScrollView,
//   StyleSheet,
//   View,
//   TouchableOpacity
// } from "react-native";
// import { Text } from "react-native-paper";
// import {
//   useNavigation,
//   useFocusEffect,
// } from "@react-navigation/native";
// import { useCallback, useState } from "react";

// import AppContainer from "../../components/ui/AppContainer";
// import AppHeader from "../../components/ui/AppHeader";
// import PrimaryButton from "../../components/ui/PrimaryButton";
// import StatCard from "../../components/ui/StatCard";

// import { useAuth } from "../../context/AuthContext";
// import { getTrips } from "../../services/trip.service";

// import { spacing } from "../../theme/spacing";
// import { typography } from "../../theme/typography";
// import { colors } from "../../theme/colors";

// /* ================= TYPES ================= */

// type RoutePopulated = {
//   _id?: string;
//   origin: string;
//   destination: string;
// };

// type TripItem = {
//   _id: string;
//   price: number;
//   departureTime: string;
//   date: string;
//   route: string | RoutePopulated;
//   company?: {
//     name: string;
//   };
// };

// export default function HomeScreen() {
//   const navigation = useNavigation<any>();
//   const { user } = useAuth();

//   const [trips, setTrips] = useState<TripItem[]>([]);
//   const [loading, setLoading] = useState(false);

//   /* ================= LOAD ================= */

//   const loadTrips = async () => {
//   try {
//     setLoading(true);
//     const data = await getTrips();

//     const normalizedTrips = data
//       .map((trip): TripItem | null => {
//         const tripId = trip._id ?? trip.id;
//         if (!tripId) return null;

//         return {
//           _id: tripId,
//           price: trip.price,
//           departureTime: trip.departureTime,
//           date: trip.date,
//           route: trip.route,
//           company:
//             typeof trip.company === "object" && trip.company !== null
//               ? { name: trip.company.name }
//               : undefined,
//         };
//       })
//       .filter((trip): trip is TripItem => trip !== null);

//     setTrips(normalizedTrips);
//   } catch (error) {
//     console.log("❌ Error cargando viajes", error);
//   } finally {
//     setLoading(false);
//   }
// };

// //   const loadTrips = async () => {
// //     try {
// //       setLoading(true);
// //       const data = await getTrips();
// //       setTrips(data);
// //     } catch (error) {
// //       console.log("❌ Error cargando viajes", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useFocusEffect(
// //     useCallback(() => {
// //       loadTrips();
// //     }, [])
// //   );

//   /* ================= ACTIONS ================= */

//   const handleBuyTicket = (trip: TripItem) => {
//     if (!user) {
//       navigation.navigate("Login");
//       return;
//     }

//     if (typeof trip.route !== "object") return;

//     navigation.getParent()?.navigate("ConfirmTicketModal", {
//       tripId: trip._id,
//       routeName: `${trip.route.origin} → ${trip.route.destination}`,
//       price: trip.price,
//       date: trip.date,
//       time: trip.departureTime,
//     });
//   };

//   const handleGoToMyTrips = () => {
//     if (!user) {
//       navigation.navigate("Login");
//       return;
//     }
//     navigation.navigate("MyTickets");
//   };

//   /* ================= RENDER ================= */

//   return (
//     <AppContainer>
//       <AppHeader
//         showGreeting
//         subtitle="Viajes disponibles hoy"
//       />

//       <ScrollView contentContainerStyle={styles.content}>
//         {/* ===== STATS ===== */}
//         <TouchableOpacity onPress={handleGoToMyTrips} activeOpacity={0.8}>
//           <View style={styles.statsRow}>
//             <StatCard
//               label="Viajes activos"
//               value={String(trips.length)}
//               hint="Ver mis viajes →"
//             />
//           </View>
//         </TouchableOpacity>

//         {/* ===== LISTADO ===== */}
//         {trips.map((trip) => {
//           const routeData =
//             typeof trip.route === "object" ? trip.route : null;

//           return (
//             <View key={trip._id} style={styles.card}>
//               {trip.company && (
//                 <Text style={styles.companyName}>
//                   {trip.company.name}
//                 </Text>
//               )}

//               {routeData && (
//                 <Text style={styles.routeText}>
//                   {routeData.origin}{" "}
//                   <Text style={styles.arrow}>→</Text>{" "}
//                   {routeData.destination}
//                 </Text>
//               )}

//               <View style={styles.infoRow}>
//                 <Text style={styles.infoText}>
//                   🕒 {trip.departureTime}
//                 </Text>
//                 <Text style={styles.infoText}>
//                   📅 {new Date(trip.date).toLocaleDateString()}
//                 </Text>
//               </View>

//               <Text style={styles.price}>
//                 ${trip.price.toLocaleString()}
//               </Text>

//               <PrimaryButton
//                 label="Comprar tiquete"
//                 onPress={() => handleBuyTicket(trip)}
//               />
//             </View>
//           );
//         })}

//         {!loading && trips.length === 0 && (
//           <Text style={styles.empty}>
//             No hay viajes disponibles
//           </Text>
//         )}
//       </ScrollView>
//     </AppContainer>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   content: {
//     padding: spacing.lg,
//   },

//   statsRow: {
//     marginBottom: spacing.lg,
//   },

//   card: {
//     backgroundColor: "#FFF",
//     borderRadius: 18,
//     padding: spacing.lg,
//     borderWidth: 1,
//     borderColor: colors.border,
//     marginBottom: spacing.lg,
//   },

//   companyName: {
//     fontSize: 12,
//     fontWeight: "bold",
//     color: colors.primary,
//     textTransform: "uppercase",
//     marginBottom: 4,
//     letterSpacing: 0.5,
//   },

//   routeText: {
//     ...typography.title,
//     fontWeight: "700",
//     marginBottom: spacing.sm,
//     color: colors.textPrimary,
//   },

//   arrow: {
//     color: colors.primary,
//   },

//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: spacing.sm,
//   },

//   infoText: {
//     color: colors.textSecondary,
//     fontSize: 13,
//   },

//   price: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: colors.primary,
//     marginBottom: spacing.md,
//   },

//   empty: {
//     textAlign: "center",
//     color: colors.textSecondary,
//     marginTop: spacing.lg,
//   },
// });


// // import {
// //   ScrollView,
// //   StyleSheet,
// //   View,
// //   TouchableOpacity
// // } from "react-native";
// // import { Text } from "react-native-paper";
// // import {
// //   useNavigation,
// //   useFocusEffect,
// // } from "@react-navigation/native";
// // import { useCallback, useState } from "react";

// // import AppContainer from "../../components/ui/AppContainer";
// // import AppHeader from "../../components/ui/AppHeader";
// // import PrimaryButton from "../../components/ui/PrimaryButton";
// // import StatCard from "../../components/ui/StatCard";

// // import { useAuth } from "../../context/AuthContext";
// // import { getTrips } from "../../services/trip.service";

// // import { spacing } from "../../theme/spacing";
// // import { typography } from "../../theme/typography";
// // import { colors } from "../../theme/colors";

// // type TripItem = {
// //   _id: string;
// //   price: number;
// //   departureTime: string;
// //   date: string;
// //   route: {
// //     origin: string;
// //     destination: string;
// //   };
// //   company?: {
// //       name: string;
// //   };
// // };

// // export default function HomeScreen() {
// //   const navigation = useNavigation<any>();
// //   const { user } = useAuth();

// //   const [trips, setTrips] = useState<TripItem[]>([]);
// //   const [loading, setLoading] = useState(false);

// //   /* ================= LOAD ================= */

// //   const loadTrips = async () => {
// //     try {
// //       setLoading(true);
// //       const data = await getTrips();
// //       setTrips(data);
// //     } catch (error) {
// //       console.log("❌ Error cargando viajes", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useFocusEffect(
// //     useCallback(() => {
// //       loadTrips();
// //     }, [])
// //   );

// //   /* ================= ACTION ================= */

// //   const handleBuyTicket = (trip: TripItem) => {
// //     if (!user) {
// //       navigation.navigate("Login");
// //       return;
// //     }

// //     navigation
// //       .getParent()
// //       ?.navigate("ConfirmTicketModal", {
// //         routeName: `${trip.route.origin} → ${trip.route.destination}`,
// //         price: trip.price,
// //         tripId: trip._id,
// //       });
// //   };

// //   const handleGoToMyTrips = () => {
// //       if (!user) {
// //           navigation.navigate("Login");
// //           return;
// //       }
// //       // Navegar a la pantalla de mis tiquetes (activos)
// //       // Nota: Esta pantalla debe estar registrada en el stack o tab
// //       // Asumimos que está en el stack principal o accesible
// //       navigation.navigate("MyTicketsScreen"); 
// //   };

// //   /* ================= RENDER ================= */

// //   return (
// //     <AppContainer>
// //       <AppHeader
// //         showGreeting
// //         subtitle="Viajes disponibles hoy"
// //       />

// //       <ScrollView contentContainerStyle={styles.content}>
// //         {/* ===== STATS (BOTÓN VIAJES) ===== */}
// //         <TouchableOpacity onPress={handleGoToMyTrips} activeOpacity={0.8}>
// //             <View style={styles.statsRow}>
// //             <StatCard
// //                 label="Viajes activos"
// //                 value={String(trips.length)} // Aquí debería mostrar mis viajes activos, pero por ahora muestra viajes totales disponibles.
// //                                              // Si el usuario quiere "Mis Viajes", esto debería ser un contador de sus tickets.
// //                                              // Pero dado el requerimiento "el boton viajes... pueda llevarme a la pantalla de viajes activos",
// //                                              // haremos que este card navegue.
// //                 hint="Ver mis viajes →"
// //             />
// //             </View>
// //         </TouchableOpacity>

// //         {/* ===== LISTADO ===== */}
// //         {trips.map((trip) => (
// //           <View key={trip._id} style={styles.card}>
// //             {/* EMPRESA */}
// //             {trip.company && (
// //                 <Text style={styles.companyName}>
// //                     {trip.company.name}
// //                 </Text>
// //             )}

// //             {/* ORIGEN → DESTINO */}
// //             <Text style={styles.routeText}>
// //               {trip.route.origin}{" "}
// //               <Text style={styles.arrow}>→</Text>{" "}
// //               {trip.route.destination}
// //             </Text>

// //             {/* INFO */}
// //             <View style={styles.infoRow}>
// //               <Text style={styles.infoText}>
// //                 🕒 {trip.departureTime}
// //               </Text>
// //               <Text style={styles.infoText}>
// //                 📅 {new Date(trip.date).toLocaleDateString()}
// //               </Text>
// //             </View>

// //             {/* PRICE */}
// //             <Text style={styles.price}>
// //               ${trip.price.toLocaleString()}
// //             </Text>

// //             <PrimaryButton
// //               label="Comprar tiquete"
// //               onPress={() => handleBuyTicket(trip)}
// //             />
// //           </View>
// //         ))}

// //         {!loading && trips.length === 0 && (
// //           <Text style={styles.empty}>
// //             No hay viajes disponibles
// //           </Text>
// //         )}
// //       </ScrollView>
// //     </AppContainer>
// //   );
// // }

// // /* ================= STYLES ================= */

// // const styles = StyleSheet.create({
// //   content: {
// //     padding: spacing.lg,
// //   },

// //   statsRow: {
// //     marginBottom: spacing.lg,
// //   },

// //   card: {
// //     backgroundColor: "#FFF",
// //     borderRadius: 18,
// //     padding: spacing.lg,
// //     borderWidth: 1,
// //     borderColor: colors.border,
// //     marginBottom: spacing.lg,
// //   },

// //   companyName: {
// //       fontSize: 12,
// //       fontWeight: "bold",
// //       color: colors.primary,
// //       textTransform: "uppercase",
// //       marginBottom: 4,
// //       letterSpacing: 0.5
// //   },

// //   routeText: {
// //     ...typography.title,
// //     fontWeight: "700",
// //     marginBottom: spacing.sm,
// //     color: colors.textPrimary,
// //   },

// //   arrow: {
// //     color: colors.primary,
// //   },

// //   infoRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     marginBottom: spacing.sm,
// //   },

// //   infoText: {
// //     color: colors.textSecondary,
// //     fontSize: 13,
// //   },

// //   price: {
// //     fontSize: 22,
// //     fontWeight: "700",
// //     color: colors.primary,
// //     marginBottom: spacing.md,
// //   },

// //   empty: {
// //     textAlign: "center",
// //     color: colors.textSecondary,
// //     marginTop: spacing.lg,
// //   },
// // });
