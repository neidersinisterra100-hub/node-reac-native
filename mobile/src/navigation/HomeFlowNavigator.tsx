import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeFlowParamList } from "./types";
import ModularHomeScreen from "../screens/home/ModularHomeScreen";
import { LocationSelectionScreen } from "../screens/booking/LocationSelectionScreen";
import { AvailableTripsScreen } from "../screens/booking/AvailableTripsScreen";
import { TripDetailScreen } from "../screens/booking/TripDetailScreen";
import { SeatSelectionScreen } from "../screens/booking/SeatSelectionScreen";
import { PaymentScreen } from "../screens/booking/PaymentScreen";

const Stack = createNativeStackNavigator<HomeFlowParamList>();

export default function HomeFlowNavigator() {
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ModularHome" component={ModularHomeScreen} />
      <Stack.Screen name="TerrestrialFlowStack" component={LocationSelectionScreen} />
      <Stack.Screen name="FluvialFlowStack" component={ModularHomeScreen} />
      <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
      <Stack.Screen name="AllTrips" component={AvailableTripsScreen} />
      <Stack.Screen name="TripDetails" component={TripDetailScreen} />
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}
