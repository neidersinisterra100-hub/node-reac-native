import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createTrip } from "../services/trip.service";
import { useRoute } from "@react-navigation/native";
import FormField from "../components/ui/FormField";

type RouteParams = {
  routeId: string;
};

export default function CreateTripScreen() {
  const route = useRoute();
  const { routeId } = route.params as RouteParams;

  const [price, setPrice] = useState("");

  // 🔹 para web
  const [dateText, setDateText] = useState("");
  const [timeText, setTimeText] = useState("");

  // 🔹 para mobile
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const finalDate =
      Platform.OS === "web"
        ? dateText
        : date?.toISOString().split("T")[0];

    const finalTime =
      Platform.OS === "web"
        ? timeText
        : time?.toTimeString().slice(0, 5);

    if (!price || !finalDate || !finalTime) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      await createTrip({
        routeId,
        date: finalDate,
        departureTime: finalTime,
        price: Number(price),
      });

      Alert.alert("Éxito", "Viaje creado correctamente");

      setPrice("");
      setDateText("");
      setTimeText("");
      setDate(null);
      setTime(null);
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
    <View style={styles.container}>
      {/* ===== FECHA ===== */}
      {Platform.OS === "web" ? (
        <TextInput
          placeholder="Fecha (YYYY-MM-DD)"
          value={dateText}
          onChangeText={setDateText}
          style={styles.input}
        />
      ) : (
        <>
          <Pressable
            style={styles.input}
            onPress={() => setShowDate(true)}
          >
            <Text>
              {date
                ? date.toISOString().split("T")[0]
                : "Seleccionar fecha"}
            </Text>
          </Pressable>

          {showDate && (
            <DateTimePicker
              value={date ?? new Date()}
              mode="date"
              onChange={(_, selected) => {
                setShowDate(false);
                if (selected) setDate(selected);
              }}
            />
          )}
        </>
      )}

      {/* ===== HORA ===== */}
      {Platform.OS === "web" ? (
        <TextInput
          placeholder="Hora (HH:mm)"
          value={timeText}
          onChangeText={setTimeText}
          style={styles.input}
        />
      ) : (
        <>
          <Pressable
            style={styles.input}
            onPress={() => setShowTime(true)}
          >
            <Text>
              {time
                ? time.toTimeString().slice(0, 5)
                : "Seleccionar hora"}
            </Text>
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
        </>
      )}

      {/* ===== PRECIO ===== */}

      <FormField
        label="Precio"
        value={price}
        onChangeText={setPrice}
        placeholder="Ej: 45000"
        keyboardType="numeric"
      />

      {/* <TextInput
        placeholder="Precio"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      /> */}

      <Button
        title={loading ? "Creando..." : "Crear viaje"}
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});



// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   Alert,
//   StyleSheet,
//   Pressable,
//   Platform,
// } from "react-native";
// import { useState } from "react";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { createTrip } from "../services/trip.service";

// export default function CreateTripScreen() {
//   const [origin, setOrigin] = useState("");
//   const [destination, setDestination] = useState("");
//   const [price, setPrice] = useState("");

//   // 🔹 para web
//   const [dateText, setDateText] = useState("");
//   const [timeText, setTimeText] = useState("");

//   // 🔹 para mobile
//   const [date, setDate] = useState<Date | null>(null);
//   const [time, setTime] = useState<Date | null>(null);
//   const [showDate, setShowDate] = useState(false);
//   const [showTime, setShowTime] = useState(false);

//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     const finalDate =
//       Platform.OS === "web"
//         ? dateText
//         : date?.toISOString().split("T")[0];

//     const finalTime =
//       Platform.OS === "web"
//         ? timeText
//         : time?.toTimeString().slice(0, 5);

//     if (
//       !origin ||
//       !destination ||
//       !price ||
//       !finalDate ||
//       !finalTime
//     ) {
//       Alert.alert("Error", "Completa todos los campos");
//       return;
//     }

//     setLoading(true);

//     try {
//       await createTrip({
//         origin,
//         destination,
//         date: finalDate,
//         departureTime: finalTime,
//         price: Number(price),
//       });

//       Alert.alert("Éxito", "Viaje creado correctamente");

//       setOrigin("");
//       setDestination("");
//       setPrice("");
//       setDateText("");
//       setTimeText("");
//       setDate(null);
//       setTime(null);
//     } catch (error: any) {
//       Alert.alert(
//         "Error",
//         error?.response?.data?.message ||
//           "No se pudo crear el viaje"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* ===== ORIGEN ===== */}
//       <TextInput
//         placeholder="Origen"
//         value={origin}
//         onChangeText={setOrigin}
//         style={styles.input}
//       />

//       {/* ===== DESTINO ===== */}
//       <TextInput
//         placeholder="Destino"
//         value={destination}
//         onChangeText={setDestination}
//         style={styles.input}
//       />

//       {/* ===== FECHA ===== */}
//       {Platform.OS === "web" ? (
//         <TextInput
//           placeholder="Fecha (YYYY-MM-DD)"
//           value={dateText}
//           onChangeText={setDateText}
//           style={styles.input}
//         />
//       ) : (
//         <>
//           <Pressable
//             style={styles.input}
//             onPress={() => setShowDate(true)}
//           >
//             <Text>
//               {date
//                 ? date.toISOString().split("T")[0]
//                 : "Seleccionar fecha"}
//             </Text>
//           </Pressable>

//           {showDate && (
//             <DateTimePicker
//               value={date ?? new Date()}
//               mode="date"
//               onChange={(_, selected) => {
//                 setShowDate(false);
//                 if (selected) setDate(selected);
//               }}
//             />
//           )}
//         </>
//       )}

//       {/* ===== HORA ===== */}
//       {Platform.OS === "web" ? (
//         <TextInput
//           placeholder="Hora (HH:mm)"
//           value={timeText}
//           onChangeText={setTimeText}
//           style={styles.input}
//         />
//       ) : (
//         <>
//           <Pressable
//             style={styles.input}
//             onPress={() => setShowTime(true)}
//           >
//             <Text>
//               {time
//                 ? time.toTimeString().slice(0, 5)
//                 : "Seleccionar hora"}
//             </Text>
//           </Pressable>

//           {showTime && (
//             <DateTimePicker
//               value={time ?? new Date()}
//               mode="time"
//               onChange={(_, selected) => {
//                 setShowTime(false);
//                 if (selected) setTime(selected);
//               }}
//             />
//           )}
//         </>
//       )}

//       {/* ===== PRECIO ===== */}
//       <TextInput
//         placeholder="Precio"
//         value={price}
//         onChangeText={setPrice}
//         keyboardType="numeric"
//         style={styles.input}
//       />

//       <Button
//         title={loading ? "Creando..." : "Crear viaje"}
//         onPress={handleSubmit}
//         disabled={loading}
//       />
//     </View>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
// });

