import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

import HomeScreen from "./publicStack/HomeScreen";
import DashboardScreen from "../screens/DashboardScreen";
import MyCompaniesScreen from "../screens/MyCompaniesScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileStack from "./ProfileStack";

import { colors } from "../theme/colors";
import { RootTabParamList } from "./types";
import { useAuth } from "../context/AuthContext";
import PassengersScreen from "../screens/PassengersScreen";

const Tab = createBottomTabNavigator<RootTabParamList>();

const HomeWrapper = () => {
  const { user } = useAuth();
  return user ? <DashboardScreen /> : <HomeScreen />;
};

export default function TabNavigator() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;
          switch (route.name) {
            case "Home":
              iconName = user ? "view-dashboard" : "home-outline";
              break;
            case "History":
              iconName = "history";
              break;
            case "Passengers":
              iconName = "account-group-outline";
              break;
            case "Profile":
              iconName = "account-outline";
              break;
            default:
              iconName = "circle";
          }
          return (
            <MaterialCommunityIcons
              name={iconName}
              color={color}
              size={size}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeWrapper}
        options={{ title: user ? "Dashboard" : "Inicio" }}
      />

      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: "Historial" }}
        listeners={{
          tabPress: (e) => {
            if (!user) {
              e.preventDefault();
              navigation.navigate("Login");
            }
          },
        }}
      />

      <Tab.Screen
        name="Passengers"
        component={PassengersScreen}
        options={{ title: "Pasajeros" }}
        listeners={{
          tabPress: (e) => {
            if (!user) {
              e.preventDefault();
              navigation.navigate("Login");
            }
          },
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ title: "Perfil" }}
        listeners={{
          tabPress: (e) => {
            if (!user) {
              e.preventDefault();
              navigation.navigate("Login");
            }
          },
        }}
      />
    </Tab.Navigator>
  );
}
