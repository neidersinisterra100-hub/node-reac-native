import React, { useCallback, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
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
import { reserveTicketOnBoarding } from "../../services/ticket.service";

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

  // Guard against deleting locks when legitimately navigating to checkout
  const isNavigatingToConfirm = useRef(false);

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
      if (Platform.OS === "web") {
        window.alert("No se pudieron cargar los asientos");
      } else {
        Alert.alert(
          "Error",
          "No se pudieron cargar los asientos"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setSelectedSeats([]);
      loadSeats();

      // 🕒 Polling en "Tiempo Real" cada 3 segundos
      const intervalId = setInterval(async () => {
        try {
          const liveData = await getTripSeats(tripId, companyId);
          setSeats(liveData);

          // Si alguien más bloqueó o compró un asiento que yo tenía seleccionado localmente,
          // se elimina de mi carrito instantáneamente.
          setSelectedSeats(prev => {
            const validLocalSeats = prev.filter(sn => {
              const liveSeat = liveData.find(s => s.seatNumber === sn);
              return liveSeat && !liveSeat.isSold && !liveSeat.isLockedByOther;
            });
            return validLocalSeats;
          });
        } catch (error) {
          // Fallo silencioso en background
        }
      }, 3000);

      return () => {
        clearInterval(intervalId);
      };
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
     AUTO-RELEASE ON UNMOUNT OR NAVIGATION
     ========================================================= */
  useFocusEffect(
    useCallback(() => {
      // Reset guard when coming back to the screen
      isNavigatingToConfirm.current = false;

      return () => {
        // Al salir de la pantalla, liberamos los asientos DEL BACKEND de este viaje
        // SOLO SI NO hemos navegado explícitamente a ConfirmTicket.
        if (!isNavigatingToConfirm.current) {
          releaseSeat({
            tripId,
            seatNumbers: [] // Enviando [] limpia todas las reservas del usuario para este viaje
          }).catch(err => console.log('Silently ignoring release error on blur'));
        }
      };
    }, [tripId])
  );

  /* =========================================================
     CONFIRMAR ASIENTOS (BLOQUEO REAL EN BACKEND)
     ========================================================= */

  const handleConfirm = async () => {
    if (selectedSeats.length === 0) return;

    // Advertencia si está tomando asientos 'reserved' de alguien más
    const isTakingReserved = selectedSeats.some(sn => {
      const seat = seats.find(s => s.seatNumber === sn);
      return seat?.isPayOnBoarding;
    });

    try {
      setLoading(true);
      await reserveSeat({
        tripId,
        seatNumbers: selectedSeats,
      });

      // 👉 El backend ya bloqueó los asientos
      isNavigatingToConfirm.current = true;
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
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Error", msg);
      }
      loadSeats(); // 🔄 refrescar estado real
    } finally {
      setLoading(false);
    }
  };

  const handleReserveOnBoarding = async () => {
    if (selectedSeats.length === 0) return;

    if (Platform.OS === "web") {
      const confirm = window.confirm(
        "Si reservas estos asientos para pagar al subir, alguien más que pague por adelantado podría comprarlos y perderás la reserva. ¿Estás de acuerdo?"
      );
      if (confirm) {
        try {
          setLoading(true);
          await reserveSeat({
            tripId,
            seatNumbers: selectedSeats,
          });
          await reserveTicketOnBoarding({
            tripId,
            passengerName: "Reservado",
            passengerId: "000000",
            seatNumbers: selectedSeats
          });
          window.alert("Éxito: Tus asientos han sido reservados.");
          navigation.navigate("Tabs");
        } catch (error: any) {
          console.log(error);
          window.alert(error.response?.data?.message || "No se pudo reservar el asiento.");
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    Alert.alert(
      "Reservar (Pago al abordar)",
      "Si reservas estos asientos para pagar al subir, alguien más que pague por adelantado podría comprarlos y perderás la reserva. ¿Estás de acuerdo?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sí, Reservar",
          onPress: async () => {
            try {
              setLoading(true);
              await reserveSeat({
                tripId,
                seatNumbers: selectedSeats,
              });
              await reserveTicketOnBoarding({
                tripId,
                passengerName: "Reservado", // Podrías pedir el nombre del usuario real
                passengerId: "000000",
                seatNumbers: selectedSeats
              });
              Alert.alert("Éxito", "Tus asientos han sido reservados. Puedes revisar tus reservas pendientes en la pestaña 'Mis Tickets' (Sección Inicio o Tabs).");
              navigation.navigate("Tabs");
            } catch (error: any) {
              console.log(error);
              Alert.alert("Error", error.response?.data?.message || "No se pudo reservar el asiento.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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

    const handlePress = () => {
      if (seat.available) {
        handleSelectSeat(seat.seatNumber);
      } else if (seat.isLockedByOther) {
        if (Platform.OS === "web") {
          window.alert("Este asiento está siendo reservado en este momento por otro usuario. Intenta de nuevo en 5 minutos.");
        } else {
          Alert.alert(
            "Asiento en proceso",
            "Este asiento está siendo reservado en este momento por otro usuario. Intenta de nuevo en 5 minutos."
          );
        }
      }
    };

    let bgClass = "bg-white border-nautic-accent";
    let textClass = "text-gray-600";

    if (isSelected) {
      bgClass = "bg-slate-500 border-slate-500";
      textClass = "text-white";
    } else if (seat.isSold) {
      bgClass = "bg-rose-100 border-rose-300";
      textClass = "text-rose-700";
    } else if (seat.isLockedByOther) {
      bgClass = "bg-slate-200 border-slate-300";
      textClass = "text-slate-500";
    } else if (seat.isPayOnBoarding) {
      bgClass = "bg-yellow-100 border-yellow-400";
      textClass = "text-yellow-700";
    } else if (seat.available) {
      bgClass = "bg-blue-50 border-nautic-primary";
      textClass = "text-nautic-primary";
    }

    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={seat.isSold || seat.isPayOnBoarding}
        className={`w-11 h-11 m-1.5 rounded-xl justify-center items-center border-[2px] ${bgClass}`}
      >
        <StyledText className={`font-bold text-md ${textClass}`}>
          {seat.seatNumber}
        </StyledText>
      </TouchableOpacity>
    );
  };

  /* =========================================================
     RENDER
     ========================================================= */

  /* =========================================================
     GROUP SEATS: LEFT-OVERS DEFORM PROA (TOP), NOT POPA (BOTTOM)
     ========================================================= */
  // Si agrupamos desde abajo (1, 2, 3...) de a 4, garantizamos homogeneidad en Popa
  const COLUMNS = 4;
  const groupedRows: Seat[][] = useMemo(() => {
    const sortedAsc = [...seats].sort((a, b) => a.seatNumber - b.seatNumber);
    const rows: Seat[][] = [];
    for (let i = 0; i < sortedAsc.length; i += COLUMNS) {
      // Chunk de a 4 asientos
      const chunk = sortedAsc.slice(i, i + COLUMNS);
      // Revertimos internamente para que el número mayor esté a la izquierda
      rows.push(chunk.reverse());
    }
    // Revertimos las filas, para que las más altas queden arriba (Proa)
    return rows.reverse();
  }, [seats]);

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
            {/* LEYENDA */}
            <StyledView className="flex-row flex-wrap justify-center gap-x-3 gap-y-2 px-4 mb-4">
              <StyledView className="flex-row items-center"><StyledView className="w-4 h-4 rounded-sm bg-blue-50 border border-nautic-primary mr-2" /><StyledText className="text-xs text-gray-600 font-medium">Libre</StyledText></StyledView>
              <StyledView className="flex-row items-center"><StyledView className="w-4 h-4 rounded-sm bg-slate-500 border border-slate-500 mr-2" /><StyledText className="text-xs text-gray-600 font-medium">Selección</StyledText></StyledView>
              <StyledView className="flex-row items-center"><StyledView className="w-4 h-4 rounded-sm bg-slate-200 border border-slate-300 mr-2" /><StyledText className="text-xs text-gray-600 font-medium">En proceso</StyledText></StyledView>
              <StyledView className="flex-row items-center"><StyledView className="w-4 h-4 rounded-sm bg-rose-100 border border-rose-300 mr-2" /><StyledText className="text-xs text-gray-600 font-medium">Vendido</StyledText></StyledView>
            </StyledView>

            {/* BARCO CONTAINER */}
            <StyledView className="bg-white rounded-3xl pb-6 border-4 border-slate-200 shadow-md mb-8 w-[95%] items-center">

              {/* PROA (Punta / Triángulo falso) */}
              <StyledView className="items-center mb-6">
                <View style={{ width: 0, height: 0, borderLeftWidth: 80, borderRightWidth: 80, borderBottomWidth: 40, borderStyle: 'solid', backgroundColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#f3f4f6' }} />
                <StyledView className="bg-gray-100 w-[160px] h-8 items-center justify-center -mt-[1px]">
                  <StyledText className="font-bold text-gray-400 text-xs tracking-widest">PROA (FRENTE)</StyledText>
                </StyledView>
              </StyledView>

              {/* GRID DE FILAS MANIALES (PROA DEFORMADA, POPA HOMOGENEA) */}
              <StyledView className="px-4 w-full">
                {groupedRows.map((row, rIdx) => (
                  <StyledView key={`row-${rIdx}`} className="flex-row justify-center w-full">
                    {row.map(seat => (
                      <SeatItem
                        key={seat.seatNumber}
                        seat={seat}
                      />
                    ))}
                  </StyledView>
                ))}
              </StyledView>

              {/* POPA (Plana / Atrás) */}
              <StyledView className="bg-gray-100 w-full h-10 mt-6 justify-center items-center border-t-2 border-gray-200">
                <StyledText className="font-bold text-gray-400 text-xs tracking-widest">POPA (ATRÁS)</StyledText>
              </StyledView>
            </StyledView>

            {/* MOTORES REALISTAS (FUERA DEL BARCO, EN EL AGUA) */}
            <StyledView className="flex-row gap-10 -mt-10 mb-12">
              {/* Motor Izquierdo */}
              <StyledView className="items-center">
                <StyledView className="w-14 h-8 bg-slate-700 rounded-t-lg z-10 border border-slate-800" />
                <StyledView className="w-10 h-16 bg-slate-600 rounded-b-3xl border-2 border-slate-800 shadow-lg justify-end items-center pb-1">
                  <StyledView className="w-4 h-4 bg-slate-800 rounded-full" />
                </StyledView>
              </StyledView>
              {/* Motor Derecho */}
              <StyledView className="items-center">
                <StyledView className="w-14 h-8 bg-slate-700 rounded-t-lg z-10 border border-slate-800" />
                <StyledView className="w-10 h-16 bg-slate-600 rounded-b-3xl border-2 border-slate-800 shadow-lg justify-end items-center pb-1">
                  <StyledView className="w-4 h-4 bg-slate-800 rounded-full" />
                </StyledView>
              </StyledView>
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

          <StyledView className="flex-row justify-between gap-2 mt-4">
            <Button
              title="Pagar al abordar"
              onPress={handleReserveOnBoarding}
              disabled={selectedSeats.length === 0 || loading}
              variant="outline"
              className="flex-1"
            />
            <Button
              title="Pagar Ahora"
              onPress={handleConfirm}
              disabled={selectedSeats.length === 0 || loading}
              className="flex-1"
            />
          </StyledView>
        </StyledView>
      </StyledView>
    </ScreenContainer>
  );
};
