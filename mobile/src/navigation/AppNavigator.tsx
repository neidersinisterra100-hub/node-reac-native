import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";

import LoginScreen from "../screens/LoginScreen";
import TabNavigator from "./TabNavigator";
import SettingsScreen from "../screens/SettingsScreen";
import ConfirmTicketModal from "../screens/ConfirmTicketModal";
import TicketReceiptModal from "../screens/TicketReceiptModal";

import { useAuth } from "../context/AuthContext";

/* ================= TYPES ================= */

export type RootStackParamList = {
  Tabs: undefined;

  Login: undefined;

  SettingsModal: undefined;

  ConfirmTicketModal: {
    routeName: string;
    price: number;
  };

  TicketReceiptModal: {
    routeName: string;
    price: number;
    date: string;
    code: string;
  };
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

/* ================= NAVIGATOR ================= */

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            {/* ===== MAIN APP ===== */}
            <Stack.Screen
              name="Tabs"
              component={TabNavigator}
            />

            {/* ===== SETTINGS ===== */}
            <Stack.Screen
              name="SettingsModal"
              component={SettingsScreen}
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />

            {/* ===== CONFIRM TICKET ===== */}
            <Stack.Screen
              name="ConfirmTicketModal"
              component={ConfirmTicketModal}
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />

            {/* ===== RECEIPT ===== */}
            <Stack.Screen
              name="TicketReceiptModal"
              component={TicketReceiptModal}
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { View, ActivityIndicator } from "react-native";

// import LoginScreen from "../screens/LoginScreen";
// import TabNavigator from "./TabNavigator";
// import SettingsScreen from "../screens/SettingsScreen";
// import { useAuth } from "../context/AuthContext";

// export type RootStackParamList = {
//   Tabs: undefined;
//   Login: undefined;
//   SettingsModal: undefined;
// };

// const Stack =
//   createNativeStackNavigator<RootStackParamList>();

// export default function AppNavigator() {
//   const { loading } = useAuth();

//   // ⏳ Loader solo mientras se restaura sesión
//   if (loading) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {/* 🌍 APP PRINCIPAL (HOME PÚBLICO) */}
//         <Stack.Screen
//           name="Tabs"
//           component={TabNavigator}
//         />

//         {/* 🔐 LOGIN COMO MODAL */}
//         <Stack.Screen
//           name="Login"
//           component={LoginScreen}
//           options={{
//             presentation: "modal",
//             animation: "slide_from_bottom",
//           }}
//         />

//         {/* ⚙️ SETTINGS SIN NAVBAR */}
//         <Stack.Screen
//           name="SettingsModal"
//           component={SettingsScreen}
//           options={{
//             presentation: "modal",
//             animation: "slide_from_bottom",
//           }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }


// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { View, ActivityIndicator } from "react-native";

// import LoginScreen from "../screens/LoginScreen";
// import TabNavigator from "./TabNavigator";
// import SettingsScreen from "../screens/SettingsScreen";
// import { useAuth } from "../context/AuthContext";

// export type RootStackParamList = {
//   Tabs: undefined;
//   SettingsModal: undefined;
//   Login: undefined;
// };

// const Stack =
//   createNativeStackNavigator<RootStackParamList>();

// export default function AppNavigator() {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {user ? (
//           <>
//             {/* Tabs con navbar */}
//             <Stack.Screen name="Tabs" component={TabNavigator} />

//             {/* Settings SIN navbar */}
//             <Stack.Screen
//               name="SettingsModal"
//               component={SettingsScreen}
//               options={{
//                 presentation: "modal",
//                 animation: "slide_from_bottom",
//               }}
//             />
//           </>
//         ) : (
//           <Stack.Screen name="Login" component={LoginScreen} />
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
