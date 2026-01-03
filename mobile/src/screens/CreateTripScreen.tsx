import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { createTrip } from "../services/trip.service";
import { useNavigation } from "@react-navigation/native";

export default function CreateTripScreen() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleSubmit = async () => {
    // 🔒 Validación básica
    if (
      !origin ||
      !destination ||
      !date ||
      !departureTime ||
      !price
    ) {
      Alert.alert(
        "Campos requeridos",
        "Completa todos los campos"
      );
      return;
    }

    setLoading(true);

    try {
      await createTrip({
        origin,
        destination,
        date,
        departureTime,
        price: Number(price),
      });

      Alert.alert("Éxito", "Viaje creado correctamente");

      // 🧹 Limpiar formulario
      setOrigin("");
      setDestination("");
      setDate("");
      setDepartureTime("");
      setPrice("");
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
      <TextInput
        placeholder="Origen"
        value={origin}
        onChangeText={setOrigin}
        style={styles.input}
      />

      <TextInput
        placeholder="Destino"
        value={destination}
        onChangeText={setDestination}
        style={styles.input}
      />

      <TextInput
        placeholder="Fecha (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        style={styles.input}
      />

      <TextInput
        placeholder="Hora salida (HH:mm)"
        value={departureTime}
        onChangeText={setDepartureTime}
        style={styles.input}
      />

      <TextInput
        placeholder="Precio"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />

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



// import { View, TextInput, Button, Alert } from "react-native";
// import { useState } from "react";
// // import { createTrip } from "../services/trip.service";

// export default function CreateTripScreen() {
//   const [origin, setOrigin] = useState("");
//   const [destination, setDestination] = useState("");
//   const [date, setDate] = useState("");
//   const [departureTime, setDepartureTime] = useState("");
//   const [price, setPrice] = useState("");

//   const handleSubmit = async () => {
//     try {
//       await createTrip({
//         origin, 
//         destination,
//         date,
//         departureTime,
//         price: Number(price),
//       });

//       Alert.alert("Éxito", "Viaje creado correctamente");
//     } catch {
//       Alert.alert("Error", "No se pudo crear el viaje");
//     }
//   };

//   return (
//     <View>
//       <TextInput placeholder="Origen" onChangeText={setOrigin} />
//       <TextInput placeholder="Destino" onChangeText={setDestination} />
//       <TextInput placeholder="Fecha (YYYY-MM-DD)" onChangeText={setDate} />
//       <TextInput placeholder="Hora salida (HH:mm)" onChangeText={setDepartureTime} />
//       <TextInput placeholder="Precio" keyboardType="numeric" onChangeText={setPrice} />

//       <Button title="Crear viaje" onPress={handleSubmit} />
//     </View>
//   );
// }
