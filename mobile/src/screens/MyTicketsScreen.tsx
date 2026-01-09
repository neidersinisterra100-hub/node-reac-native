import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Text, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import { getMyTicketsRequest } from "../services/ticket.service";
import { Ticket } from "../types/ticket";
import { colors } from "../theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MyTicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem("LAST_TICKETS");

      const data = await getMyTicketsRequest();

      if (!Array.isArray(data)) {
        setTickets([]);
        return;
      }

      setTickets(data);
    } catch (error) {
      console.error("Error loading tickets", error);
      Alert.alert("Error", "No se pudieron cargar tus tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const renderItem = ({ item }: { item: Ticket }) => {
    const departureAt = item.departureAt
      ? new Date(item.departureAt)
      : null;

    return (
      <View style={styles.ticketCard}>
        {/* Cabecera */}
        <View style={styles.ticketHeader}>
          <View>
            <Text style={styles.routeText}>{item.routeName}</Text>
            <Text style={styles.codeText}>
              Ticket #{item.code || item._id.slice(-6).toUpperCase()}
            </Text>
          </View>
          <MaterialCommunityIcons
            name="ticket-confirmation-outline"
            size={32}
            color="white"
          />
        </View>

        {/* Cuerpo */}
        <View style={styles.ticketBody}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>FECHA</Text>
              <Text style={styles.value}>
                {departureAt
                  ? format(departureAt, "dd MMM yyyy", { locale: es })
                  : "N/A"}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>HORA</Text>
              <Text style={styles.value}>
                {departureAt
                  ? format(departureAt, "HH:mm", { locale: es })
                  : "--:--"}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>ASIENTO</Text>
              <Text style={styles.value}>
                {item.seatNumber ? `#${item.seatNumber}` : "Libre"}
              </Text>
            </View>
          </View>

          <Divider style={{ marginVertical: 12, backgroundColor: "#e5e7eb" }} />

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>PASAJERO</Text>
              <Text style={styles.value}>
                {item.user?.name || "Pasajero"}
              </Text>
            </View>
            <View>
              <Text style={styles.priceValue}>
                ${Number(item.price).toLocaleString("es-CO")}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.ticketFooter}>
          <MaterialCommunityIcons
            name="qrcode"
            size={40}
            color={colors.primary}
          />
          <Text style={styles.footerText}>
            Muestra este código al abordar
          </Text>
        </View>
      </View>
    );
  };

  return (
    <AppContainer>
      <AppHeader title="Mis Tickets" />

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
              <MaterialCommunityIcons
                name="ticket-outline"
                size={64}
                color="#ccc"
              />
              <Text style={{ color: "#888", marginTop: 16 }}>
                No tienes tickets comprados aún.
              </Text>
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
    backgroundColor: colors.primary,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  footerText: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },
});
