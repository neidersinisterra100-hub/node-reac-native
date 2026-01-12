import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
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

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import { colors } from "../theme/colors";

import {
  getPassengersByTrip,
  registerManualPassenger,
  getTripsForPassengerControl,
} from "../services/ticket.service";

/* =========================================================
   TYPES (UI ONLY)
   ========================================================= */

/**
 * Trip (vista de control)
 */
type Trip = {
  _id: string;
  route: {
    origin: string;
    destination: string;
  };
  date: string;
  departureTime: string;
};

/**
 * Passenger (ticket simplificado)
 */
type Passenger = {
  _id: string;
  seatNumber: number;
  status: string;
  passengerName?: string;
};

/* =========================================================
   SCREEN
   ========================================================= */

export default function PassengersScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [manualName, setManualName] = useState("");

  /* =====================================================
     CARGAR VIAJES DISPONIBLES (OWNER / ADMIN)
     ===================================================== */
  const loadTrips = async () => {
    try {
      const data = await getTripsForPassengerControl();
      setTrips(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error loading trips", error);
      Alert.alert("Error", "No se pudieron cargar los viajes");
    }
  };

  /* =====================================================
     CARGAR PASAJEROS DEL VIAJE
     ===================================================== */
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

  /* =====================================================
     REGISTRO MANUAL DE PASAJERO
     ===================================================== */
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

  /* =====================================================
     RENDER
     ===================================================== */
  return (
    <AppContainer>
      <AppHeader title="Pasajeros" />

      {/* ================= SELECTOR DE VIAJE ================= */}
      <View style={styles.selector}>
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
      </View>

      {/* ================= LISTA DE PASAJEROS ================= */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={passengers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 40 }}>
              No hay pasajeros registrados
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.passengerCard}>
              <View>
                <Text style={styles.passengerName}>
                  {item.passengerName || "Pasajero manual"}
                </Text>
                <Text style={styles.seat}>
                  Asiento #{item.seatNumber}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="seat"
                size={28}
                color={colors.primary}
              />
            </View>
          )}
        />
      )}

      {/* ================= BOTÓN REGISTRO MANUAL ================= */}
      {selectedTrip && (
        <Button
          mode="contained"
          style={styles.addButton}
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
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>
            Registrar pasajero
          </Text>

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

/* =========================================================
   STYLES
   ========================================================= */

const styles = StyleSheet.create({
  selector: {
    padding: 16,
  },
  passengerCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  seat: {
    color: "#6b7280",
    marginTop: 4,
  },
  addButton: {
    margin: 16,
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
});
