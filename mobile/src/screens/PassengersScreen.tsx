import React, { useEffect, useState } from "react";
import { View, FlatList, Alert, ActivityIndicator, TouchableOpacity, ScrollView, Platform } from "react-native";
import {
  Text,
  Menu,
  Divider,
  TextInput,
  Modal,
  Portal,
  Snackbar,
} from "react-native-paper";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Ship, Users, Armchair, ChevronDown, Plus, Search, X, Unlock } from "lucide-react-native";

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
  confirmAdminReservation,
  cancelTicket,
  updatePassengerInfo,
} from "../services/ticket.service";
import { clearTripLocks } from "../services/seat.service";

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
  passengerId?: string;
  passengerPhone?: string;
  passengerEmail?: string;
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
  const [manualId, setManualId] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [expandedPassengerId, setExpandedPassengerId] = useState<string | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [processingTicketId, setProcessingTicketId] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarError, setSnackbarError] = useState(false);

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
        { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
        { text: "Confirmar", style: "destructive", onPress: () => resolve(true) },
      ]);
    });
  };

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
      showInfo("Error", "No se pudieron cargar los pasajeros");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterManualPassenger = async () => {
    if (!selectedTrip || !manualName.trim() || !manualId.trim()) {
      showInfo("Atención", "El nombre y el documento son obligatorios.");
      return;
    }

    try {
      await registerManualPassenger({
        tripId: selectedTrip.id,
        passengerName: manualName.trim(),
        passengerId: manualId.trim(),
        passengerPhone: manualPhone.trim() || undefined,
        passengerEmail: manualEmail.trim() || undefined,
      });

      setManualName("");
      setManualId("");
      setManualPhone("");
      setManualEmail("");
      setModalVisible(false);
      loadPassengers(selectedTrip.id);
      showInfo("Éxito", "Pasajero registrado correctamente.");
    } catch (error) {
      console.error("❌ Error registering passenger", error);
      showInfo("Error", "No se pudo registrar el pasajero");
    }
  };

  const handleUpdatePassengerInfo = async () => {
    if (!editPhone.trim() && !editEmail.trim()) {
      showInfo("Atención", "Proporciona al menos un teléfono o correo.");
      return;
    }

    try {
      setLoading(true);
      await updatePassengerInfo(editingTicketId, {
        passengerPhone: editPhone.trim() || undefined,
        passengerEmail: editEmail.trim() || undefined,
      });

      showInfo("Éxito", "Información del pasajero actualizada.");
      setEditModalVisible(false);
      if (selectedTrip) loadPassengers(selectedTrip.id);
    } catch (error) {
      console.error("❌ Error updating passenger info", error);
      showInfo("Error", "No se pudo actualizar la información.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReservation = async (ticketId: string) => {
    const confirmed = await showConfirm("Confirmar Pago", "¿El pasajero ya pagó este boleto?");
    if (!confirmed) return;
    try {
      setProcessingTicketId(ticketId);
      await confirmAdminReservation(ticketId);
      showInfo("Éxito", "El ticket ha sido confirmado y está activo.");
      if (selectedTrip) {
        await loadPassengers(selectedTrip.id);
      }
    } catch (error) {
      console.error(error);
      showInfo("Error", "No se pudo confirmar el pago.");
    } finally {
      setProcessingTicketId(null);
    }
  };

  const handleCancelPassenger = async (ticketId: string) => {
    const confirmed = await showConfirm(
      "Eliminar Pasajero",
      "¿Seguro que quieres eliminar este pasajero?"
    );
    if (!confirmed) return;
    try {
      setProcessingTicketId(ticketId);
      await cancelTicket(ticketId);
      showInfo("Éxito", "Pasajero eliminado correctamente.");
      if (selectedTrip) {
        await loadPassengers(selectedTrip.id);
      }
    } catch (error) {
      console.error("❌ Error canceling ticket", error);
      showInfo("Error", "No se pudo eliminar el pasajero.");
    } finally {
      setProcessingTicketId(null);
    }
  };

  const handleClearLocks = async () => {
    if (!selectedTrip) return;
    const confirmed = await showConfirm(
      "Liberar Asientos Bloqueados",
      "¿Estás seguro de que deseas liberar todos los asientos que han quedado bloqueados temporalmente?"
    );
    if (!confirmed) return;
    try {
      setLoading(true);
      await clearTripLocks(selectedTrip.id);
      showInfo("Éxito", "Los asientos bloqueados han sido liberados.");
    } catch (error) {
      console.error(error);
      showInfo("Error", "No se pudieron liberar los asientos.");
    } finally {
      setLoading(false);
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

            <StyledView className="flex-row items-center space-x-2">
              {selectedTrip && (
                <TouchableOpacity
                  onPress={handleClearLocks}
                  className="bg-amber-500 p-2.5 rounded-xl shadow-sm shadow-amber-500/30 active:scale-95 transition-transform mr-2"
                >
                  <Unlock size={20} color="white" strokeWidth={3} />
                </TouchableOpacity>
              )}
              {selectedTrip && (
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  className="bg-emerald-500 p-2.5 rounded-xl shadow-sm shadow-emerald-500/30 active:scale-95 transition-transform"
                >
                  <Plus size={20} color="white" strokeWidth={3} />
                </TouchableOpacity>
              )}
            </StyledView>
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
              renderItem={({ item }) => {
                const isExpanded = expandedPassengerId === item._id;
                const isIncomplete = !item.passengerPhone || !item.passengerEmail;

                return (
                  <PressableCard
                    onPress={() => setExpandedPassengerId(isExpanded ? null : item._id)}
                    className={`bg-white dark:bg-dark-surface border p-4 mb-3 rounded-3xl ${isIncomplete ? "border-amber-200 dark:border-amber-900/50" : "border-slate-100 dark:border-dark-border/50"}`}
                    style={{ borderLeftWidth: 6, borderLeftColor: isIncomplete ? "#f59e0b" : "#10b981" }}
                  >
                    <StyledView className="flex-row items-center justify-between">
                      <StyledView className="flex-row items-center flex-1">
                        <StyledView className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl mr-4">
                          <Armchair size={24} color="#10b981" strokeWidth={2.5} />
                        </StyledView>
                        <StyledView className="flex-1">
                          <StyledView className="flex-row items-center">
                            <StyledText className="text-lg font-black text-nautic-navy dark:text-white leading-tight mr-2">
                              {item.passengerName || "Pasajero Manual"}
                            </StyledText>
                            {isIncomplete && (
                              <StyledView className="bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                                <StyledText className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                  Incompleto
                                </StyledText>
                              </StyledView>
                            )}
                          </StyledView>
                          <StyledView className="flex-row items-center mt-1">
                            <StyledText className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-dark-bg px-2 py-0.5 rounded-md mr-2">
                              Asiento #{item.seatNumber || "L"}
                            </StyledText>
                            {item.status === "reserved" ? (
                              <StyledText className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-tighter bg-yellow-100 dark:bg-yellow-900/30 px-2 rounded-sm">
                                Pagar al Abordar
                              </StyledText>
                            ) : item.status === "active" ? (
                              <StyledText className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                                Confirmado
                              </StyledText>
                            ) : item.status === "used" ? (
                              <StyledText className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                                Abordó
                              </StyledText>
                            ) : (
                              <StyledText className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
                                {item.status}
                              </StyledText>
                            )}
                          </StyledView>
                        </StyledView>
                      </StyledView>

                      <StyledView className="flex-row items-center">
                        {item.status === "reserved" ? (
                          <>
                            <TouchableOpacity
                              onPress={() => handleConfirmReservation(item._id)}
                              disabled={processingTicketId === item._id}
                              className="bg-emerald-500 px-3 py-2 rounded-xl active:opacity-80 mr-2"
                            >
                              <StyledText className="text-white text-xs font-bold">
                                {processingTicketId === item._id ? "..." : "Cobrar"}
                              </StyledText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleCancelPassenger(item._id)}
                              disabled={processingTicketId === item._id}
                              className="bg-red-500 px-3 py-2 rounded-xl active:opacity-80 mr-2"
                            >
                              <StyledText className="text-white text-xs font-bold">
                                {processingTicketId === item._id ? "..." : "Cancelar"}
                              </StyledText>
                            </TouchableOpacity>
                          </>
                        ) : item.status === "active" || item.status === "pending_payment" ? (
                          <TouchableOpacity
                            onPress={() => handleCancelPassenger(item._id)}
                            disabled={processingTicketId === item._id}
                            className="bg-red-500 px-3 py-2 rounded-xl active:opacity-80 mr-2"
                          >
                            <StyledText className="text-white text-xs font-bold">
                              {processingTicketId === item._id ? "..." : "Cancelar"}
                            </StyledText>
                          </TouchableOpacity>
                        ) : null}
                        <ChevronDown
                          size={20}
                          color="#cbd5e1"
                          style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                        />
                      </StyledView>
                    </StyledView>

                    {isExpanded && (
                      <StyledView className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-border/50">
                        <StyledView className="flex-row justify-between mb-2">
                          <StyledText className="text-sm text-slate-500 dark:text-slate-400 font-medium">Nombre Completo</StyledText>
                          <StyledText className="text-sm font-bold text-nautic-navy dark:text-white">
                            {item.passengerName || "No registrado"}
                          </StyledText>
                        </StyledView>
                        <StyledView className="flex-row justify-between mb-2">
                          <StyledText className="text-sm text-slate-500 dark:text-slate-400 font-medium">Documento</StyledText>
                          <StyledText className="text-sm font-bold text-nautic-navy dark:text-white">
                            {item.passengerId || "No registrado"}
                          </StyledText>
                        </StyledView>
                        <StyledView className="flex-row justify-between mb-2">
                          <StyledText className="text-sm text-slate-500 dark:text-slate-400 font-medium">Teléfono</StyledText>
                          <StyledText className="text-sm font-bold text-nautic-navy dark:text-white">
                            {item.passengerPhone || "No registrado"}
                          </StyledText>
                        </StyledView>
                        <StyledView className="flex-row justify-between mb-2">
                          <StyledText className="text-sm text-slate-500 dark:text-slate-400 font-medium">Email / Contacto Emergencia</StyledText>
                          <StyledText className="text-sm font-bold text-nautic-navy dark:text-white">
                            {item.passengerEmail || "No registrado"}
                          </StyledText>
                        </StyledView>
                        <StyledView className="flex-row justify-between">
                          <StyledText className="text-sm text-slate-500 dark:text-slate-400 font-medium">Estado del Asiento</StyledText>
                          <StyledText className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {item.status === 'active' ? 'Pagado y Confirmado' : item.status === 'reserved' ? 'Pendiente de Pago' : item.status}
                          </StyledText>
                        </StyledView>

                        {isIncomplete && (
                          <StyledView className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-border/50 items-end">
                            <StyledView className="w-36">
                              <PrimaryButton
                                label="Completar Datos"
                                onPress={() => {
                                  setEditingTicketId(item._id);
                                  setEditPhone(item.passengerPhone || "");
                                  setEditEmail(item.passengerEmail || "");
                                  setEditModalVisible(true);
                                }}
                              />
                            </StyledView>
                          </StyledView>
                        )}
                      </StyledView>
                    )}
                  </PressableCard>
                );
              }}
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
                marginBottom: 12,
                fontSize: 16,
                height: 56
              }}
              textColor="#0f172a"
              theme={{ roundness: 16, colors: { primary: '#10b981', onSurfaceVariant: '#94a3b8' } }}
            />

            <TextInput
              label="Documento de Identidad"
              value={manualId}
              onChangeText={setManualId}
              mode="outlined"
              outlineColor="transparent"
              activeOutlineColor="#10b981"
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: 16,
                marginBottom: 12,
                fontSize: 16,
                height: 56
              }}
              textColor="#0f172a"
              theme={{ roundness: 16, colors: { primary: '#10b981', onSurfaceVariant: '#94a3b8' } }}
            />

            <TextInput
              label="Teléfono (Opcional)"
              value={manualPhone}
              onChangeText={setManualPhone}
              mode="outlined"
              outlineColor="transparent"
              activeOutlineColor="#10b981"
              keyboardType="phone-pad"
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: 16,
                marginBottom: 12,
                fontSize: 16,
                height: 56
              }}
              textColor="#0f172a"
              theme={{ roundness: 16, colors: { primary: '#10b981', onSurfaceVariant: '#94a3b8' } }}
            />

            <TextInput
              label="Correo Electrónico (Opcional)"
              value={manualEmail}
              onChangeText={setManualEmail}
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address"
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
              theme={{ roundness: 16, colors: { primary: '#10b981', onSurfaceVariant: '#94a3b8' } }}
            />

            <PrimaryButton
              label="Confirmar Registro"
              onPress={handleRegisterManualPassenger}
              variant="primary"
            />
          </Card>
        </Modal>

        {/* ================= EDIT PASSENGER INFO MODAL ================= */}
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
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
                  Completar
                </StyledText>
                <StyledText className="text-sm font-bold text-slate-400">Datos del Pasajero</StyledText>
              </StyledView>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                className="bg-slate-100 dark:bg-dark-surface p-2 rounded-full"
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </StyledView>

            <TextInput
              label="Teléfono"
              value={editPhone}
              onChangeText={setEditPhone}
              mode="outlined"
              outlineColor="transparent"
              activeOutlineColor="#f59e0b"
              keyboardType="phone-pad"
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: 16,
                marginBottom: 12,
                fontSize: 16,
                height: 56
              }}
              textColor="#0f172a"
              theme={{ roundness: 16, colors: { primary: '#f59e0b', onSurfaceVariant: '#94a3b8' } }}
            />

            <TextInput
              label="Correo Electrónico"
              value={editEmail}
              onChangeText={setEditEmail}
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address"
              outlineColor="transparent"
              activeOutlineColor="#f59e0b"
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: 16,
                marginBottom: 24,
                fontSize: 16,
                height: 56
              }}
              textColor="#0f172a"
              theme={{ roundness: 16, colors: { primary: '#f59e0b', onSurfaceVariant: '#94a3b8' } }}
            />

            <StyledView className="bg-amber-500 rounded-xl overflow-hidden shadow-sm shadow-amber-500/30">
              <PrimaryButton
                label={loading ? "Actualizando..." : "Actualizar"}
                onPress={handleUpdatePassengerInfo}
                disabled={loading}
              />
            </StyledView>
          </Card>
        </Modal>

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

      </Portal>
    </ScreenContainer>
  );
}
