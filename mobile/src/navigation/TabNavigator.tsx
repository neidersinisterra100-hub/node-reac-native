import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import {
  Home,
  FileText,
  User,
  Users,
  LayoutDashboard,
} from "lucide-react-native";
import { styled } from "nativewind";

// Import new screens
import { LocationSelectionScreen } from "../screens/booking/LocationSelectionScreen"; // User Home
import { CompanyDashboardScreen } from "../screens/company/CompanyDashboardScreen"; // Owner Home
import { MyTripsScreen } from "../screens/profile/MyTripsScreen"; // New History
import ProfileScreen from "../screens/ProfileScreen";
import PassengersScreen from "../screens/PassengersScreen";

import { RootTabParamList } from "./types";
import { useAuth } from "../context/AuthContext";

const StyledView = styled(View);
const StyledText = styled(Text);

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner' || user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F1F5F9",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#0B4F9C",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        // @ts-ignore - Component type compatibility
        component={CompanyDashboardScreen}
        options={{
          tabBarLabel: isOwner ? "Dashboard" : "Inicio",
          tabBarIcon: ({ color, size }) => (
            isOwner ? <LayoutDashboard color={color} size={size} /> : <Home color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="History"
        component={MyTripsScreen}
        options={{
          tabBarLabel: "Mis Viajes",
          tabBarIcon: ({ color, size }) => (
            <FileText color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Passengers"
        component={PassengersScreen}
        options={{
          tabBarLabel: "Pasajeros",
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
