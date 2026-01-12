import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";

import { useAuth } from "../context/AuthContext";

/* =========================
   SCREENS PÚBLICOS / BASE
   ========================= */

import LoginScreen from "../screens/LoginScreen";
import TermsScreen from "../screens/TermsScreen";

/* =========================
   NAVEGACIÓN PRINCIPAL
   ========================= */

import TabNavigator from "./TabNavigator";

/* =========================
   SCREENS GENERALES
   ========================= */

import ProfileScreen from "../screens/ProfileScreen";
import MenuScreen from "../screens/MenuScreen";
import BalanceScreen from "../screens/BalanceScreen";
import MyTicketsScreen from "../screens/MyTicketsScreen";
import ValidateTicketScreen from "../screens/ValidateTicketScreen";
import ReportsScreen from "../screens/ReportsScreen";

/* =========================
   EMPRESAS / OPERACIÓN
   ========================= */

import CreateCompanyScreen from "../screens/CreateCompanyScreen";
import MyCompaniesScreen from "../screens/MyCompaniesScreen";
import CompanyRoutesScreen from "../screens/CompanyRoutesScreen";
import CompanyLegalInfoScreen from "../screens/CompanyLegalInfoScreen";

import CreateTripScreen from "../screens/CreateTripScreen";
import CreateRouteScreen from "../screens/CreateRouteScreen";

import AllRoutesScreen from "../screens/AllRoutesScreen";
import AllTripsScreen from "../screens/AllTripsScreen";
import TripsScreen from "../screens/TripsScreen";
import PassengersScreen from "../screens/PassengersScreen";

/* =========================
   MODALES PRIVADOS
   ========================= */

import SettingsScreen from "./PrivateStack/SettingsScreen";
import ConfirmTicketModal from "./PrivateStack/ConfirmTicketModal";
import TicketReceiptModal from "./PrivateStack/TicketReceiptModal";

/* =========================
   TIPOS
   ========================= */

import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

/* =========================================================
   APP NAVIGATOR
   ========================================================= */

/**
 * AppNavigator
 *
 * Este navigator define TODAS las pantallas de la app.
 *
 * ⚠️ Importante:
 * - No decide si el usuario está logueado o no
 * - Esa lógica vive en los screens / tabs
 */
export default function AppNavigator() {
  const { loading } = useAuth();

  /* =========================
     BLOQUEO MIENTRAS AUTH CARGA
     ========================= */

  /**
   * Mientras AuthContext:
   * - restaura sesión
   * - valida token
   *
   * NO renderizamos navegación
   */
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

  /* =========================
     STACK ROOT
     ========================= */

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* =================================================
           🌍 CONTENEDOR PRINCIPAL
           ================================================= */}

        /**
         * Tabs es el "home real" de la app.
         * Dentro vive:
         * - Home
         * - Trips
         * - Menu
         */
        <Stack.Screen name="Tabs" component={TabNavigator} />

        {/* =================================================
           🏢 EMPRESAS
           ================================================= */}

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
        <Stack.Screen
          name="CompanyLegalInfo"
          component={CompanyLegalInfoScreen}
          options={{ presentation: "modal" }}
        />

        {/* =================================================
           🚍 RUTAS / VIAJES
           ================================================= */}

        <Stack.Screen name="AllRoutes" component={AllRoutesScreen} />
        <Stack.Screen name="AllTrips" component={AllTripsScreen} />
        <Stack.Screen name="Trips" component={TripsScreen} />
        <Stack.Screen name="CreateRoute" component={CreateRouteScreen} />
        <Stack.Screen name="CreateTrip" component={CreateTripScreen} />

        {/* =================================================
           🔐 AUTH / PERFIL / USUARIO
           ================================================= */}

        /**
         * Login como MODAL es buena decisión:
         * - no rompe navegación
         * - se puede cerrar
         */
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />

        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Passengers" component={PassengersScreen} />
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen name="Balance" component={BalanceScreen} />
        <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
        <Stack.Screen
          name="ValidateTicket"
          component={ValidateTicketScreen}
        />
        <Stack.Screen
          name="Terms"
          component={TermsScreen}
          options={{ presentation: "modal" }}
        />
        <Stack.Screen name="Reports" component={ReportsScreen} />

        {/* =================================================
           ⚙️ SETTINGS
           ================================================= */}

        <Stack.Screen
          name="SettingsModal"
          component={SettingsScreen}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />

        {/* =================================================
           🎟️ TICKETS (MODALES)
           ================================================= */}

        <Stack.Screen
          name="ConfirmTicketModal"
          component={ConfirmTicketModal}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />

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
// import ProfileScreen from "../screens/ProfileScreen";
// import MenuScreen from "../screens/MenuScreen";
// import BalanceScreen from "../screens/BalanceScreen";
// import MyTicketsScreen from "../screens/MyTicketsScreen";
// import ValidateTicketScreen from "../screens/ValidateTicketScreen";
// import { useAuth } from "../context/AuthContext";
// import ConfirmTicketModal from "./PrivateStack/ConfirmTicketModal";
// import TicketReceiptModal from "./PrivateStack/TicketReceiptModal";

