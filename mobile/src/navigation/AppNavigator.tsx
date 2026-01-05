import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";

import LoginScreen from "../screens/LoginScreen";
import TabNavigator from "./TabNavigator";
import SettingsScreen from "./PrivateStack/SettingsScreen";
import { useAuth } from "../context/AuthContext";
import ConfirmTicketModal from "./PrivateStack/ConfirmTicketModal";
import TicketReceiptModal from "./PrivateStack/TicketReceiptModal";

import HomeScreen from "./publicStack/HomeScreen";
import CreateTripScreen from "../screens/CreateTripScreen";
import CreateRouteScreen from "../screens/CreateRouteScreen";
import CreateCompanyScreen from "../screens/CreateCompanyScreen";
import MyCompaniesScreen from "../screens/MyCompaniesScreen";
import CompanyRoutesScreen from "../screens/CompanyRoutesScreen";

/* ================= TYPES ================= */

export type RootStackParamList = {
  Tabs: undefined;

  Home: undefined;
  Login: undefined;

  SettingsModal: undefined;

  // 🏢 EMPRESAS
  CreateCompany: undefined;
  MyCompanies: undefined;
  CompanyRoutes: {
    companyId: string;
    companyName: string;
  };

  // 🛣️ / 🚍
  CreateRoute: { companyId: string };
  CreateTrip: { routeId?: string };

  // 🎟️ MODALES
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
  const { loading } = useAuth();

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
        {/* 🌍 APP PRINCIPAL */}
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Home" component={HomeScreen} />

        {/* 🏢 EMPRESAS */}
        <Stack.Screen
          name="CreateCompany"
          component={CreateCompanyScreen}
        />

        <Stack.Screen
          name="MyCompanies"
          component={MyCompaniesScreen}
        />

        <Stack.Screen
          name="CompanyRoutes"
          component={CompanyRoutesScreen}
        />

        {/* 🛣️ / 🚍 */}
        <Stack.Screen
          name="CreateRoute"
          component={CreateRouteScreen}
        />

        <Stack.Screen
          name="CreateTrip"
          component={CreateTripScreen}
        />

        {/* 🔐 LOGIN */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />

        {/* ⚙️ SETTINGS */}
        <Stack.Screen
          name="SettingsModal"
          component={SettingsScreen}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />

        {/* 🎟️ CONFIRMAR TIQUETE */}
        <Stack.Screen
          name="ConfirmTicketModal"
          component={ConfirmTicketModal}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />

        {/* 🧾 RECIBO */}
        <Stack.Screen
          name="TicketReceiptModal"
          component={TicketReceiptModal}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}




// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { View, ActivityIndicator } from "react-native";

// import LoginScreen from "../screens/LoginScreen";
// import TabNavigator from "./TabNavigator";
// import SettingsScreen from "./PrivateStack/SettingsScreen";
// import { useAuth } from "../context/AuthContext";
// import ConfirmTicketModal from "./PrivateStack/ConfirmTicketModal";
// import TicketReceiptModal from "./PrivateStack/TicketReceiptModal";

// import HomeScreen from "../screens/HomeScreen";
// import CreateTripScreen from "../screens/CreateTripScreen";
// import CreateRouteScreen from "../screens/CreateRouteScreen";
// import CreateCompanyScreen from "../screens/CreateCompanyScreen";

// /* ================= TYPES ================= */

// export type RootStackParamList = {
//   Tabs: undefined;

//   Home: undefined;
//   Login: undefined;

//   SettingsModal: undefined;

//   CreateCompany: undefined;
//   CreateRoute: undefined;
//   CreateTrip: undefined;

//   ConfirmTicketModal: {
//     routeName: string;
//     price: number;
//   };

//   TicketReceiptModal: {
//     routeName: string;
//     price: number;
//     date: string;
//     code: string;
//   };
// };

// const Stack =
//   createNativeStackNavigator<RootStackParamList>();

// /* ================= NAVIGATOR ================= */

// export default function AppNavigator() {
//   const { loading } = useAuth();

//   // ⏳ Loader mientras se restaura sesión
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
//       <Stack.Navigator
//         screenOptions={{ headerShown: false }}
//       >
//         {/* 🌍 APP PRINCIPAL */}
//         <Stack.Screen
//           name="Tabs"
//           component={TabNavigator}
//         />

//         <Stack.Screen
//           name="Home"
//           component={HomeScreen}
//         />

//         {/* 🏢 EMPRESAS */}
//         <Stack.Screen
//           name="CreateCompany"
//           component={CreateCompanyScreen}
//           options={{
//             title: "Crear empresa",
//           }}
//         />

//         {/* 🛣️ RUTAS */}
//         <Stack.Screen
//           name="CreateRoute"
//           component={CreateRouteScreen}
//         />

//         {/* 🚍 VIAJES */}
//         <Stack.Screen
//           name="CreateTrip"
//           component={CreateTripScreen}
//         />

//         {/* 🔐 LOGIN */}
//         <Stack.Screen
//           name="Login"
//           component={LoginScreen}
//           options={{
//             presentation: "modal",
//             animation: "slide_from_bottom",
//           }}
//         />

//         {/* ⚙️ SETTINGS */}
//         <Stack.Screen
//           name="SettingsModal"
//           component={SettingsScreen}
//           options={{
//             presentation: "modal",
//             animation: "slide_from_bottom",
//           }}
//         />

//         {/* 🎟️ CONFIRMAR TIQUETE */}
//         <Stack.Screen
//           name="ConfirmTicketModal"
//           component={ConfirmTicketModal}
//           options={{
//             presentation: "modal",
//             animation: "slide_from_bottom",
//           }}
//         />

//         {/* 🧾 RECIBO */}
//         <Stack.Screen
//           name="TicketReceiptModal"
//           component={TicketReceiptModal}
//           options={{
//             presentation: "modal",
//             animation: "slide_from_bottom",
//           }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }


