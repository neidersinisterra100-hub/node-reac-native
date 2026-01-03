import { ScrollView, View, StyleSheet } from "react-native";
import { Appbar, Text } from "react-native-paper";
import DashboardCard from "../components/DashboardCard";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export default function DashboardScreen() {
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Dashboard" />
        <Appbar.Action icon="bell-outline" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Resumen general</Text>

        <View style={styles.row}>
          <DashboardCard
            title="Ingresos"
            value="$12,450"
            subtitle="+12% este mes"
          />
          <DashboardCard
            title="Usuarios"
            value="1,240"
            subtitle="+5% nuevos"
          />
        </View>

        <View style={styles.row}>
          <DashboardCard title="Órdenes" value="320" />
          <DashboardCard
            title="Pendientes"
            value="18"
            subtitle="Revisar"
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
});


// import { ScrollView, View } from "react-native";
// import { Appbar, Text } from "react-native-paper";
// import DashboardCard from "../components/DashboardCard";

// export default function DashboardScreen() {
//   return ( 
//     <>
//       <Appbar.Header>
//         <Appbar.Content title="Dashboard" />
//         <Appbar.Action icon="bell-outline" />
//       </Appbar.Header>

//       <ScrollView className="bg-gray-100 p-3">
//         <Text className="text-xl font-semibold mb-3">
//           Resumen general
//         </Text>

//         <View className="flex-row">
//           <DashboardCard
//             title="Ingresos"
//             value="$12,450"
//             subtitle="+12% este mes"
//           />
//           <DashboardCard
//             title="Usuarios"
//             value="1,240"
//             subtitle="+5% nuevos"
//           />
//         </View>

//         <View className="flex-row">
//           <DashboardCard
//             title="Órdenes"
//             value="320"
//           />
//           <DashboardCard
//             title="Pendientes"
//             value="18"
//             subtitle="Revisar"
//           />
//         </View>
//       </ScrollView>
//     </>
//   );
// }
