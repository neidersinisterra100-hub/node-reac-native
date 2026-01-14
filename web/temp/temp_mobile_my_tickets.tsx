import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert, ActivityIndicator, Modal, TouchableOpacity } from "react-native";
import { Text, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import QRCode from "react-native-qrcode-svg";

import AppContainer from "./temp_mobile_AppContainer";
import AppHeader from "./temp_mobile_AppHeader";
import { getMyTicketsRequest } from "./temp_mobile_ticket_service_full";
import { colors } from "./temp_mobile_colors";

// Interfaz simplificada para evitar problemas de importación
interface Ticket {
  _id: string;
  code: string;
  trip: any;
  seatNumber?: string;
  user: any;
  createdAt: string;
  status?: string;
}

export default function MyTicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getMyTicketsRequest();
      setTickets(data);
    } catch (error) {
      console.error("Error loading tickets", error);
      Alert.alert("Error", "No se pudieron cargar tus tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const renderItem = ({ item }: { item: Ticket }) => {
    // Manejo seguro de propiedades anidadas (por si trip/route no vienen poblados)
    const trip = typeof item.trip === 'object' ? item.trip : null;
    const route = trip && typeof trip.route === 'object' ? trip.route : null;
    
    const origin = route ? route.origin : "Origen";
    const destination = route ? route.destination : "Destino";
    const date = trip ? trip.date : item.createdAt; // Fallback
    const time = trip ? trip.departureTime : "--:--";
    const price = trip ? trip.price : 0;
    const ticketCode = String(item.code || item._id?.slice(-6) || "").toUpperCase();

    return (
        <View style={styles.ticketCard}>
            {/* Cabecera del Ticket */}
            <View style={styles.ticketHeader}>
                <View>
                    <Text style={styles.routeText}>{origin} → {destination}</Text>
                    <Text style={styles.codeText}>Ticket #{ticketCode}</Text>
                </View>
                <MaterialCommunityIcons name="ticket-confirmation-outline" size={32} color="white" />
            </View>

            {/* Cuerpo del Ticket */}
            <View style={styles.ticketBody}>
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>FECHA</Text>
                        <Text style={styles.value}>
                            {date ? format(new Date(date), "dd MMM yyyy", { locale: es }) : "N/A"}
                        </Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>HORA</Text>
                        <Text style={styles.value}>{time}</Text>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.label}>ASIENTO</Text>
                        <Text style={styles.value}>{item.seatNumber || "Libre"}</Text>
                    </View>
                </View>

                <Divider style={{ marginVertical: 12, backgroundColor: '#e5e7eb' }} />

                <View style={styles.row}>
                     <View>
                        <Text style={styles.label}>PASAJERO</Text>
                        <Text style={styles.value}>{(item.user as any)?.name || "Tú"}</Text>
                     </View>
                     <View>
                        <Text style={styles.priceValue}>${Number(price).toLocaleString("es-CO")}</Text>
                     </View>
                </View>
            </View>

            {/* Pie del Ticket (Código QR simulado) */}
            <View style={styles.ticketFooter}>
                <View style={{ width: '100%', alignItems: 'center', marginBottom: 12 }}>
                     <TouchableOpacity 
                        onPress={() => setSelectedCode(ticketCode)}
                        style={{ backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                    >
                        <Text style={{ color: "white", fontWeight: "bold" }}>🔍 TOCAR PARA AMPLIAR QR</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => {
                            console.log("QR Pressed:", ticketCode);
                            setSelectedCode(ticketCode);
                        }}
                        style={styles.qrWrap}
                        activeOpacity={0.7}
                    >
                        <View style={styles.qrBox}>
                            <QRCode value={ticketCode || "ERROR"} size={70} color={colors.primary} backgroundColor="white" />
                        </View>
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.footerText}>Muestra este código al conductor al abordar</Text>
                    </View>
                </View>
            </View>
        </View>
    );
  };

  return (
    <AppContainer>
      <AppHeader title="Mis Tickets (NUEVO)" />

      <Modal
        visible={!!selectedCode}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCode(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ticket #{selectedCode}</Text>
              <TouchableOpacity onPress={() => setSelectedCode(null)} hitSlop={10}>
                <MaterialCommunityIcons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalQrBox}>
              <QRCode value={selectedCode || "-"} size={260} color="#111827" backgroundColor="white" />
            </View>
          </View>
        </View>
      </Modal>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={loadTickets}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <MaterialCommunityIcons name="ticket-outline" size={64} color="#ccc" />
              <Text style={{ color: "#888", marginTop: 16 }}>No tienes tickets comprados aún.</Text>
            </View>
          }
        />
      )}
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  ticketCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  ticketHeader: {
    backgroundColor: colors.primary, // Navy
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  codeText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  ticketBody: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "bold",
  },
  priceValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primary,
  },
  ticketFooter: {
      backgroundColor: "#f9fafb",
      padding: 12,
      flexDirection: 'column', // Cambiado a column
      // alignItems: 'center', // Ya no centrado globalmente para permitir layouts internos
      justifyContent: 'flex-start',
      gap: 0, // Controlado por márgenes internos
      borderTopWidth: 1,
      borderTopColor: '#f3f4f6',
  },
  qrWrap: {
      borderRadius: 10,
      overflow: "hidden",
  },
  qrBox: {
      backgroundColor: "white",
      padding: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#e5e7eb",
  },
  footerText: {
      fontSize: 12,
      color: '#6b7280',
      fontStyle: 'italic',
  },
  footerHint: {
      marginTop: 2,
      fontSize: 11,
      color: "#9ca3af",
  },
  modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 24,
  },
  modalCard: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 16,
  },
  modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
      gap: 12,
  },
  modalTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: "#111827",
      flex: 1,
  },
  modalQrBox: {
      backgroundColor: "white",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#e5e7eb",
  }
});
