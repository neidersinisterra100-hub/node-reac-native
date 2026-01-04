import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import AppContainer from "../../components/ui/AppContainer";
import AppHeader from "../../components/ui/AppHeader";
import ListItem from "../../components/ui/ListItem";

import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { colors } from "../../theme/colors";

import { Ticket } from "../../types/ticket";
import { getMyTickets } from "../../services/ticket.service";

export default function HistoryScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getMyTickets();

      // 🛡️ SIEMPRE ARRAY
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("❌ Error cargando historial", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <AppHeader title="Historial" hideLogo />

      <ScrollView contentContainerStyle={styles.content}>
        {loading && (
          <Text style={styles.empty}>Cargando historial…</Text>
        )}

        {!loading && tickets.length === 0 && (
          <Text style={styles.empty}>
            No tienes tiquetes aún
          </Text>
        )}

        {tickets.map((t) => (
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
