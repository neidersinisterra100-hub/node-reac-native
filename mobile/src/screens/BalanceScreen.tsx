import React from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { LineChart, BarChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";

const screenWidth = Dimensions.get("window").width;

export default function BalanceScreen() {
  const { isDark } = useTheme();

  /* ======================
     DATA (DUMMY)
  ====================== */
  const data = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        strokeWidth: 2,
      },
    ],
    legend: ["Pasajeros"],
  };

  const barData = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    datasets: [{ data: [12, 30, 45, 20, 60, 80, 50] }],
  };

  /* ======================
     CHART CONFIG (REACTIVO)
  ====================== */
  const chartConfig = {
    backgroundGradientFrom: isDark ? "#020617" : "#e0f2fe",
    backgroundGradientTo: isDark ? "#020617" : "#bae6fd",
    decimalPlaces: 0,
    color: (opacity = 1) =>
      isDark
        ? `rgba(56, 189, 248, ${opacity})`
        : `rgba(2, 132, 199, ${opacity})`,
    labelColor: (opacity = 1) =>
      isDark
        ? `rgba(248, 250, 252, ${opacity})`
        : `rgba(15, 23, 42, ${opacity})`,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#38bdf8",
    },
  };

  return (
    <AppContainer>
      <AppHeader title="Balance y Estadísticas" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-5"
      >
        {/* ======================
           BALANCE CARD
        ====================== */}
        <View className="bg-nautic-primary dark:bg-slate-900 rounded-2xl p-6 mt-4 mb-8 items-center shadow-lg">
          <Text className="text-white/70 text-sm mb-2">
            Balance Total
          </Text>

          <Text className="text-white text-4xl font-extrabold mb-3">
            $12.450.000
          </Text>

          <View className="flex-row items-center bg-white/10 px-4 py-1 rounded-full">
            <MaterialCommunityIcons
              name="trending-up"
              size={18}
              color="#4ade80"
            />
            <Text className="text-green-400 font-semibold text-xs ml-1">
              +15% vs mes anterior
            </Text>
          </View>
        </View>

        {/* ======================
           LINE CHART
        ====================== */}
        <Text className="text-lg font-bold text-nautic-primary dark:text-slate-100 mb-3">
          Flujo Mensual de Pasajeros
        </Text>

        <LineChart
          data={data}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{
            borderRadius: 16,
            marginBottom: 24,
          }}
        />

        {/* ======================
           BAR CHART
        ====================== */}
        <Text className="text-lg font-bold text-nautic-primary dark:text-slate-100 mb-3">
          Ingresos por Día
        </Text>

        <BarChart
          data={barData}
          width={screenWidth - 40}
          height={220}
          yAxisLabel="$"
          yAxisSuffix="k"
          chartConfig={{
            ...chartConfig,
            backgroundGradientFrom: isDark ? "#020617" : "#4f46e5",
            backgroundGradientTo: isDark ? "#020617" : "#3730a3",
            color: (opacity = 1) =>
              `rgba(255, 255, 255, ${opacity})`,
          }}
          style={{
            borderRadius: 16,
            marginBottom: 30,
          }}
          showValuesOnTopOfBars
        />
      </ScrollView>
    </AppContainer>
  );
}




// import React, { useState } from "react";
// import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
// import { Text } from "react-native-paper";
// import { LineChart, BarChart } from "react-native-chart-kit";
// import { MaterialCommunityIcons } from "@expo/vector-icons";

// import AppContainer from "../components/ui/AppContainer";
// import AppHeader from "../components/ui/AppHeader";
// import { colors } from "../theme/colors";

// const screenWidth = Dimensions.get("window").width;

// export default function BalanceScreen() {
  
//   // Datos Dummy (Podrían venir de API)
//   const data = {
//     labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
//     datasets: [
//       {
//         data: [20, 45, 28, 80, 99, 43],
//         color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
//         strokeWidth: 2 // optional
//       }
//     ],
//     legend: ["Pasajeros"] // optional
//   };

//   const chartConfig = {
//     backgroundGradientFrom: "#1e293b", // Slate 800
//     backgroundGradientTo: "#0f172a", // Slate 900
//     decimalPlaces: 0, 
//     color: (opacity = 1) => `rgba(0, 243, 255, ${opacity})`, // Cian Neón
//     labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
//     style: {
//       borderRadius: 16
//     },
//     propsForDots: {
//       r: "6",
//       strokeWidth: "2",
//       stroke: "#00bcd4"
//     }
//   };

//   const barData = {
//       labels: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
//       datasets: [
//           {
//               data: [12, 30, 45, 20, 60, 80, 50]
//           }
//       ]
//   };

//   return (
//     <AppContainer>
//       <AppHeader title="Balance y Estadísticas" />

//       <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
//         {/* RESUMEN DE BALANCE */}
//         <View style={styles.balanceCard}>
//             <Text style={styles.balanceLabel}>Balance Total</Text>
//             <Text style={styles.balanceValue}>$ 12,450,000</Text>
//             <View style={styles.trendContainer}>
//                 <MaterialCommunityIcons name="trending-up" size={20} color="#4ade80" />
//                 <Text style={styles.trendText}>+15% vs mes anterior</Text>
//             </View>
//         </View>

//         {/* GRÁFICO DE LÍNEA (FLUJO MENSUAL) */}
//         <Text style={styles.chartTitle}>Flujo Mensual de Pasajeros</Text>
//         <LineChart
//             data={data}
//             width={screenWidth - 40}
//             height={220}
//             chartConfig={chartConfig}
//             bezier
//             style={styles.chart}
//         />

//         {/* GRÁFICO DE BARRAS (INGRESOS SEMANALES) */}
//         <Text style={styles.chartTitle}>Ingresos por Día</Text>
//         <BarChart
//             data={barData}
//             width={screenWidth - 40}
//             height={220}
//             yAxisLabel="$"
//             yAxisSuffix="k"
//             chartConfig={{
//                 ...chartConfig,
//                 backgroundGradientFrom: "#4f46e5", // Indigo
//                 backgroundGradientTo: "#3730a3", // Indigo Dark
//                 color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
//             }}
//             style={styles.chart}
//             showValuesOnTopOfBars
//         />

//       </ScrollView>
//     </AppContainer>
//   );
// }

// const styles = StyleSheet.create({
//   content: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   balanceCard: {
//       backgroundColor: colors.primary, // Navy
//       padding: 24,
//       borderRadius: 20,
//       marginBottom: 30,
//       alignItems: 'center',
//       shadowColor: colors.primary,
//       shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: 0.3,
//       shadowRadius: 10,
//       elevation: 8,
//   },
//   balanceLabel: {
//       color: 'rgba(255,255,255,0.7)',
//       fontSize: 14,
//       marginBottom: 8,
//   },
//   balanceValue: {
//       color: 'white',
//       fontSize: 36,
//       fontWeight: 'bold',
//       marginBottom: 8,
//   },
//   trendContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: 'rgba(255,255,255,0.1)',
//       paddingHorizontal: 12,
//       paddingVertical: 4,
//       borderRadius: 20,
//       gap: 4,
//   },
//   trendText: {
//       color: '#4ade80', // Green 400
//       fontWeight: '600',
//       fontSize: 12,
//   },
//   chartTitle: {
//       fontSize: 18,
//       fontWeight: 'bold',
//       color: colors.primary,
//       marginBottom: 12,
//       marginTop: 10,
//   },
//   chart: {
//       borderRadius: 16,
//       marginVertical: 8,
//       elevation: 4,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//   }
// });
