import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { useState } from "react";
import { Text, TextInput } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRoute, useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { createTrip } from "../services/trip.service";
import AppContainer from "../components/ui/AppContainer";
import PrimaryButton from "../components/ui/PrimaryButton";
import AppHeader from "../components/ui/AppHeader";
import { colors } from "../theme/colors";

type RouteParams = {
  routeId: string;
  routeName?: string;
};

export default function CreateTripScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { routeId, routeName } = route.params as RouteParams;

  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState(""); // 🔑 CLAVE
  const [transportType, setTransportType] = useState("lancha");

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const [loading, setLoading] = useState(false);

  /* ================= HANDLERS ================= */

  const handleSubmit = async () => {
    if (!price || !capacity || !date || !time) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    const capacityNumber = Number(capacity);
    const priceNumber = Number(price);

    if (capacityNumber <= 0 || priceNumber < 0) {
      Alert.alert(
        "Error",
        "La capacidad debe ser mayor a 0 y el precio válido"
      );
      return;
    }

    setLoading(true);

    const finalDate = date.toISOString().split("T")[0];
    const finalTime = time.toTimeString().slice(0, 5);

    try {
      await createTrip({
        routeId,
        date: finalDate,
        departureTime: finalTime,
        price: priceNumber,
        capacity: capacityNumber, // 🔑 CLAVE
        transportType,
      });

      Alert.alert("Éxito", "Viaje creado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "No se pudo crear el viaje"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <AppHeader title="Programar Zarpe" neon />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Nueva Salida</Text>
          <Text style={styles.subtitle}>
            {routeName || "Ruta seleccionada"}
          </Text>

          <View style={styles.form}>
            {/* ===== FECHA ===== */}
            <View style={styles.inputContainer}>
              <Pressable onPress={() => setShowDate(true)}>
                <View pointerEvents="none">
                  <TextInput
                    mode="outlined"
                    label="Fecha de Salida"
                    value={
                      date
                        ? format(date, "dd 'de' MMMM, yyyy", {
                            locale: es,
                          })
                        : ""
                    }
                    outlineColor={colors.border}
                    activeOutlineColor={colors.accent}
                    style={styles.input}
                    right={
                      <TextInput.Icon
                        icon="calendar"
                        color={colors.textSecondary}
                      />
                    }
                  />
                </View>
              </Pressable>
              {showDate && (
                <DateTimePicker
                  value={date ?? new Date()}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={(_, selected) => {
                    setShowDate(false);
                    if (selected) setDate(selected);
                  }}
                />
              )}
            </View>

            {/* ===== HORA ===== */}
            <View style={styles.inputContainer}>
              <Pressable onPress={() => setShowTime(true)}>
                <View pointerEvents="none">
                  <TextInput
                    mode="outlined"
                    label="Hora de Zarpe"
                    value={time ? format(time, "HH:mm") : ""}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.accent}
                    style={styles.input}
                    right={
                      <TextInput.Icon
                        icon="clock-outline"
                        color={colors.textSecondary}
                      />
                    }
                  />
                </View>
              </Pressable>
              {showTime && (
                <DateTimePicker
                  value={time ?? new Date()}
                  mode="time"
                  onChange={(_, selected) => {
                    setShowTime(false);
                    if (selected) setTime(selected);
                  }}
                />
              )}
            </View>

            {/* ===== PRECIO ===== */}
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Precio del Ticket"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                outlineColor={colors.border}
                activeOutlineColor={colors.accent}
                style={styles.input}
                left={<TextInput.Affix text="$ " />}
              />
            </View>

            {/* ===== CAPACIDAD ===== */}
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Capacidad (pasajeros)"
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
                outlineColor={colors.border}
                activeOutlineColor={colors.accent}
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon="account-group"
                    color={colors.textSecondary}
                  />
                }
              />
            </View>

            {/* ===== TIPO ===== */}
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Tipo de Embarcación"
                value={transportType}
                onChangeText={setTransportType}
                outlineColor={colors.border}
                activeOutlineColor={colors.accent}
                style={styles.input}
              />
            </View>

            <View style={{ marginTop: 24 }}>
              <PrimaryButton
                label={loading ? "Creando..." : "Publicar Viaje"}
                onPress={handleSubmit}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 4,
  },
  input: {
    backgroundColor: "white",
  },
});



// import {
//   View,
//   StyleSheet,
//   Pressable,
//   Platform,
//   ScrollView,
//   KeyboardAvoidingView,
//   Alert
// } from "react-native";
// import { useState } from "react";
// import { Text, TextInput } from "react-native-paper";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { format } from "date-fns";
// import { es } from "date-fns/locale";

// import { createTrip } from "../services/trip.service";
// import AppContainer from "../components/ui/AppContainer";
// import PrimaryButton from "../components/ui/PrimaryButton";
// import AppHeader from "../components/ui/AppHeader";
// import { colors } from "../theme/colors";

// type RouteParams = {
//   routeId: string;
//   routeName?: string;
// };

// export default function CreateTripScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { routeId, routeName } = route.params as RouteParams;

//   const [price, setPrice] = useState("");
//   const [transportType, setTransportType] = useState("Lancha Rápida"); // Default

//   // 🔹 Fechas
//   const [date, setDate] = useState<Date | null>(null);
//   const [time, setTime] = useState<Date | null>(null);
//   const [showDate, setShowDate] = useState(false);
//   const [showTime, setShowTime] = useState(false);

//   const [loading, setLoading] = useState(false);

//   /* ================= HANDLERS ================= */

//   const handleSubmit = async () => {
//     if (!price || !date || !time || !transportType) {
//       Alert.alert("Error", "Completa todos los campos");
//       return;
//     }

//     setLoading(true);

