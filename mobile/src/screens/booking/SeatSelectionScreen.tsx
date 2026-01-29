import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { styled } from 'nativewind';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { getTripSeats, Seat } from '../../services/seat.service';

const StyledText = styled(Text);
const StyledView = styled(View);

type SeatSelectionRouteProp = RouteProp<
  RootStackParamList,
  'SeatSelection'
>;

export const SeatSelectionScreen = () => {
  const route = useRoute<SeatSelectionRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // ✅ AHORA SÍ EXISTEN
  const { tripId, routeName, price, date, time } = route.params;

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  useEffect(() => {
    loadSeats();
  }, [tripId]);

  const loadSeats = async () => {
    setLoading(true);
    try {
      const data = await getTripSeats(tripId);
      setSeats(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los asientos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSeat = (seatNumber: number) => {
    setSelectedSeat(prev =>
      prev === seatNumber ? null : seatNumber
    );
  };

  /**
   * ✅ FLUJO REAL
   * TripDetail → SeatSelection → ConfirmTicketModal → Wompi
   */
  const handleConfirm = () => {
    if (!selectedSeat) return;

    navigation.navigate('ConfirmTicketModal', {
      tripId,
      routeName,
      price,
      date,
      time,
      seatNumber: selectedSeat,
    });
  };

  const SeatItem = ({ seat }: { seat: Seat }) => {
    const isSelected = selectedSeat === seat.seatNumber;
    const isAvailable = seat.available;

    let bgColor = 'bg-white';
    let borderColor = 'border-gray-200';
    let textColor = 'text-gray-600';

    if (!isAvailable) {
      bgColor = 'bg-gray-200';
      textColor = 'text-gray-400';
    } else if (isSelected) {
      bgColor = 'bg-nautic-primary';
      borderColor = 'border-nautic-primary';
      textColor = 'text-white';
    } else {
      borderColor = 'border-nautic-accent';
    }

    return (
      <TouchableOpacity
        onPress={() =>
          isAvailable && handleSelectSeat(seat.seatNumber)
        }
        disabled={!isAvailable}
        className={`w-14 h-14 m-2 rounded-xl justify-center items-center border-2 ${bgColor} ${borderColor}`}
      >
        <StyledText className={`font-bold text-lg ${textColor}`}>
          {seat.seatNumber}
        </StyledText>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding>
      <StyledView className="flex-1">
        <StyledView className="flex-row items-center mb-6 mt-2">
          <Button
            title="Atrás"
            onPress={() => navigation.goBack()}
            variant="ghost"
            className="p-0 mr-4"
          />
          <StyledText className="text-xl font-bold text-nautic-primary">
            Elige tu asiento
          </StyledText>
        </StyledView>

        {loading ? (
          <StyledView className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0B4F9C" />
          </StyledView>
        ) : (
          <ScrollView
            contentContainerStyle={{
              alignItems: 'center',
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
                <SeatItem key={seat.seatNumber} seat={seat} />
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
              {selectedSeat ? `#${selectedSeat}` : '-'}
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
