import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import TermsScreen from "../screens/TermsScreen";
import TabNavigator from "./TabNavigator";
import { RootStackParamList } from "./types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./navigationRef";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";

// New Booking Flow
import { LocationSelectionScreen } from "../screens/booking/LocationSelectionScreen";
import { AvailableTripsScreen } from "../screens/booking/AvailableTripsScreen";
import { TripDetailScreen } from "../screens/booking/TripDetailScreen";
import { RouteDetailScreen } from "../screens/booking/RouteDetailScreen";
import { SeatSelectionScreen } from "../screens/booking/SeatSelectionScreen";
import { PaymentScreen } from "../screens/booking/PaymentScreen";
import { TicketScreen } from "../screens/booking/TicketScreen";
import { MyTripsScreen } from "../screens/profile/MyTripsScreen";
import { CompanyDashboardScreen } from "../screens/company/CompanyDashboardScreen";
import { CompanyAdminsScreen } from "../screens/company/CompanyAdminsScreen";
import AuditScreen from "../screens/company/AuditScreen";

// Legacy / Existing screens
import CreateCompanyScreen from "../screens/CreateCompanyScreen";
import MyCompaniesScreen from "../screens/MyCompaniesScreen";
import { CompanyRoutesScreen } from "../screens/CompanyRoutesScreen";
import CompanyLegalInfoScreen from "../screens/CompanyLegalInfoScreen";
import CreateTripScreen from "../screens/CreateTripScreen";
import CreateRouteScreen from "../screens/CreateRouteScreen";
import TripsScreen from "../screens/TripsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MenuScreen from "../screens/MenuScreen";
import BalanceScreen from "../screens/BalanceScreen";
import ValidateTicketScreen from "../screens/ValidateTicketScreen";
import ReportsScreen from "../screens/ReportsScreen";
import CalendarScreen from "../screens/CalendarScreen";
import SettingsScreen from "./PrivateStack/SettingsScreen";
import ConfirmTicketModal from "./PrivateStack/ConfirmTicketModal";
import TicketReceiptModal from "./PrivateStack/TicketReceiptModal";
import PassengersScreen from "../screens/PassengersScreen";
import TerrestreRideScreen from "../screens/terrestre/TerrestreRideScreen";
import AllRoutesScreen from "../screens/AllRoutesScreen";
import ManageLocationsScreen from "../screens/ManageLocationsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ animation: "slide_from_right" }}
            />
          </>
        ) : (
          <>
            {/* Dashboard / Tabs */}
            <Stack.Screen name="Tabs" component={TabNavigator} />

            {/* 🆕 Booking Flow */}
            <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
            <Stack.Screen name="AllTrips" component={AvailableTripsScreen} />
            <Stack.Screen name="TripDetails" component={TripDetailScreen} />
            <Stack.Screen name="RouteDetails" component={RouteDetailScreen} />
            <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="Ticket" component={TicketScreen} />

            {/* 🏢 Company Flow */}
            <Stack.Screen name="CompanyDashboard" component={CompanyDashboardScreen} />
            <Stack.Screen name="CompanyAdmins" component={CompanyAdminsScreen} />
            <Stack.Screen name="Audit" component={AuditScreen} />
            <Stack.Screen name="CreateCompany" component={CreateCompanyScreen} />
            <Stack.Screen name="ManageLocations" component={ManageLocationsScreen} />
            <Stack.Screen name="MyCompanies" component={MyCompaniesScreen} />
            <Stack.Screen name="CompanyRoutes" component={CompanyRoutesScreen} />
            <Stack.Screen name="Trips" component={TripsScreen} />
            <Stack.Screen name="CompanyLegalInfo" component={CompanyLegalInfoScreen} options={{ presentation: "modal" }} />
            <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
            <Stack.Screen name="CreateRoute" component={CreateRouteScreen} />
            <Stack.Screen name="AllRoutes" component={AllRoutesScreen} />

            {/* User / Settings */}
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
            <Stack.Screen name="MyTickets" component={MyTripsScreen} />
            <Stack.Screen name="ValidateTicket" component={ValidateTicketScreen} />
            <Stack.Screen name="TerrestreRide" component={TerrestreRideScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />



            {/* Modals */}
            <Stack.Screen
              name="SettingsModal"
              component={SettingsScreen}
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="ConfirmTicketModal"
              component={ConfirmTicketModal}
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="TicketReceiptModal"
              component={TicketReceiptModal}
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
          </>
        )}
        <Stack.Screen
          name="Terms"
          component={TermsScreen}
          options={{ presentation: "modal" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
