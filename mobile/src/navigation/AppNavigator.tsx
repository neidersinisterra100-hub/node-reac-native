
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";

import LoginScreen from "../screens/LoginScreen";
import TabNavigator from "./TabNavigator";
import SettingsScreen from "./PrivateStack/SettingsScreen";
import { useAuth } from "../context/AuthContext";
import ConfirmTicketModal from "./PrivateStack/ConfirmTicketModal";
import TicketReceiptModal from "./PrivateStack/TicketReceiptModal";
import CreateRouteScreen from "../screens/CreateRouteScreen";
import HomeScreen from "../screens/HomeScreen";
import CreateTripScreen from "../screens/CreateTripScreen";

export type RootStackParamList = {
  Tabs: undefined;

  Login: undefined;

  SettingsModal: undefined;
  CreateRoute: undefined;
  Home: undefined;
  CreateTrip: undefined;

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

export default function AppNavigator() {
  const { loading } = useAuth();

  // ⏳ Loader solo mientras se restaura sesión
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
        {/* 🌍 APP PRINCIPAL (HOME PÚBLICO) */}

        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
        />
        <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Viajes disponibles" }}
      />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{ title: "Crear viaje" }}
      />

        <Stack.Screen
          name="CreateRoute"
          component={CreateRouteScreen}
        />


        {/* 🔐 LOGIN COMO MODAL */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />

        {/* ⚙️ SETTINGS SIN NAVBAR */}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
