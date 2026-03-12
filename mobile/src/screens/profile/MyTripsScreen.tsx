import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Snackbar } from "react-native-paper";
import { styled } from "nativewind";
import { ScreenContainer } from "../../components/ui/ScreenContainer";
import { PressableCard } from "../../components/ui/Card";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { cancelMyTicket, getMyTickets } from "../../services/ticket.service";
import { Ticket as UITicket } from "../../types/ticket";
import {
  Ticket as TicketIcon,
  Calendar,
  Clock,
  Ship,
} from "lucide-react-native";
import { Button } from "../../components/ui/Button";
import AppHeader from "../../components/ui/AppHeader";
import { formatTimeAmPm } from "../../utils/time";

const StyledText = styled(Text);
const StyledView = styled(View);

export const MyTripsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();

  const [tickets, setTickets] = useState<UITicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarError, setSnackbarError] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadTickets();
    }
  }, [isFocused]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getMyTickets();
      // Ordenar por fecha de creación (más recientes primero)
      setTickets(data);
    } catch (err) {
      console.error("Error loading tickets", err);
    } finally {
      setLoading(false);
    }
  };

  const showInfo = (title: string, message: string) => {
    setSnackbarMessage(`${title}: ${message}`);
    setSnackbarError(title.toLowerCase().includes("error"));
    setSnackbarVisible(true);
  };

  const showConfirm = async (title: string, message: string): Promise<boolean> => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      return window.confirm(`${title}\n\n${message}`);
    }
    return new Promise((resolve) => {
      Alert.alert(title, message, [
        { text: "No", style: "cancel", onPress: () => resolve(false) },
        { text: "Sí", style: "destructive", onPress: () => resolve(true) },
      ]);
    });
  };

  const canCancel = (status?: string) =>
    status === "active" || status === "reserved" || status === "pending_payment";

  const handleCancelTicket = async (ticketId: string) => {
    const confirmed = await showConfirm("Cancelar Ticket", "¿Seguro que quieres cancelar este ticket?");
    if (!confirmed) return;
    try {
      setProcessingId(ticketId);
      await cancelMyTicket(ticketId);
      showInfo("Éxito", "Ticket cancelado correctamente.");
      await loadTickets();
    } catch (error) {
      console.error("Error cancelando ticket propio", error);
      showInfo("Error", "No se pudo cancelar el ticket.");
    } finally {
      setProcessingId(null);
    }
  };

  const renderTicket = ({ item }: { item: UITicket }) => (
    <PressableCard
      onPress={() =>
        navigation.navigate("Ticket", {
          ticketId: item._id,
          // Pasamos el asiento como string o número si es posible, sin forzar Number() que causa NaN
          seatNumber: item.seatNumber ? parseInt(item.seatNumber) : undefined,
          transactionId: item.code,
        })
      }
      className="mx-4 mt-2 mb-2 border-l-4 border-l-nautic-primary"
    >
      {/* HEADER */}
      <StyledView className="flex-row justify-between items-start mb-2">
        <StyledView className="bg-nautic-secondary px-3 py-1 rounded-full flex-row items-center">
          <Ship size={12} color="#0B4F9C" />
          <StyledText className="ml-1 text-xs font-bold text-nautic-primary uppercase">
            {item.transport || "Viaje"}
          </StyledText>
        </StyledView>

        <StyledText className={`text-[10px] font-bold px-2 py-0.5 rounded ${
          item.status === "reserved"
            ? "text-yellow-700 bg-yellow-100"
            : item.status === "used"
              ? "text-blue-700 bg-blue-100"
              : item.status === "cancelled"
                ? "text-red-700 bg-red-100"
                : "text-green-600 bg-green-100"
        }`}>
          {item.status === "reserved"
            ? "RESERVADO"
            : item.status === "used"
              ? "USADO"
              : item.status === "cancelled"
                ? "CANCELADO"
                : "CONFIRMADO"}
        </StyledText>
      </StyledView>

      {/* ROUTE */}
      <StyledText className="text-lg font-bold text-nautic-primary mb-1">
        {item.routeName}
      </StyledText>

      {/* DATE / TIME */}
      <StyledView className="flex-row justify-between mt-2">
        <StyledView className="flex-row items-center">
          <Calendar size={14} color="#64748B" />
          <StyledText className="ml-1 text-xs text-slate-500">
            {item.date ? new Date(item.date).toLocaleDateString("es-CO") : '-'}
          </StyledText>
        </StyledView>

        <StyledView className="flex-row items-center">
          <Clock size={14} color="#64748B" />
          <StyledText className="ml-1 text-xs text-slate-500">
            {formatTimeAmPm(item.departureAt)}
          </StyledText>
        </StyledView>
      </StyledView>

      {/* FOOTER */}
      <StyledView className="flex-row justify-between items-center border-t border-slate-100 mt-3 pt-3">
        <StyledText className="text-xs text-slate-400">
          Asiento:{" "}
          <StyledText className="font-bold text-nautic-primary">
            {item.seatNumber || "General"}
          </StyledText>
        </StyledText>

        <StyledView className="flex-row items-center">
          {canCancel(item.status) ? (
            <TouchableOpacity
              onPress={() => handleCancelTicket(item._id)}
              disabled={processingId === item._id}
              className="bg-red-500 px-3 py-1 rounded-lg"
            >
              <StyledText className="text-white text-xs font-bold">
                {processingId === item._id ? "..." : "Cancelar"}
              </StyledText>
            </TouchableOpacity>
          ) : (
            <>
              <StyledText className="mr-1 text-xs font-bold text-nautic-accent">
                Ver detalle
              </StyledText>
              <TicketIcon size={14} color="#00B4D8" />
            </>
          )}
        </StyledView>
      </StyledView>
    </PressableCard>
  );

  return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Mis Tickets" showBack={false} />

      {loading && tickets.length === 0 ? (
        <StyledView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0B4F9C" />
        </StyledView>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item._id}
          renderItem={renderTicket}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadTickets} />
          }
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: 100,
            paddingHorizontal: 0,
          }}
          ListEmptyComponent={() => (
            <StyledView className="items-center justify-center p-8 mt-10">
              <TicketIcon size={64} color="#CBD5E1" />
              <StyledText className="mt-4 text-center text-slate-400 font-medium text-lg">
                Aún no tienes tickets.
              </StyledText>
              <StyledText className="text-center text-slate-400 text-sm mt-1">
                Tus viajes comprados aparecerán aquí.
              </StyledText>
              <Button
                title="Explorar Rutas"
                onPress={() => navigation.navigate("LocationSelection")}
                className="mt-8 px-8"
              />
            </StyledView>
          )}
        />
      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={{
          marginBottom: 18,
          backgroundColor: snackbarError ? "#dc2626" : "#0B4F9C",
          borderRadius: 12,
        }}
        theme={{ colors: { inverseSurface: "#fff" } }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScreenContainer>
  );
};
