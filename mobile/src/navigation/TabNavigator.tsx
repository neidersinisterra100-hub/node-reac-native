import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, useColorScheme } from "react-native";
import {
  Home,
  FileText,
  User,
  Users,
  LayoutDashboard,
} from "lucide-react-native";
import { styled } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import new screens
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
  const insets = useSafeAreaInsets();
  const isOwner = user?.role === 'owner' || user?.role === 'admin' || user?.role === 'super_owner';
  const isDark = useColorScheme() === "dark";

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#0f172a" : "#FFFFFF", // dark-surface/slate-900 o similar
          borderTopColor: isDark ? "#1e293b" : "#F1F5F9",
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.4 : 0.1,
          shadowRadius: 4,
        },
        tabBarItemStyle: {
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: isDark ? "#38bdf8" : "#0B4F9C",
        tabBarInactiveTintColor: isDark ? "#64748b" : "#94A3B8",
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
          tabBarLabel: "Mis Tickets",
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
