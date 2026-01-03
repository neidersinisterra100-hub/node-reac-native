import { Alert, Pressable, View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

export default function ScheduleScreen() {
  const navigation = useNavigation<any>();

  const { user } = useAuth();

  const handleCreateRoute = () => {
    // 🔐 AQUÍ VA
    if (!user || user.role !== "OWNER") {
      Alert.alert(
        "Acceso restringido",
        "Solo administradores pueden crear rutas"
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



// // import { View, Text, Button, StyleSheet } from "react-native";
// // import { useNavigation } from "@react-navigation/native";

// // export default function ScheduleScreen() {
// //   const navigation = useNavigation<any>();

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.text}>Horarios de embarcaciones</Text>
// //       <Button title="Comprar Ticket" onPress={() => navigation.navigate("Ticket")} />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   text: { fontSize: 18, fontWeight: "bold", marginBottom: 20 }
// // });

// import { View, Text, Pressable, StyleSheet } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { useAuth } from "../context/AuthContext";
// import { colors } from "../theme/colors";
// import { spacing } from "../theme/spacing";

// export default function ScheduleScreen() {
//   const navigation = useNavigation<any>();
//   const { user } = useAuth();

//   // const handleCreateRoute = () => {
//   //   // 🔐 AQUÍ VA
//   //   if (!user || user.role !== "admin") {
//   //     Alert.alert(
//   //       "Acceso restringido",
//   //       "Solo administradores pueden crear rutas"
//   //     );
//   //     return;
//   //   }

//     navigation.navigate("CreateRoute");
//   };

//   // const handleCreateRoute = () => {
//   //   if (!user) {
//   //     navigation.navigate("Login");
//   //     return;
//   //   }

//   //   navigation.navigate("CreateRoute");
//   // };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Rutas disponibles</Text>

//       {/* AQUÍ VA TU LISTA DE RUTAS */}

//       <Pressable style={styles.createButton} onPress={handleCreateRoute}>
//         <Text style={styles.createButtonText}>+ Crear ruta</Text>
//       </Pressable>
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: spacing.lg,
//   },
//   title: {
//     fontSize: 22,
//     marginBottom: spacing.md,
//   },
//   createButton: {
//     marginTop: spacing.lg,
//     backgroundColor: colors.primary,
//     paddingVertical: spacing.md,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   createButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });


// // const styles = StyleSheet.create({
// //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   text: { fontSize: 18, fontWeight: "bold", marginBottom: 20 }
// // });