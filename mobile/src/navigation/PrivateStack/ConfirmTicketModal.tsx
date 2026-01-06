import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";

import AppContainer from "../../components/ui/AppContainer";
import AppHeader from "../../components/ui/AppHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";

import { spacing } from "../../theme/spacing"; 
import { typography } from "../../theme/typography";
import { colors } from "../../theme/colors";

import { buyTicketRequest } from "../../services/ticket.service";

export default function ConfirmTicketModal() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // 🔑 price DEBE ser number (160000)
  // const { routeName, price } = route.params;const { routeName, price, tripId } = route.params;
const { routeName, price, tripId } = route.params;


  const confirmPurchase = async () => {
    try {
      const ticket = await buyTicketRequest(tripId);


      navigation.replace("TicketReceiptModal", {
        routeName: ticket.routeName,
        price: ticket.price,
        date: ticket.date,
        code: ticket.code,
      });
    } catch (e) {
      console.error("❌ Error comprando ticket", e);
    }
  };

  return (
    <AppContainer>
      <AppHeader title="Confirmar compra" hideLogo />

      <View style={styles.container}>
        <Text style={styles.title}>{routeName}</Text>
        <Text style={styles.label}>
            Lancha rápida
          </Text>
        <View style={styles.card}>
          <Text style={styles.label}>
            Precio del tiquete
          </Text>

          {/* 👇 SOLO VISUAL */}
          <Text style={styles.price}>
            ${price.toLocaleString("es-CO")}
          </Text>
        </View>

        <PrimaryButton
          label="Confirmar compra"
          onPress={confirmPurchase}
        />

        <PrimaryButton
          label="Cancelar"
          onPress={() => navigation.goBack()}
        />
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    opacity: 0.5,
  },
  price: {
    ...typography.value,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  transport: {
    ...typography.body,
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
