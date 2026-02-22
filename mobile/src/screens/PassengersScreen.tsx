import React, { useEffect, useState } from "react";
import { View, FlatList, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import {
  Text,
  Menu,
  Divider,
  TextInput,
  Modal,
  Portal,
} from "react-native-paper";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Ship, Users, Armchair, ChevronDown, Plus, Search, X } from "lucide-react-native";

import { ScreenContainer } from "../components/ui/ScreenContainer";
import AppHeader from "../components/ui/AppHeader";
import { PressableCard, Card } from "../components/ui/Card";
import PrimaryButton from "../components/ui/PrimaryButton";
import { PassengersSkeleton } from "../components/ui/Skeletons";
import { colors } from "../theme/colors";

import {
  getPassengersByTrip,
  registerManualPassenger,
  getTripsForPassengerControl,
} from "../services/ticket.service";

/* ================= TYPES ================= */

type Trip = {
  id: string;
  route?: {
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [manualName, setManualName] = useState("");

  const loadTrips = async () => {
    try {
      const data = await getTripsForPassengerControl();
      const tripsArray = Array.isArray(data) ? data : [];
      setTrips(tripsArray);

      // Auto-select first trip if available and none selected
      if (tripsArray.length > 0 && !selectedTrip) {
        setSelectedTrip(tripsArray[0]);
        loadPassengers(tripsArray[0].id);
      }
    } catch (error) {
      console.error("❌ Error loading trips", error);
    }
  };

  const loadPassengers = async (tripId: string) => {
    if (!tripId) return;
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
      await registerManualPassenger({
        tripId: selectedTrip.id,
        passengerName: manualName.trim(),
        passengerId: "MANUAL-" + Date.now(),
      });

      setManualName("");
      setModalVisible(false);
      loadPassengers(selectedTrip.id);
    } catch (error) {
      console.error("❌ Error registering passenger", error);
      Alert.alert("Error", "No se pudo registrar el pasajero");
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    if (selectedTrip) await loadPassengers(selectedTrip.id);
    setRefreshing(false);
  };

  return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Control de Pasajeros" showBack />

      <StyledView className="flex-1 px-4 pt-4">
        {/* ================= TRIP SELECTOR (PREMIUM) ================= */}
        <StyledView className="mb-6">
          <StyledText className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 ml-1">
            Viaje Seleccionado
          </StyledText>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            contentStyle={{ borderRadius: 16, marginTop: 45 }}
            anchor={
              <PressableCard
                onPress={() => setMenuVisible(true)}
                className="flex-row items-center justify-between p-4 bg-white dark:bg-dark-surface border-slate-100 dark:border-dark-border/50 mb-0"
              >
                <StyledView className="flex-row items-center flex-1">
                  <StyledView className="bg-blue-500/10 p-2.5 rounded-xl mr-4">
                    <Ship size={20} color="#3b82f6" />
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="font-black text-nautic-navy dark:text-white text-base leading-tight">
                      {selectedTrip
                        ? `${selectedTrip.route?.origin} → ${selectedTrip.route?.destination}`
                        : "Seleccionar viaje..."}
                    </StyledText>
                    {selectedTrip && (
                      <StyledText className="text-[10px] text-slate-400 font-bold mt-0.5">
                        {new Date(selectedTrip.date).toLocaleDateString()} • {selectedTrip.departureTime}
                      </StyledText>
                    )}
                  </StyledView>
                </StyledView>
                <ChevronDown size={20} color="#94a3b8" />
              </PressableCard>
            }
          >
            <ScrollView style={{ maxHeight: 300 }}>
              {trips.map((trip, index) => (
                <Menu.Item
                  key={trip.id || `trip-${index}`}
                  title={`${trip.route?.origin} → ${trip.route?.destination}`}
                  onPress={() => {
                    setSelectedTrip(trip);
                    setMenuVisible(false);
                    loadPassengers(trip.id);
                  }}
                  titleStyle={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: selectedTrip?.id === trip.id ? '#3b82f6' : '#64748b'
                  }}
                />
              ))}
            </ScrollView>
          </Menu>
        </StyledView>

        {/* ================= PASSENGER LIST ================= */}
        <StyledView className="flex-1">
          <StyledView className="flex-row justify-between items-center mb-4 px-1">
            <StyledView>
              <StyledText className="text-xl font-black text-nautic-navy dark:text-dark-text tracking-tight">Pasajeros</StyledText>
              <StyledView className="h-1 w-6 bg-emerald-500 rounded-full mt-1" />
            </StyledView>

            {selectedTrip && (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="bg-emerald-500 p-2.5 rounded-xl shadow-sm shadow-emerald-500/30 active:scale-95 transition-transform"
              >
                <Plus size={20} color="white" strokeWidth={3} />
              </TouchableOpacity>
            )}
          </StyledView>

          {loading ? (
            <PassengersSkeleton count={6} />
          ) : (
            <FlatList
              data={passengers}
              keyExtractor={(item, index) => item._id || String(index)}
              refreshing={refreshing}
              onRefresh={onRefresh}
              contentContainerStyle={{ paddingBottom: 100 }}
              ListEmptyComponent={
                <StyledView className="items-center justify-center py-20 px-10 bg-white/40 dark:bg-dark-surface/40 rounded-[32px] border border-dashed border-slate-200 dark:border-dark-border/50">
                  <StyledView className="bg-slate-100 dark:bg-dark-bg p-6 rounded-full mb-4">
                    <Users size={40} color="#94a3b8" />
                  </StyledView>
                  <StyledText className="text-slate-500 dark:text-dark-text-muted text-center font-bold">
                    {selectedTrip ? "No hay pasajeros registrados" : "Selecciona un viaje para ver pasajeros"}
                  </StyledText>
                </StyledView>
              }
              renderItem={({ item }) => (
                <PressableCard
                  onPress={() => { }}
                  className="bg-white dark:bg-dark-surface border-slate-100 dark:border-dark-border/50 p-4 mb-3 rounded-3xl"
                  style={{ borderLeftWidth: 6, borderLeftColor: "#10b981" }}
                >
                  <StyledView className="flex-row items-center justify-between">
                    <StyledView className="flex-row items-center flex-1">
                      <StyledView className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl mr-4">
                        <Armchair size={24} color="#10b981" strokeWidth={2.5} />
                      </StyledView>
                      <StyledView className="flex-1">
                        <StyledText className="text-lg font-black text-nautic-navy dark:text-white leading-tight">
                          {item.passengerName || "Pasajero Manual"}
                        </StyledText>
                        <StyledView className="flex-row items-center mt-1">
                          <StyledText className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-dark-bg px-2 py-0.5 rounded-md mr-2">
                            Asiento #{item.seatNumber || "L"}
                          </StyledText>
                          <StyledText className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                            Confirmado
                          </StyledText>
                        </StyledView>
                      </StyledView>
                    </StyledView>
                    <ChevronDown size={14} color="#cbd5e1" />
                  </StyledView>
                </PressableCard>
              )}
            />
          )}
        </StyledView>
      </StyledView>

      {/* ================= MANUAL REGISTRATION MODAL ================= */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: "transparent",
            padding: 20,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Card className="w-full max-w-[340px] bg-white dark:bg-dark-bg p-6 rounded-[32px] border-0 shadow-2xl">
            <StyledView className="flex-row justify-between items-center mb-6">
              <StyledView>
                <StyledText className="text-2xl font-black text-nautic-navy dark:text-white">
                  Registrar
                </StyledText>
                <StyledText className="text-sm font-bold text-slate-400">Pasajero Manual</StyledText>
              </StyledView>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-slate-100 dark:bg-dark-surface p-2 rounded-full"
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </StyledView>

            <TextInput
              label="Nombre y Apellido"
              value={manualName}
              onChangeText={setManualName}
              mode="outlined"
              outlineColor="transparent"
              activeOutlineColor="#10b981"
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: 16,
                marginBottom: 24,
                fontSize: 16,
                height: 56
              }}
              textColor="#0f172a"
              theme={{
                roundness: 16,
                colors: {
                  primary: '#10b981',
                  onSurfaceVariant: '#94a3b8'
                }
              }}
            />

            <PrimaryButton
              label="Confirmar Registro"
              onPress={handleRegisterManualPassenger}
              variant="primary"
            />
          </Card>
        </Modal>
      </Portal>
    </ScreenContainer>
  );
}
