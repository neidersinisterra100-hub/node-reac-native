import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

const Stack =
  createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}


// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { useFocusEffect } from "@react-navigation/native";
// import { useCallback } from "react";

// import ProfileScreen from "../screens/ProfileScreen";
// import SettingsScreen from "../screens/SettingsScreen";

// export type ProfileStackParamList = {
//   ProfileMain: undefined;
//   SettingsModal: undefined;
// };

// const Stack =
//   createNativeStackNavigator<ProfileStackParamList>();

// export default function ProfileStack() {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen
//         name="ProfileMain"
//         component={ProfileMainWrapper}
//         options={{ headerShown: false }}
//       />

//       <Stack.Screen
//         name="SettingsModal"
//         component={SettingsScreen}
//         options={{
//           presentation: "modal",
//           headerShown: false,
//           animation: "slide_from_bottom",
//         }}
//       />
//     </Stack.Navigator>
//   );
// }

// /**
//  * Wrapper que CIERRA modales
//  * cuando el tab Profile pierde foco
//  */
// function ProfileMainWrapper({ navigation }: any) {
//   useFocusEffect(
//     useCallback(() => {
//       return () => {
//         // 🔥 CIERRA SettingsModal si estaba abierto
//         navigation.popToTop();
//       };
//     }, [navigation])
//   );

//   return <ProfileScreen />;
// }
