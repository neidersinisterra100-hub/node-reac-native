import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";

import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import TermsScreen from "../screens/TermsScreen";
import TabNavigator from "./TabNavigator";

import ProfileScreen from "../screens/ProfileScreen";
import MenuScreen from "../screens/MenuScreen";
import BalanceScreen from "../screens/BalanceScreen";
import MyTicketsScreen from "../screens/MyTicketsScreen";
import ValidateTicketScreen from "../screens/ValidateTicketScreen";
import ReportsScreen from "../screens/ReportsScreen";

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

import SettingsScreen from "./PrivateStack/SettingsScreen";
import ConfirmTicketModal from "./PrivateStack/ConfirmTicketModal";
import TicketReceiptModal from "./PrivateStack/TicketReceiptModal";

import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  /**
   * ⏳ Mientras se hidrata el token / sesión
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

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* =====================================================
            USUARIO NO AUTENTICADO
            ===================================================== */}
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />

            <Stack.Screen
              name="Terms"
              component={TermsScreen}
              options={{ presentation: "modal" }}
            />
          </>
        ) : (
          <>
            {/* =================================================
                USUARIO AUTENTICADO
                ================================================= */}

            {/* Dashboard principal */}
            <Stack.Screen name="Tabs" component={TabNavigator} />

            {/* Empresas */}
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

            {/* Rutas y viajes */}
            <Stack.Screen name="AllRoutes" component={AllRoutesScreen} />
            <Stack.Screen name="AllTrips" component={AllTripsScreen} />
            <Stack.Screen name="Trips" component={TripsScreen} />
            <Stack.Screen
              name="CreateRoute"
              component={CreateRouteScreen}
            />
            <Stack.Screen
              name="CreateTrip"
              component={CreateTripScreen}
            />

            {/* Usuario */}
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
            <Stack.Screen
              name="MyTickets"
              component={MyTicketsScreen}
            />
            <Stack.Screen
              name="ValidateTicket"
              component={ValidateTicketScreen}
            />
            <Stack.Screen name="Reports" component={ReportsScreen} />

            {/* Modales */}
            <Stack.Screen
              name="SettingsModal"
              component={SettingsScreen}
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />

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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}




// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { View, ActivityIndicator } from "react-native";

// import { useAuth } from "../context/AuthContext";

// import LoginScreen from "../screens/LoginScreen";
// import TermsScreen from "../screens/TermsScreen";
// import TabNavigator from "./TabNavigator";

// import ProfileScreen from "../screens/ProfileScreen";
// import MenuScreen from "../screens/MenuScreen";
// import BalanceScreen from "../screens/BalanceScreen";
// import MyTicketsScreen from "../screens/MyTicketsScreen";
// import ValidateTicketScreen from "../screens/ValidateTicketScreen";
// import ReportsScreen from "../screens/ReportsScreen";

// import CreateCompanyScreen from "../screens/CreateCompanyScreen";
// import MyCompaniesScreen from "../screens/MyCompaniesScreen";
// import CompanyRoutesScreen from "../screens/CompanyRoutesScreen";
// import CompanyLegalInfoScreen from "../screens/CompanyLegalInfoScreen";

// import CreateTripScreen from "../screens/CreateTripScreen";
// import CreateRouteScreen from "../screens/CreateRouteScreen";

// import AllRoutesScreen from "../screens/AllRoutesScreen";
// import AllTripsScreen from "../screens/AllTripsScreen";
// import TripsScreen from "../screens/TripsScreen";
// import PassengersScreen from "../screens/PassengersScreen";

// import SettingsScreen from "./PrivateStack/SettingsScreen";
// import ConfirmTicketModal from "./PrivateStack/ConfirmTicketModal";
// import TicketReceiptModal from "./PrivateStack/TicketReceiptModal";

// import { RootStackParamList } from "./types";

// const Stack = createNativeStackNavigator<RootStackParamList>();

// export default function AppNavigator() {
//   const { loading } = useAuth();

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
//         <Stack.Screen name="Tabs" component={TabNavigator} />

//         <Stack.Screen
//           name="CreateCompany"
//           component={CreateCompanyScreen}
//         />
//         <Stack.Screen
//           name="MyCompanies"
//           component={MyCompaniesScreen}
//         />
//         <Stack.Screen
//           name="CompanyRoutes"
//           component={CompanyRoutesScreen}
//         />
//         <Stack.Screen
//           name="CompanyLegalInfo"
//           component={CompanyLegalInfoScreen}
//           options={{ presentation: "modal" }}
//         />

//         <Stack.Screen name="AllRoutes" component={AllRoutesScreen} />
//         <Stack.Screen name="AllTrips" component={AllTripsScreen} />
//         <Stack.Screen name="Trips" component={TripsScreen} />
//         <Stack.Screen name="CreateRoute" component={CreateRouteScreen} />
//         <Stack.Screen name="CreateTrip" component={CreateTripScreen} />

//         <Stack.Screen
//           name="Login"
//           component={LoginScreen}
//           options={{
//             presentation: "modal",
//             animation: "slide_from_bottom",
//           }}
//         />

//         <Stack.Screen name="Profile" component={ProfileScreen} />
//         <Stack.Screen name="Passengers" component={PassengersScreen} />
//         <Stack.Screen
//           name="Menu"
//           component={MenuScreen}
//           options={{
//             presentation: "fullScreenModal",
//             animation: "slide_from_bottom",
//           }}
//         />
//         <Stack.Screen name="Balance" component={BalanceScreen} />
//         <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
//         <Stack.Screen
//           name="ValidateTicket"
//           component={ValidateTicketScreen}
//         />
//         <Stack.Screen
//           name="Terms"
//           component={TermsScreen}
//           options={{ presentation: "modal" }}
//         />
//         <Stack.Screen name="Reports" component={ReportsScreen} />

//         <Stack.Screen
//           name="SettingsModal"
//           component={SettingsScreen}
//           options={{
//             presentation: "modal",
//             animation: "slide_from_bottom",
//           }}
//         />

//         <Stack.Screen
//           name="ConfirmTicketModal"
//           component={ConfirmTicketModal}
//           options={{
//             presentation: "modal",
//             animation: "slide_from_bottom",
//           }}
//         />

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