// // import HomeScreen from "./publicStack/HomeScreen";
// import CreateTripScreen from "../screens/CreateTripScreen";
// import CreateRouteScreen from "../screens/CreateRouteScreen";
// import CreateCompanyScreen from "../screens/CreateCompanyScreen";
// import MyCompaniesScreen from "../screens/MyCompaniesScreen";
// import CompanyRoutesScreen from "../screens/CompanyRoutesScreen";
// import CompanyLegalInfoScreen from "../screens/CompanyLegalInfoScreen";
// import TermsScreen from "../screens/TermsScreen"; 
// import ReportsScreen from "../screens/ReportsScreen"; // 👈 Importar
// import AllRoutesScreen from "../screens/AllRoutesScreen";
// import AllTripsScreen from "../screens/AllTripsScreen";
// import TripsScreen from "../screens/TripsScreen";
// import PassengersScreen from "../screens/PassengersScreen";
// import { RootStackParamList } from "./types";

// const Stack = createNativeStackNavigator<RootStackParamList>();
 
// /* ================= NAVIGATOR ================= */

// export default function AppNavigator() {
//   const { loading } = useAuth();

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {/* 🌍 APP PRINCIPAL */}
//         <Stack.Screen name="Tabs" component={TabNavigator} />
//         {/* <Stack.Screen name="Home" component={HomeScreen} /> */}

//         {/* 🏢 EMPRESAS */}
//         <Stack.Screen name="CreateCompany" component={CreateCompanyScreen} />
//         <Stack.Screen name="MyCompanies" component={MyCompaniesScreen} />
//         <Stack.Screen name="CompanyRoutes" component={CompanyRoutesScreen} />
//         <Stack.Screen name="CompanyLegalInfo" component={CompanyLegalInfoScreen} options={{ presentation: "modal" }} />

//         {/* 🛣️ / 🚍 */}
//         <Stack.Screen name="AllRoutes" component={AllRoutesScreen} />
//         <Stack.Screen name="AllTrips" component={AllTripsScreen} />
//         <Stack.Screen name="Trips" component={TripsScreen} />
//         <Stack.Screen name="CreateRoute" component={CreateRouteScreen} />
//         <Stack.Screen name="CreateTrip" component={CreateTripScreen} />

//         {/* 🔐 LOGIN / PROFILE / MENU / BALANCE / TICKETS / TERMS / REPORTS */}
//         <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: "modal", animation: "slide_from_bottom" }} />       
//         <Stack.Screen name="Profile" component={ProfileScreen} />
//         <Stack.Screen name="Passengers" component={PassengersScreen}/>

//         <Stack.Screen name="Menu" component={MenuScreen} options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }} />
//         <Stack.Screen name="Balance" component={BalanceScreen} />
//         <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
//         <Stack.Screen name="ValidateTicket" component={ValidateTicketScreen} />
//         <Stack.Screen name="Terms" component={TermsScreen} options={{ presentation: "modal" }} />
//         <Stack.Screen name="Reports" component={ReportsScreen} /> 

//         {/* ⚙️ SETTINGS */}
//         <Stack.Screen name="SettingsModal" component={SettingsScreen} options={{ presentation: "modal", animation: "slide_from_bottom" }} />

//         {/* 🎟️ TICKETS */}
//         <Stack.Screen name="ConfirmTicketModal" component={ConfirmTicketModal} options={{ presentation: "modal", animation: "slide_from_bottom" }} />
//         <Stack.Screen name="TicketReceiptModal" component={TicketReceiptModal} options={{ presentation: "modal", animation: "slide_from_bottom" }} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
