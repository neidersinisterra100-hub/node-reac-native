import { useState, useMemo } from "react";
import { View, Text, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";

import { buyTicket } from "../../services/ticket.service";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";

type RouteParams = {
  tripId: string;
  routeName: string;
  price: number;
  date: string;
  time?: string;
  seatNumber?: number;
};

export default function ConfirmTicketModal() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  const {
    tripId,
    routeName,
    price = 0,
    date,
    time,
    seatNumber,
  } = route.params as RouteParams;

  const [loading, setLoading] = useState(false);

  /* =========================
     FORMAT HOUR (AM / PM)
     ========================= */
  const formattedTime = useMemo(() => {
    if (!time) return "—";

    const [hourStr, minute = "00"] = time.split(":");
    const hour = Number(hourStr);

    if (Number.isNaN(hour)) return time;

    const isPM = hour >= 12;
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minute} ${isPM ? "PM" : "AM"}`;
  }, [time]);

  /* =========================
     CONFIRM PURCHASE
     ========================= */
  const handleConfirm = async () => {
    try {
      setLoading(true);

      const response = await buyTicket({
        tripId,
        passengerName: user?.name || "Pasajero",
        passengerId: "000000", // TODO: pedir documento
        seatNumber: seatNumber ? String(seatNumber) : "General",
      });

      const { paymentData } = response;

      if (
        !paymentData?.publicKey ||
        !paymentData?.reference ||
        !paymentData?.amountInCents
      ) {
        Alert.alert("Error", "Datos de pago incompletos.");
        return;
      }

      const checkoutUrl =
        `https://checkout.wompi.co/p/?` +
        `public-key=${paymentData.publicKey}` +
        `&currency=${paymentData.currency}` +
        `&amount-in-cents=${paymentData.amountInCents}` +
        `&reference=${paymentData.reference}` +
        `&signature:integrity=${paymentData.signature}` +
        `&customer-email=${paymentData.customerEmail}` +
        `&redirect-url=${paymentData.redirectUrl}`;

      const supported = await Linking.canOpenURL(checkoutUrl);

      if (!supported) {
        Alert.alert("Error", "No se puede abrir la pasarela de pagos.");
        return;
      }

      await Linking.openURL(checkoutUrl);

      Alert.alert(
        "Pago iniciado",
        "Cuando completes el pago, tu ticket aparecerá automáticamente en 'Mis Viajes'.",
        [
          {
            text: "Entendido",
            onPress: () => {
              navigation.goBack(); // 🔒 NO redirigir a tickets aún
            },
          },
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo iniciar la compra.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RENDER
     ========================= */
  return (
    <View className="flex-1 justify-end bg-black/50">
      <View className="bg-white rounded-t-3xl px-6 pt-6 pb-8 items-center">
        {/* ICON */}
        <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-4">
          <MaterialCommunityIcons
            name="ticket-confirmation"
            size={44}
            color="#0B4F9C"
          />
        </View>

        {/* TITLE */}
        <Text className="text-2xl font-bold text-slate-900">
          Confirmar compra
        </Text>
        <Text className="text-sm text-slate-500 mb-6">
          Revisa los detalles de tu viaje
        </Text>

        {/* DETAILS */}
        <View className="w-full rounded-2xl bg-slate-50 p-4 mb-6">
          <DetailRow label="Ruta" value={routeName || "Ruta seleccionada"} />
          <Divider />

          <DetailRow
            label="Fecha"
            value={new Date(date).toLocaleDateString("es-CO")}
          />
          <Divider />

          <DetailRow label="Hora" value={formattedTime} />
          <Divider />

          <View className="flex-row justify-between items-center py-2">
            <Text className="text-slate-500 text-sm">Asiento</Text>
            <Text className="text-nautic-primary font-extrabold text-xl">
              {seatNumber ? `#${seatNumber}` : "General"}
            </Text>
          </View>

          <View className="mt-5 pt-4 border-t border-slate-200">
            <Text className="text-sm text-slate-500 mb-1">
              Total a pagar
            </Text>
            <Text className="text-3xl font-extrabold text-nautic-primary text-right">
              ${price.toLocaleString("es-CO")}
            </Text>
          </View>

          <View className="mt-3 items-center">
            <Text className="text-[10px] text-slate-400">
              Pagos procesados de forma segura por
            </Text>
            <Text className="text-xs font-black tracking-widest text-slate-800">
              WOMPI
            </Text>
          </View>
        </View>

        {/* ACTIONS */}
        <View className="w-full gap-3">
          <Button
            title={
              loading
                ? "Procesando..."
                : `Pagar $${price.toLocaleString("es-CO")}`
            }
            onPress={handleConfirm}
            loading={loading}
            disabled={loading}
          />

          <Button
            title="Cancelar"
            variant="ghost"
            onPress={() => navigation.goBack()}
            disabled={loading}
          />
        </View>
      </View>
    </View>
  );
}

/* =======================
   HELPERS
======================= */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row justify-between items-start py-2">
      <Text className="text-slate-500 text-sm">{label}</Text>
      <Text className="text-slate-900 font-semibold text-base text-right flex-1 ml-4">
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-slate-200 my-2" />;
}


// import { useState } from "react";
// import { View, StyleSheet, Alert } from "react-native";
// import { Text, Button, Divider, ActivityIndicator } from "react-native-paper";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import * as Linking from 'expo-linking'; // Para abrir el link de Wompi

// import { colors } from "../../theme/colors";
// import { buyTicket } from "../../services/ticket.service";
// import { useAuth } from "../../context/AuthContext";

// export default function ConfirmTicketModal() {
//   const navigation = useNavigation<any>();
//   const route = useRoute<any>();
//   const { user } = useAuth();

//   const { tripId, routeName, price, date, time, seatNumber } = route.params;

//   const [loading, setLoading] = useState(false);

//   // NOTA: Wompi requiere un widget web o un redirect.
//   // En Mobile, lo más sencillo es abrir el checkout en el navegador del sistema o un WebView.
//   // Aquí usaremos Linking para abrir el navegador, que es más seguro y fácil de implementar rápido.
  
//   const handleConfirm = async () => {
//     try {
//       setLoading(true);
      
//       // 1. Iniciar Compra en Backend -> Obtener referencia y datos Wompi
//       const response = await buyTicket({
//         tripId,
//         passengerName: user?.name || "Pasajero",
//         passengerId: "000000", // Deberíamos pedirlo en un input antes
//         seatNumber: seatNumber || "General"
//       });

//       const { paymentData, ticketId } = response;
      
//       // 2. Construir URL de Checkout Wompi (Redirección simple)
//       // Wompi permite pasar parámetros por URL para pre-llenar datos
//       // URL Sandbox: https://checkout.wompi.co/p/?public-key=...
      
//       const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${paymentData.publicKey}&currency=${paymentData.currency}&amount-in-cents=${paymentData.amountInCents}&reference=${paymentData.reference}&signature:integrity=${paymentData.signature}&customer-email=${paymentData.customerEmail}&redirect-url=${paymentData.redirectUrl}`;

//       // 3. Abrir Checkout
//       const supported = await Linking.canOpenURL(checkoutUrl);
      
//       if (supported) {
//           await Linking.openURL(checkoutUrl);
          
//           // Cerrar modal y avisar
//           Alert.alert(
//               "Pago Iniciado",
//               "Se ha abierto la pasarela de pagos. Una vez completes el pago, recibirás tu ticket en la sección 'Mis Tickets'.",
//               [{ text: "Entendido", onPress: () => navigation.navigate("Tabs", { screen: "History" }) }]
//           );
//       } else {
//           Alert.alert("Error", "No se puede abrir la pasarela de pagos.");
//       }

//     } catch (error) {
//       console.error(error);
//       Alert.alert("Error", "No se pudo iniciar la compra. Intenta de nuevo.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.content}>
//         <View style={styles.iconContainer}>
//             <MaterialCommunityIcons name="ticket-confirmation" size={48} color={colors.primary} />
//         </View>
        
//         <Text style={styles.title}>Confirmar Compra</Text>
//         <Text style={styles.subtitle}>Revisa los detalles de tu viaje</Text>

//         <View style={styles.detailsCard}>
//             <View style={styles.row}>
//                 <Text style={styles.label}>Ruta:</Text>
//                 <Text style={styles.value}>{routeName}</Text>
//             </View>
//             <Divider style={styles.divider} />
//             <View style={styles.row}>
//                 <Text style={styles.label}>Fecha:</Text>
//                 <Text style={styles.value}>{new Date(date).toLocaleDateString()}</Text>
//             </View>
//             <Divider style={styles.divider} />
//             <View style={styles.row}>
//                 <Text style={styles.label}>Hora:</Text>
//                 <Text style={styles.value}>{time}</Text>
//             </View>
//             <Divider style={styles.divider} />
//             <View style={styles.row}>
//                 <Text style={styles.label}>Pasajero:</Text>
//                 <Text style={styles.value}>{user?.name}</Text>
//             </View>
            
//             <View style={styles.totalRow}>
//                 <Text style={styles.totalLabel}>Total a Pagar:</Text>
//                 <Text style={styles.totalValue}>
//                     ${price.toLocaleString("es-CO")}
//                 </Text>
//             </View>
            
//             <View style={styles.wompiContainer}>
//                 <Text style={styles.wompiText}>Pagos procesados de forma segura por</Text>
//                 <Text style={styles.wompiBrand}>WOMPI</Text>
//             </View>
//         </View>

//         <View style={styles.actions}>
//             <Button 
//                 mode="contained" 
//                 onPress={handleConfirm} 
//                 loading={loading}
//                 disabled={loading}
//                 style={styles.payButton}
//                 contentStyle={{ height: 50 }}
//             >
//                 {loading ? "Procesando..." : `Pagar $${price.toLocaleString("es-CO")}`}
//             </Button>
            
//             <Button 
//                 mode="text" 
//                 onPress={() => navigation.goBack()}
//                 disabled={loading}
//                 textColor="#64748b"
//             >
//                 Cancelar
//             </Button>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)', // Overlay oscuro
//     justifyContent: 'flex-end',
//   },
//   content: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 24,
//     alignItems: 'center',
//   },
//   iconContainer: {
//       width: 80,
//       height: 80,
//       borderRadius: 40,
//       backgroundColor: '#eff6ff',
//       justifyContent: 'center',
//       alignItems: 'center',
//       marginBottom: 16,
//   },
//   title: {
//       fontSize: 24,
//       fontWeight: 'bold',
//       color: '#1e293b',
//       marginBottom: 4,
//   },
//   subtitle: {
//       fontSize: 14,
//       color: '#64748b',
//       marginBottom: 24,
//   },
//   detailsCard: {
//       width: '100%',
//       backgroundColor: '#f8fafc',
//       borderRadius: 16,
//       padding: 16,
//       marginBottom: 24,
//   },
//   row: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       paddingVertical: 8,
//   },
//   label: {
//       color: '#64748b',
//       fontSize: 14,
//   },
//   value: {
//       color: '#1e293b',
//       fontWeight: '600',
//       fontSize: 14,
//       flex: 1,
//       textAlign: 'right',
//       marginLeft: 16,
//   },
//   divider: {
//       backgroundColor: '#e2e8f0',
//   },
//   totalRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginTop: 16,
//       paddingTop: 16,
//       borderTopWidth: 1,
//       borderTopColor: '#e2e8f0',
//   },
//   totalLabel: {
//       fontSize: 16,
//       fontWeight: 'bold',
//       color: '#1e293b',
//   },
//   totalValue: {
//       fontSize: 20,
//       fontWeight: 'bold',
//       color: colors.primary,
//   },
//   wompiContainer: {
//       marginTop: 12,
//       alignItems: 'center',
//   },
//   wompiText: {
//       fontSize: 10,
//       color: '#94a3b8',
//   },
//   wompiBrand: {
//       fontSize: 12,
//       fontWeight: '900',
//       color: '#2c2a29', // Color Wompi
//       letterSpacing: 1,
//   },
//   actions: {
//       width: '100%',
//       gap: 12,
//   },
//   payButton: {
//       backgroundColor: colors.primary,
//       borderRadius: 12,
//   }
// });
