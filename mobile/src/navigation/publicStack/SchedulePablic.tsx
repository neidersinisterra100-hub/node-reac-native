import { Alert, Pressable, View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";

export default function ScheduleScreen() {
  const navigation = useNavigation<any>();

  const { user } = useAuth();

const handleCreateRoute = () => {
  // 🔐 Permitir OWNER o ADMIN
  if (!user || (user.role !== "owner" && user.role !== "admin")) {
    Alert.alert(
      "Acceso restringido",
      "Solo administradores u owners pueden crear rutas"
    );
    return;
  }

  navigation.navigate("CreateRoute");
};


  return (
    <View style={styles.container}>
        <Pressable onPress={handleCreateRoute}>
        <Text>+ Crear ruta</Text>
      </Pressable>
      <Text style={styles.text}>Horarios de embarcaciones</Text>
      <Button title="Comprar Ticket" onPress={() => navigation.navigate("Ticket")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, fontWeight: "bold", marginBottom: 20 }
});
