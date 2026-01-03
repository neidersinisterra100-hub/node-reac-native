import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileStack from "./ProfileStack";

import { colors } from "../theme/colors";
import { RootTabParamList } from "./types";
import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator<RootTabParamList>();

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
              iconName = "home-outline";
              break;
            case "History":
              iconName = "history";
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
      {/* 🌍 HOME – PÚBLICO */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Inicio" }}
      />

      {/* 🔒 HISTORY – REQUIERE LOGIN */}
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

      {/* 🔒 PROFILE – REQUIERE LOGIN */}
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
