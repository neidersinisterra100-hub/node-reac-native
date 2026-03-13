import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Tet, TouchableOpacity, useColorScheme } from "react-native";
import {
  Home,
  FileTet,
  User,
  Users,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react-native";
import { styled } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-contet";

// Import new screens
import { CompanyDashboardScreen } from "../screens/company/CompanyDashboardScreen"; // Owner Home
import { MyTripsScreen } from "../screens/profile/MyTripsScreen"; // New History
import ProfileScreen from "../screens/ProfileScreen";
import PassengersScreen from "../screens/PassengersScreen";
import AdminChatListScreen from "../screens/AdminChatListScreen";

import { RootTabParamList } from "./types";
import { useAuth } from "../contet/AuthContet";
import { useNavigation } from "@react-navigation/native";

const StyledView = styled(View);
const StyledTet = styled(Tet);

const Tab = createBottomTabNavigator<RootTabParamList>();

eport default function TabNavigator() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isOwner = user?.role === "owner" || user?.role === "admin" || user?.role === "super_owner";
  const isUser = user?.role === "user";
  const isDark = useColorScheme() === "dark";

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#f172a" : "#FFFFFF",
          borderTopColor: isDark ? "#1e293b" : "#F1F5F9",
          borderTopWidth: 1,
          height: 6 + insets.bottom,
          paddingBottom: Math.ma(insets.bottom, 8),
          paddingTop: 8,
          elevation: 1,
          shadowColor: "#",
          shadowOffset: { width: , height: -2 },
          shadowOpacity: isDark ? .4 : .1,
          shadowRadius: 4,
        },
        tabBarItemStyle: {
          fleDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: isDark ? "#38bdf8" : "#B4F9C",
        tabBarInactiveTintColor: isDark ? "#64748b" : "#94A3B8",
        tabBarLabelStyle: {
          fontSize: 1,
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
            <FileTet color={color} size={size} />
          ),
        }}
      />

      {/* Admin/Owner specific tabs */}
      {isOwner ? (
        <>
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
            name="AdminChat"
            // @ts-ignore - Component type compatibility
            component={AdminChatListScreen}
            options={{
              tabBarLabel: "Chat",
              tabBarIcon: ({ color, size }) => (
                <MessageCircle color={color} size={size} />
              ),
            }}
          />
        </>
      ) : (
        <Tab.Screen
          name="Passengers"
          component={PassengersScreen}
          options={{
            tabBarLabel: "Soporte",
            tabBarIcon: ({ color, size }) => (
              <MessageCircle color={color} size={size} />
            ),
            tabBarButton: (props) => (
              <TouchableOpacity
                {...(props as any)}
                onPress={() => navigation.navigate("SupportChat")}
              />
            ),
          }}
        />
      )}

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
