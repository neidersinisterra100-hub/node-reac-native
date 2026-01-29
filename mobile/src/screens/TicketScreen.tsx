import { View, Text, StyleSheet } from "react-native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";

export default function TicketScreen() {
  return (
    <AppContainer>
      <AppHeader title="Ticket" showBack />
      <View style={styles.container}>
        <Text style={styles.text}>Comprar ticket aquí</Text>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, fontWeight: "bold" }
});
