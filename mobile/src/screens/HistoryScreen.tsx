import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import ListItem from "../components/ui/ListItem";

import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { colors } from "../theme/colors";

import { Ticket } from "../types/ticket";
import { getMyTickets } from "../services/ticket.service";

/* =========================================================
   HISTORY SCREEN
   ========================================================= */

/**
 * HistoryScreen
 *
 * 📌 RESPONSABILIDAD:
 * - Mostrar historial de tickets del usuario
 *
 * 📌 IMPORTANTE:
 * - SOLO usa Ticket de UI (types/ticket.ts)
 * - NO conoce estructura del backend
 * - NO accede a trip, payment ni financials
 */
export default function HistoryScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ================= */

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getMyTickets();

      // 🛡️ Garantía de seguridad
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("❌ Error cargando historial", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <AppContainer>
      <AppHeader title="Historial" hideLogo />

      <ScrollView contentContainerStyle={styles.content}>
        {loading && (
          <Text style={styles.empty}>
            Cargando historial…
          </Text>
        )}

        {!loading && tickets.length === 0 && (
          <Text style={styles.empty}>
            No tienes tiquetes aún
          </Text>
        )}

        {!loading &&
          tickets.map((t) => (
            <ListItem
              key={t._id}
              title={t.routeName}
              subtitle={new Date(t.date).toLocaleString()}
              trailing={`$${t.price.toLocaleString("es-CO")}`}
            />
          ))}
      </ScrollView>
    </AppContainer>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
