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
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  /* =========================================================
     CARGA DE ASIENTOS
     ---------------------------------------------------------
     🔑 CLAVE:
     - useFocusEffect → se ejecuta CADA VEZ que la pantalla
       entra en foco (volver atrás, reabrir, etc.)
     - Esto garantiza UX consistente
   ========================================================= */

  const loadSeats = async () => {
    try {
      setLoading(true);
      const data = await getTripSeats(tripId, companyId);
      setSeats(data);
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
      // 🔄 Siempre refrescamos estado real del backend
      setSelectedSeat(null);
      loadSeats();

      // cleanup no necesario aquí
      return () => { };
    }, [tripId])
  );

  /* =========================================================
     SELECCIÓN LOCAL (NO BLOQUEA AÚN)
     ========================================================= */

  const handleSelectSeat = (seatNumber: number) => {
    setSelectedSeat(prev =>
      prev === seatNumber ? null : seatNumber
    );
  };

  /* =========================================================
     CONFIRMAR ASIENTO (BLOQUEO REAL EN BACKEND)
     ========================================================= */

  const handleConfirm = async () => {
    if (!selectedSeat) return;

    try {
      await reserveSeat({
        tripId,
        seatNumber: selectedSeat,
      });

      // 👉 El backend ya bloqueó el asiento
      navigation.navigate("ConfirmTicketModal", {
        tripId,
        routeName,
        price,
        date,
        time,
        seatNumber: selectedSeat,
      });
    } catch {
      Alert.alert(
        "Asiento no disponible",
        "Este asiento acaba de ser tomado por otro pasajero."
      );
      loadSeats(); // 🔄 refrescar estado real
    }
  };

  /* =========================================================
     VOLVER ATRÁS (LIBERAR ASIENTO)
     ---------------------------------------------------------
     🔥 CRÍTICO:
     - Evita abuso
     - Evita bloqueos fantasma
   ========================================================= */

  const handleGoBack = async () => {
    if (selectedSeat) {
      try {
        await releaseSeat({
          tripId,
          seatNumber: selectedSeat,
        });
      } catch (error) {
        console.warn("No se pudo liberar el asiento");
      }
    }

    navigation.goBack();
  };

  /* =========================================================
     ITEM DE ASIENTO
     ========================================================= */

  const SeatItem = ({ seat }: { seat: Seat }) => {
    const isSelected = selectedSeat === seat.seatNumber;

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
            Elige tu asiento
          </StyledText>
        </StyledView>

        {/* BODY */}
        {loading ? (
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
        <StyledView className="absolute bottom-4 left-4 right-4 bg-white/90 p-4 border-t border-gray-100">
          <StyledView className="flex-row justify-between items-center mb-4">
            <StyledText className="text-gray-500">
              Asiento seleccionado:
            </StyledText>
            <StyledText className="text-xl font-bold text-nautic-primary">
              {selectedSeat ? `#${selectedSeat}` : "-"}
            </StyledText>
          </StyledView>

          <Button
            title="Continuar"
            onPress={handleConfirm}
            disabled={!selectedSeat}
          />
        </StyledView>
      </StyledView>
    </ScreenContainer>
  );
};