//     // Formato fecha: YYYY-MM-DD
//     const finalDate = date.toISOString().split("T")[0];
    
//     // Formato hora: HH:mm
//     const finalTime = time.toTimeString().slice(0, 5);

//     try {
//       await createTrip({
//         routeId,
//         date: finalDate,
//         departureTime: finalTime,
//         price: Number(price),
//         transportType,
//       });

//       Alert.alert("Éxito", "Viaje creado correctamente", [
//           { text: "OK", onPress: () => navigation.goBack() }
//       ]);

//     } catch (error: any) {
//       Alert.alert(
//         "Error",
//         error?.response?.data?.message || "No se pudo crear el viaje"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AppContainer>
//         {/* Header con Neón */}
//         <AppHeader title="Programar Zarpe" neon={true} />

//         <KeyboardAvoidingView 
//             behavior={Platform.OS === "ios" ? "padding" : "height"}
//             style={{ flex: 1 }}
//         >
//             <ScrollView 
//                 contentContainerStyle={styles.scrollContent} 
//                 showsVerticalScrollIndicator={false}
//             >
                
//                 <Text style={styles.sectionTitle}>Nueva Salida</Text>
//                 <Text style={styles.subtitle}>{routeName || "Ruta seleccionada"}</Text>

//                 <View style={styles.form}>
                    
//                     {/* ===== FECHA ===== */}
//                     <View style={styles.inputContainer}>
//                         <Pressable onPress={() => setShowDate(true)}>
//                             <View pointerEvents="none">
//                                 <TextInput
//                                     mode="outlined"
//                                     label="Fecha de Salida"
//                                     value={date ? format(date, "dd 'de' MMMM, yyyy", { locale: es }) : ""}
//                                     placeholder="Seleccionar fecha"
//                                     outlineColor={colors.border}
//                                     activeOutlineColor={colors.accent}
//                                     style={styles.input}
//                                     theme={{ colors: { primary: colors.accent } }}
//                                     right={<TextInput.Icon icon="calendar" color={colors.textSecondary} />}
//                                 />
//                             </View>
//                         </Pressable>
//                         {showDate && (
//                             <DateTimePicker
//                                 value={date ?? new Date()}
//                                 mode="date"
//                                 display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                                 minimumDate={new Date()}
//                                 onChange={(_, selected) => {
//                                     setShowDate(false);
//                                     if (selected) setDate(selected);
//                                 }}
//                             />
//                         )}
//                     </View>

//                     {/* ===== HORA ===== */}
//                     <View style={styles.inputContainer}>
//                         <Pressable onPress={() => setShowTime(true)}>
//                             <View pointerEvents="none">
//                                 <TextInput
//                                     mode="outlined"
//                                     label="Hora de Zarpe"
//                                     value={time ? format(time, "hh:mm a") : ""}
//                                     placeholder="Seleccionar hora"
//                                     outlineColor={colors.border}
//                                     activeOutlineColor={colors.accent}
//                                     style={styles.input}
//                                     theme={{ colors: { primary: colors.accent } }}
//                                     right={<TextInput.Icon icon="clock-outline" color={colors.textSecondary} />}
//                                 />
//                             </View>
//                         </Pressable>
//                         {showTime && (
//                             <DateTimePicker
//                                 value={time ?? new Date()}
//                                 mode="time"
//                                 display="default"
//                                 onChange={(_, selected) => {
//                                     setShowTime(false);
//                                     if (selected) setTime(selected);
//                                 }}
//                             />
//                         )}
//                     </View>

//                     {/* ===== PRECIO ===== */}
//                     <View style={styles.inputContainer}>
//                         <TextInput
//                             mode="outlined"
//                             label="Precio del Ticket"
//                             value={price}
//                             onChangeText={setPrice}
//                             placeholder="Ej: 45000"
//                             keyboardType="numeric"
//                             outlineColor={colors.border}
//                             activeOutlineColor={colors.accent}
//                             style={styles.input}
//                             theme={{ colors: { primary: colors.accent } }}
//                             left={<TextInput.Affix text="$ " />}
//                         />
//                     </View>

//                     {/* ===== TIPO TRANSPORTE ===== */}
//                     <View style={styles.inputContainer}>
//                         <TextInput
//                             mode="outlined"
//                             label="Tipo de Embarcación"
//                             value={transportType}
//                             onChangeText={setTransportType}
//                             placeholder="Ej: Lancha Rápida"
//                             outlineColor={colors.border}
//                             activeOutlineColor={colors.accent}
//                             style={styles.input}
//                             theme={{ colors: { primary: colors.accent } }}
//                             right={<TextInput.Icon icon="ferry" color={colors.textSecondary} />}
//                         />
//                     </View>

//                     <View style={{ marginTop: 24 }}>
//                         <PrimaryButton
//                             label={loading ? "Creando..." : "Publicar Viaje"}
//                             onPress={handleSubmit}
//                             loading={loading}
//                         />
//                     </View>

//                 </View>
//             </ScrollView>
//         </KeyboardAvoidingView>
//     </AppContainer>
//   );
// }

// const styles = StyleSheet.create({
//   scrollContent: {
//     padding: 20,
//     paddingTop: 10, // Ajustado porque AppContainer ya tiene SafeArea
//   },
//   sectionTitle: {
//       fontSize: 24,
//       fontWeight: 'bold',
//       color: colors.primary,
//       marginBottom: 4,
//   },
//   subtitle: {
//       fontSize: 14,
//       color: colors.textSecondary,
//       marginBottom: 24,
//   },
//   form: {
//       gap: 16,
//   },
//   inputContainer: {
//       marginBottom: 4,
//   },
//   input: {
//       backgroundColor: "white",
//   }
// });
