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
import { getMyTicketsRequest } from "../services/ticket.service";

export default function HistoryScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getMyTicketsRequest();

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



// import { useEffect, useState } from "react";
// import { ScrollView, StyleSheet } from "react-native";
// import { Text } from "react-native-paper";

// import AppContainer from "../components/ui/AppContainer";
// import AppHeader from "../components/ui/AppHeader";
// import ListItem from "../components/ui/ListItem";

// import { spacing } from "../theme/spacing";
// import { typography } from "../theme/typography";
// import { colors } from "../theme/colors";

// import { Ticket } from "../types/ticket";
// import { getMyTicketsRequest } from "../services/ticket.service";
// import { loadTicketFallback } from "../utils/ticketStorage";

// export default function HistoryScreen() {
//   const [tickets, setTickets] = useState<Ticket[]>([]);
//   const [offline, setOffline] = useState(false);

//   useEffect(() => {
//     loadHistory();
//   }, []);

//   const loadHistory = async () => {
//     try {
//       const data = await getMyTicketsRequest();
//       setTickets(data);
//       setOffline(false);
//     } catch (error) {
//       console.log("📴 Sin conexión", error);
//       const fallback = await loadTicketFallback();
//       setTickets(Array.isArray(fallback) ? fallback : []);
//       setOffline(true);
//     }
//   };

//   const hasTickets =
//     Array.isArray(tickets) && tickets.length > 0;


//   // const loadHistory = async () => {
//   //   try {
//   //     const data = await getMyTicketsRequest();

//   //     // ✅ data YA ES Ticket[]
//   //     setTickets(data);
//   //     setOffline(false);
//   //   } catch (error) {
//   //     console.log("📴 Sin conexión, usando fallback", error);

//   //     const fallback = await loadTicketFallback();
//   //     setTickets(Array.isArray(fallback) ? fallback : []);
//   //     setOffline(true);
//   //   }
//   // };

//   return (
//     <AppContainer>
//       <AppHeader title="Historial" hideLogo />

//       <ScrollView contentContainerStyle={styles.content}>
//         {offline && (
//           <Text style={styles.offline}>
//             Mostrando último tiquete (sin conexión)
//           </Text>
//         )}

//         {!hasTickets && !offline && (
//           <Text style={styles.empty}>
//             No tienes tiquetes aún
//           </Text>
//         )}

//         {/* {!hasTickets && !offline && (
//           <Text style={styles.empty}>
//             No tienes tiquetes aún
//           </Text>
//         )} */}

//         {hasTickets &&
//           tickets.map((t) => (
//             <ListItem
//               key={t._id}
//               title={t.routeName}
//               subtitle={new Date(t.date).toLocaleString()}
//               trailing={`$${t.price.toLocaleString("es-CO")}`}
//             />
//           ))}

//         {/* {Array.isArray(tickets) &&
//           tickets.map((t) => (
//             <ListItem
//               key={t._id}
//               title={t.routeName}
//               subtitle={new Date(t.date).toLocaleString()}
//               trailing={`$${t.price}`}
//             />
//           ))} */}
//       </ScrollView>
//     </AppContainer>
//   );
// }

// const styles = StyleSheet.create({
//   content: {
//     padding: spacing.lg,
//   },
//   offline: {
//     color: colors.textPrimary,
//     marginBottom: spacing.md,
//   },
//   empty: {
//     ...typography.body,
//     color: colors.textSecondary,
//   },
// });
