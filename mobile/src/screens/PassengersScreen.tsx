import React, { useEffect, useState } from "react";
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
  getPassengersByTripRequest,
  registerManualPassengerRequest,
} from "../services/ticket.service";
import { api } from "../services/api";

/* =========================================================
   TYPES
   ========================================================= */

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
  user?: {
    name: string;
  };
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
     CARGAR VIAJES SEGÚN ROL (OWNER / ADMIN)
     ===================================================== */
  const loadTrips = async () => {
    try {
      const response = await api.get<Trip[]>("/trips/manage");
      setTrips(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading trips", error);
      Alert.alert("Error", "No se pudieron cargar los viajes");
    }
  };

  /* =====================================================
     CARGAR PASAJEROS DEL VIAJE
     ===================================================== */
  const loadPassengers = async (tripId: string) => {
    try {
      setLoading(true);
      const data = await getPassengersByTripRequest(tripId);
      setPassengers(data);
    } catch (error) {
      console.error("Error loading passengers", error);
      Alert.alert("Error", "No se pudieron cargar los pasajeros");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     REGISTRO MANUAL
     ===================================================== */
  const registerManualPassenger = async () => {
    if (!selectedTrip || !manualName.trim()) return;

    try {
      await registerManualPassengerRequest(
        selectedTrip._id,
        manualName.trim()
      );

      setManualName("");
      setModalVisible(false);
      loadPassengers(selectedTrip._id);
    } catch (error) {
      console.error("Error registering passenger", error);
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

      {/* SELECTOR DE VIAJE */}
      <View style={styles.selector}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
            >
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

      {/* LISTA DE PASAJEROS */}
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
                  {item.user?.name || "Pasajero manual"}
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

      {/* BOTÓN REGISTRO MANUAL */}
      {selectedTrip && (
        <Button
          mode="contained"
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          Registrar pasajero manual
        </Button>
      )}

      {/* MODAL REGISTRO MANUAL */}
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
            onPress={registerManualPassenger}
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
