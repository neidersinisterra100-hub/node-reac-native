import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { styled } from "nativewind";
import { ScreenContainer } from "../../components/ui/ScreenContainer";
import { Button } from "../../components/ui/Button";
import {
  useRoute,
  useNavigation,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

// 🔗 Servicios backend
import {
  getTripSeats,
  reserveSeat,
  releaseSeat,
  Seat,
} from "../../services/seat.service";

/* =========================================================
   ESTILOS
   ========================================================= */

const StyledText = styled(Text);
const StyledView = styled(View);

/* =========================================================
   TIPOS DE RUTA
   ========================================================= */

type SeatSelectionRouteProp = RouteProp<
  RootStackParamList,
  "SeatSelection"
>;

/* =========================================================
   SCREEN
   ========================================================= */

export const SeatSelectionScreen = () => {
  const route = useRoute<SeatSelectionRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { tripId, companyId, routeName, price, date, time } = route.params;

  /* =========================
     STATE
     ========================= */

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  /* =========================================================
     CARGA DE ASIENTOS
     ========================================================= */

  const loadSeats = async () => {
    try {
      setLoading(true);
      const data = await getTripSeats(tripId, companyId);
      setSeats(data);

      /* 🚀 RECUPERAR SELECCIONADOS:
         Si ya estaban bloqueados por mí en el backend (ej: volviendo de Confirm),
         marcarlos como seleccionados localmente. */
      const alreadyReserved = data
        .filter(s => s.isReservedByMe)
        .map(s => s.seatNumber);

      if (alreadyReserved.length > 0) {
        setSelectedSeats(alreadyReserved);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        "No se pudieron cargar los asientos"
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setSelectedSeats([]);
      loadSeats();
      return () => { };
    }, [tripId])
  );

  /* =========================================================
     SELECCIÓN LOCAL (NO BLOQUEA AÚN)
     ========================================================= */

  const handleSelectSeat = (seatNumber: number) => {
    setSelectedSeats(prev =>
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  /* =========================================================
     CONFIRMAR ASIENTOS (BLOQUEO REAL EN BACKEND)
     ========================================================= */

  const handleConfirm = async () => {
    if (selectedSeats.length === 0) return;

    try {
      setLoading(true);
      await reserveSeat({
        tripId,
        seatNumbers: selectedSeats,
      });

      // 👉 El backend ya bloqueó los asientos
      navigation.navigate("ConfirmTicketModal", {
        tripId,
        routeName,
        price,
        date,
        time,
        seatNumbers: selectedSeats,
      });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Uno o más asientos acaban de ser tomados.";
      Alert.alert("Error", msg);
      loadSeats(); // 🔄 refrescar estado real
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     VOLVER ATRÁS (LIBERAR ASIENTOS)
     ========================================================= */

  const handleGoBack = async () => {
    if (selectedSeats.length > 0) {
      try {
        await releaseSeat({
          tripId,
          seatNumbers: selectedSeats,
        });
      } catch (error) {
        console.warn("No se pudieron liberar los asientos");
      }
    }

    navigation.goBack();
  };

  /* =========================================================
     ITEM DE ASIENTO
     ========================================================= */

  const SeatItem = ({ seat }: { seat: Seat }) => {
    const isSelected = selectedSeats.includes(seat.seatNumber);

    return (
      <TouchableOpacity
        onPress={() =>
          seat.available && handleSelectSeat(seat.seatNumber)
        }
        disabled={!seat.available}
        className={`w-14 h-14 m-2 rounded-xl justify-center items-center border-2
          ${!seat.available
            ? "bg-gray-200 border-gray-200"
            : isSelected
              ? "bg-nautic-primary border-nautic-primary"
              : "bg-white border-nautic-accent"
          }
        `}
      >
        <StyledText
          className={`font-bold text-lg ${!seat.available
            ? "text-gray-400"
            : isSelected
              ? "text-white"
              : "text-gray-600"
            }`}
        >
          {seat.seatNumber}
        </StyledText>
      </TouchableOpacity>
    );
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <ScreenContainer withPadding>
      <StyledView className="flex-1">
        {/* HEADER */}
        <StyledView className="flex-row items-center mb-6 mt-2">
          <Button
            title="Atrás"
            onPress={handleGoBack}
            variant="ghost"
            className="p-0 mr-4"
          />
          <StyledText className="text-xl font-bold text-nautic-primary">
            Elige tus asientos
          </StyledText>
        </StyledView>

        {/* BODY */}
        {loading && seats.length === 0 ? (
          <StyledView className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0B4F9C" />
          </StyledView>
        ) : (
          <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingBottom: 120,
            }}
          >
            <StyledView className="bg-gray-100 px-12 py-4 rounded-t-full mb-8 border-b-4 border-gray-200">
              <StyledText className="font-bold text-gray-400">
                CABINA (Frente)
              </StyledText>
            </StyledView>

            <StyledView className="flex-row flex-wrap justify-center">
              {seats.map(seat => (
                <SeatItem
                  key={seat.seatNumber}
                  seat={seat}
                />
              ))}
            </StyledView>
          </ScrollView>
        )}

        {/* FOOTER */}
        <StyledView className="absolute bottom-4 left-4 right-4 bg-white/90 p-4 border-t border-gray-100 shadow-lg rounded-xl">
          <StyledView className="flex-row justify-between items-center mb-4">
            <StyledView>
              <StyledText className="text-gray-500 text-xs">
                Asientos ({selectedSeats.length}):
              </StyledText>
              <StyledText className="text-sm font-bold text-nautic-primary">
                {selectedSeats.length > 0 ? selectedSeats.sort((a, b) => a - b).join(", ") : "Ninguno"}
              </StyledText>
            </StyledView>
            <StyledText className="text-lg font-bold text-nautic-primary">
              ${(price * selectedSeats.length).toLocaleString("es-CO")}
            </StyledText>
          </StyledView>

          <Button
            title={loading ? "Procesando..." : "Continuar"}
            onPress={handleConfirm}
            disabled={selectedSeats.length === 0 || loading}
          />
        </StyledView>
      </StyledView>
    </ScreenContainer>
  );
};
