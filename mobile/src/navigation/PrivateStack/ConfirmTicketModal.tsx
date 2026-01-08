import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ship, Calendar, Clock, DollarSign } from "lucide-react-native";

import AppContainer from "../../components/ui/AppContainer";
import AppHeader from "../../components/ui/AppHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";

import { colors } from "../../theme/colors";
import { buyTicketRequest } from "../../services/ticket.service";
import { useState } from "react";

export default function ConfirmTicketModal() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { routeName, price, tripId, date, time } = route.params;
  const [loading, setLoading] = useState(false);

  const confirmPurchase = async () => {
    try {
      setLoading(true);
      const ticket = await buyTicketRequest(tripId);

      navigation.replace("TicketReceiptModal", {
        routeName: ticket.routeName || routeName,
        price: ticket.price || price,
        date: ticket.date || date,
        code: ticket.code || "XYZ-123",
      });
    } catch (e: any) {
      console.error("❌ Error comprando ticket", e);
      Alert.alert("Error", e?.response?.data?.message || "No se pudo realizar la compra");
    } finally {
        setLoading(false);
    }
  };

  return (
    <AppContainer>
      <AppHeader title="Resumen de Compra" neon={true} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
            
            {/* Header de la Tarjeta */}
            <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                    <Ship size={32} color="white" />
                </View>
                <Text style={styles.routeTitle}>{routeName}</Text>
                <Text style={styles.transportType}>Lancha Rápida</Text>
            </View>

            <View style={styles.divider} />

            {/* Detalles */}
            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <Calendar size={20} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{date ? new Date(date).toLocaleDateString() : "Fecha pendiente"}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Clock size={20} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{time || "Por confirmar"}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Precio */}
            <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Total a Pagar</Text>
                <Text style={styles.priceValue}>${Number(price).toLocaleString("es-CO")}</Text>
            </View>

            {/* Botones */}
            <View style={styles.actions}>
                <PrimaryButton
                    label="Confirmar Pago"
                    onPress={confirmPurchase}
                    loading={loading}
                />
                <View style={{ height: 12 }} />
                <PrimaryButton
                    label="Cancelar"
                    variant="secondary"
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                />
            </View>

        </View>
      </ScrollView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
      alignItems: 'center',
      marginBottom: 20,
  },
  iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.accent, // Cian
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
  },
  routeTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary, // Navy
      textAlign: 'center',
      marginBottom: 4,
  },
  transportType: {
      fontSize: 14,
      color: colors.textSecondary,
  },
  divider: {
      height: 1,
      backgroundColor: '#f3f4f6',
      marginVertical: 20,
  },
  detailsContainer: {
      gap: 12,
  },
  detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  detailText: {
      fontSize: 16,
      color: '#374151',
      fontWeight: '500',
  },
  priceContainer: {
      alignItems: 'center',
      marginBottom: 24,
  },
  priceLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
  },
  priceValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary, // Navy
  },
  actions: {
      marginTop: 8,
  }
});
