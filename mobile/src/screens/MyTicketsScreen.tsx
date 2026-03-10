import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import { ListSkeleton } from "../components/ui/Skeletons";

import { getMyTickets } from "../services/ticket.service";
import { Ticket } from "../types/ticket";
import { colors } from "../theme/colors";

/* =========================================================
   MY TICKETS SCREEN
   ========================================================= */

/**
 * MyTicketsScreen
 *
 * 📌 Responsabilidad:
 * - Mostrar tickets del usuario
 *
 * 📌 Reglas IMPORTANTES:
 * - Usa SOLO Ticket de UI (types/ticket)
 * - No conoce backend
 * - No usa trip, payment ni financials
 */
export default function MyTicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getMyTickets();

      // 🛡️ Seguridad ante respuestas inválidas
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error loading tickets", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar tus tickets"
      );
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }: { item: Ticket }) => {
    return (
      <View style={styles.ticketCard}>
        {/* ================= HEADER ================= */}
        <View style={styles.ticketHeader}>
          <View>
            <Text style={styles.routeText}>
              {item.routeName}
            </Text>
            <Text style={styles.codeText}>
              Código {item.code}
            </Text>
          </View>

          <MaterialCommunityIcons
            name={item.status === "reserved" ? "clock-alert-outline" : "ticket-confirmation-outline"}
            size={32}
            color="white"
          />
        </View>

        {/* ================= BODY ================= */}
        <View style={styles.ticketBody}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>
                FECHA
              </Text>
              <Text style={styles.value}>
                {format(
                  new Date(item.date),
                  "dd MMM yyyy",
                  { locale: es }
                )}
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>
                ASIENTO
              </Text>
              <Text style={styles.value}>
                {item.seatNumber
                  ? `#${item.seatNumber}`
                  : "Libre"}
              </Text>
            </View>
          </View>

          <Divider
            style={{
              marginVertical: 12,
              backgroundColor: "#e5e7eb",
            }}
          />

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>
                PASAJERO
              </Text>
              <Text style={styles.value}>
                {item.user?.name ?? "Pasajero"}
              </Text>
            </View>

            <View>
              <Text style={styles.priceValue}>
                $
                {item.price.toLocaleString(
                  "es-CO"
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* ================= FOOTER ================= */}
        <View style={[styles.ticketFooter, item.status === 'reserved' && { backgroundColor: '#fef3c7', borderTopColor: '#fde68a' }]}>
          {item.status === 'reserved' ? (
            <>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={34}
                color="#d97706"
              />
              <Text style={[styles.footerText, { color: '#d97706', fontWeight: 'bold' }]}>
                Reserva sujeta a pago al abordar
              </Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons
                name="qrcode"
                size={40}
                color={colors.primary}
              />
              <Text style={styles.footerText}>
                Muestra este código al abordar
              </Text>
            </>
          )}
        </View>
      </View>
    );
  };

  /* ================= RENDER ================= */

  return (
    <AppContainer>
      <AppHeader title="Mis Tickets" showBack />

      {loading ? (
        <ListSkeleton count={4} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            padding: 20,
          }}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={loadTickets}
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                marginTop: 50,
              }}
            >
              <MaterialCommunityIcons
                name="ticket-outline"
                size={64}
                color="#ccc"
              />
              <Text
                style={{
                  color: "#888",
                  marginTop: 16,
                }}
              >
                No tienes tickets aún.
              </Text>
            </View>
          }
        />
      )}
    </AppContainer>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
