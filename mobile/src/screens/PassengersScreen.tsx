import { useEffect, useState } from "react";
import { View, FlatList, Alert, ActivityIndicator } from "react-native";
import {
  Text,
  Button,
  Menu,
  Divider,
  TextInput,
  Modal,
  Portal,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styled } from "nativewind";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import { colors } from "../theme/colors";

import {
  getPassengersByTrip,
  registerManualPassenger,
  getTripsForPassengerControl,
} from "../services/ticket.service";

/* ================= TYPES (UI ONLY) ================= */

type Trip = {
  _id: string;
  route: {
    origin: string;
    destination: string;
  };
  date: string;
  departureTime: string;
};

type Passenger = {
  _id: string;
  seatNumber: number;
  status: string;
  passengerName?: string;
};

const StyledView = styled(View);
const StyledText = styled(Text);

export default function PassengersScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [manualName, setManualName] = useState("");

  const loadTrips = async () => {
    try {
      const data = await getTripsForPassengerControl();
      setTrips(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error loading trips", error);
      Alert.alert("Error", "No se pudieron cargar los viajes");
    }
  };

  const loadPassengers = async (tripId: string) => {
    try {
      setLoading(true);
      const data = await getPassengersByTrip(tripId);
      setPassengers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error loading passengers", error);
      Alert.alert("Error", "No se pudieron cargar los pasajeros");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterManualPassenger = async () => {
    if (!selectedTrip || !manualName.trim()) return;

    try {
      await registerManualPassenger(
        selectedTrip._id,
        manualName.trim()
      );

      setManualName("");
      setModalVisible(false);
      loadPassengers(selectedTrip._id);
    } catch (error) {
      console.error("❌ Error registering passenger", error);
      Alert.alert("Error", "No se pudo registrar el pasajero");
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  return (
    <AppContainer>
      <AppHeader title="Pasajeros" showBack />

      {/* ================= SELECTOR DE VIAJE ================= */}
      <StyledView className="p-4">
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setMenuVisible(true)}>
              {selectedTrip
                ? `${selectedTrip.route.origin} → ${selectedTrip.route.destination}`
                : "Seleccionar viaje"}
            </Button>
          }
        >
          {trips.map((trip) => (
            <Menu.Item
              key={trip._id}
              title={`${trip.route.origin} → ${trip.route.destination}`}
              onPress={() => {
                setSelectedTrip(trip);
                setMenuVisible(false);
                loadPassengers(trip._id);
              }}
            />
          ))}
        </Menu>
      </StyledView>

      {/* ================= LISTA DE PASAJEROS ================= */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={passengers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <StyledText className="text-center mt-10 text-gray-500">
              No hay pasajeros registrados
            </StyledText>
          }
          renderItem={({ item }) => (
            <StyledView className="bg-white rounded-xl p-4 mb-3 flex-row justify-between items-center shadow-sm elevation-1">
              <View>
                <StyledText className="text-base font-bold text-gray-900">
                  {item.passengerName || "Pasajero manual"}
                </StyledText>
                <StyledText className="text-gray-500 mt-1">
                  Asiento #{item.seatNumber}
                </StyledText>
              </View>
              <MaterialCommunityIcons
                name="seat"
                size={28}
                color={colors.primary}
              />
            </StyledView>
          )}
        />
      )}

      {/* ================= BOTÓN REGISTRO MANUAL ================= */}
      {selectedTrip && (
        <Button
          mode="contained"
          style={{ margin: 16 }}
          onPress={() => setModalVisible(true)}
        >
          Registrar pasajero manual
        </Button>
      )}

      {/* ================= MODAL REGISTRO MANUAL ================= */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{ backgroundColor: "white", padding: 20, margin: 20, borderRadius: 12 }}
        >
          <StyledText className="text-lg font-bold mb-3 text-gray-900">
            Registrar pasajero
          </StyledText>

          <TextInput
            label="Nombre del pasajero"
            value={manualName}
            onChangeText={setManualName}
            mode="outlined"
          />

          <Divider style={{ marginVertical: 16 }} />

          <Button
            mode="contained"
            onPress={handleRegisterManualPassenger}
          >
            Guardar
          </Button>
        </Modal>
      </Portal>
    </AppContainer>
  );
}
