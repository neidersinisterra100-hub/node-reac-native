import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { styled } from "nativewind";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ScreenContainer } from "../components/ui/ScreenContainer";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { createTrip } from "../services/trip.service";
import { formatTimeAmPm, toHHmmFromDate } from "../utils/time";

import {
  Calendar,
  Clock,
  Users,
  Ship,
  ArrowLeft,
} from "lucide-react-native";

import { TextInput } from "react-native-paper";

const StyledText = styled(Text);
const StyledView = styled(View);

/* =========================================================
   TIPADO DE RUTA
   ========================================================= */

type CreateTripRouteProp = RouteProp<
  { params: { routeId: string; routeName?: string } },
  "params"
>;

/* =========================================================
   CONSTANTES DE DOMINIO
   ========================================================= */

// 🔒 Enum controlado (alineado con backend)
const TRANSPORT_TYPES = [
  { label: "Lancha", value: "lancha" },
  { label: "Lancha rápida", value: "lancha rapida" },
];

export default function CreateTripScreen() {
  const navigation = useNavigation();
  const route = useRoute<CreateTripRouteProp>();

  const { routeId, routeName } = route.params;

  /* =====================================================
     ESTADO
     ===================================================== */

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");

  // 🔒 Valor controlado
  const [transportType, setTransportType] =
    useState<"lancha" | "lancha rapida">("lancha");

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  /* =====================================================
     SUBMIT
     ===================================================== */

  const handleSubmit = async () => {
    if (!price || !capacity) {
      Alert.alert(
        "Datos incompletos",
        "Por favor completa precio y capacidad."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        routeId,
        date: date.toISOString().split("T")[0], // YYYY-MM-DD
        departureTime: toHHmmFromDate(time), // HH:mm
        price: Number(price),
        capacity: Number(capacity),
        transportType,
      };

      await createTrip(payload);

      Alert.alert("Éxito", "Viaje creado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 401) {
        Alert.alert(
          "Sesión expirada",
          "Vuelve a iniciar sesión."
        );
      } else if (status === 403) {
        Alert.alert(
          "Sin permisos",
          "Solo el owner puede crear viajes."
        );
      } else if (status === 409) {
        Alert.alert(
          "Conflicto",
          error?.response?.data?.message
        );
      } else {
        Alert.alert(
          "Error",
          error?.response?.data?.message ||
            "No se pudo crear el viaje."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     UI
     ===================================================== */

  return (
    <ScreenContainer withPadding={false}>
      {/* HEADER */}
      <StyledView className="bg-nautic-primary pt-12 pb-6 px-6 rounded-b-[24px] mb-4 flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-white/20 p-2 rounded-full"
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <StyledText className="text-white text-xl font-bold">
            Programar Zarpe
          </StyledText>
          <StyledText className="text-white/70 text-sm">
            {routeName || "Nueva salida"}
          </StyledText>
        </View>
      </StyledView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Card className="p-4 mb-4 space-y-4">
            {/* FECHA */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                mode="outlined"
                label="Fecha de salida"
                value={format(date, "dd 'de' MMMM, yyyy", {
                  locale: es,
                })}
                editable={false}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Calendar size={20} color="#64748B" />
                    )}
                  />
                }
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                minimumDate={new Date()}
                onChange={(_, selected) => {
                  setShowDatePicker(false);
                  if (selected) setDate(selected);
                }}
              />
            )}

            {/* HORA */}
            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <TextInput
                mode="outlined"
                label="Hora de zarpe"
                value={formatTimeAmPm(toHHmmFromDate(time))}
                editable={false}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Clock size={20} color="#64748B" />
                    )}
                  />
                }
              />
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                onChange={(_, selected) => {
                  setShowTimePicker(false);
                  if (selected) setTime(selected);
                }}
              />
            )}

            {/* PRECIO */}
            <TextInput
              mode="outlined"
              label="Precio por persona"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              left={<TextInput.Affix text="$ " />}
            />

            {/* CAPACIDAD */}
            <TextInput
              mode="outlined"
              label="Capacidad (pax)"
              keyboardType="numeric"
              value={capacity}
              onChangeText={setCapacity}
              right={
                <TextInput.Icon
                  icon={() => (
                    <Users size={20} color="#64748B" />
                  )}
                />
              }
            />

            {/* TRANSPORTE */}
            <TextInput
              mode="outlined"
              label="Embarcación"
              value={
                TRANSPORT_TYPES.find(
                  (t) => t.value === transportType
                )?.label
              }
              editable={false}
              right={
                <TextInput.Icon
                  icon={() => (
                    <Ship size={20} color="#64748B" />
                  )}
                />
              }
            />
          </Card>

          <Button
            title="Publicar viaje"
            onPress={handleSubmit}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
