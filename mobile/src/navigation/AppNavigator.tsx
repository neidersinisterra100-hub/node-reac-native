import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";

import LoginScreen from "../screens/LoginScreen";
import TabNavigator from "./TabNavigator";
import SettingsScreen from "./PrivateStack/SettingsScreen";
import ProfileScreen from "../screens/ProfileScreen"; 
import MenuScreen from "../screens/MenuScreen"; 
import BalanceScreen from "../screens/BalanceScreen"; 
import MyTicketsScreen from "../screens/MyTicketsScreen"; 
import ValidateTicketScreen from "../screens/ValidateTicketScreen"; // 👈 Nueva pantalla
import { useAuth } from "../context/AuthContext";
import ConfirmTicketModal from "./PrivateStack/ConfirmTicketModal";
import TicketReceiptModal from "./PrivateStack/TicketReceiptModal";

import HomeScreen from "./publicStack/HomeScreen";
import CreateTripScreen from "../screens/CreateTripScreen";
import CreateRouteScreen from "../screens/CreateRouteScreen";
import CreateCompanyScreen from "../screens/CreateCompanyScreen";
import MyCompaniesScreen from "../screens/MyCompaniesScreen";
import CompanyRoutesScreen from "../screens/CompanyRoutesScreen";
import AllRoutesScreen from "../screens/AllRoutesScreen"; 
import AllTripsScreen from "../screens/AllTripsScreen"; 
import TripsScreen from "../screens/TripsScreen";

/* ================= TYPES ================= */

export type RootStackParamList = {
  Tabs: undefined;

  Home: undefined;
  Login: undefined;

  SettingsModal: undefined;
  Profile: undefined; 
  Menu: undefined; 
  Balance: undefined; 
  MyTickets: undefined; 
  ValidateTicket: undefined; // 👈 Nueva ruta

  // 🏢 EMPRESAS
  CreateCompany: undefined;
  MyCompanies: undefined;
  CompanyRoutes: {
    companyId: string;
    companyName: string;
  };

  // 🛣️ / 🚍
  AllRoutes: undefined; 
  AllTrips: undefined; 
  CreateRoute: { companyId: string };
  Trips: { routeId: string; routeName: string; companyName: string };
  CreateTrip: { routeId?: string; routeName?: string };

  // 🎟️ MODALES
  ConfirmTicketModal: {
    tripId: string; 
    routeName: string;
    price: number;
    date: string;
    time: string;
  };

  TicketReceiptModal: {
    routeName: string;
    price: number;
    date: string;
    code: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/* ================= NAVIGATOR ================= */

export default function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
        <Stack.Screen name="CreateCompany" component={CreateCompanyScreen} />
        <Stack.Screen name="MyCompanies" component={MyCompaniesScreen} />
        <Stack.Screen name="CompanyRoutes" component={CompanyRoutesScreen} />

        {/* 🛣️ / 🚍 */}
        <Stack.Screen name="AllRoutes" component={AllRoutesScreen} /> 
        <Stack.Screen name="AllTrips" component={AllTripsScreen} /> 
        <Stack.Screen name="Trips" component={TripsScreen} />
        <Stack.Screen name="CreateRoute" component={CreateRouteScreen} />
        <Stack.Screen name="CreateTrip" component={CreateTripScreen} />

        {/* 🔐 LOGIN / PROFILE / MENU / BALANCE / TICKETS */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="Balance" component={BalanceScreen} />
        <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
        <Stack.Screen name="ValidateTicket" component={ValidateTicketScreen} />

        {/* ⚙️ SETTINGS */}
        <Stack.Screen name="SettingsModal" component={SettingsScreen} options={{ presentation: "modal", animation: "slide_from_bottom" }} />

        {/* 🎟️ TICKETS */}
        <Stack.Screen name="ConfirmTicketModal" component={ConfirmTicketModal} options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="TicketReceiptModal" component={TicketReceiptModal} options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
