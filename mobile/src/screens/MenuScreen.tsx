import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text, Avatar, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { styled } from "nativewind";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const StyledView = styled(View);
const StyledText = styled(Text);

export default function MenuScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  const isOwner = user?.role === "owner" || user?.role === "admin";

  const menuItems = [
    {
      icon: "account-circle-outline",
      label: "Mi Perfil",
      onPress: () => navigation.navigate("Profile"),
      show: true,
    },
    {
      icon: "calendar-month",
      label: "Calendario",
      onPress: () => navigation.navigate("Calendar"),
      show: isOwner,
    },
    {
      icon: "chart-bar",
      label: "Reportes",
      onPress: () => navigation.navigate("Reports"),
      show: isOwner,
    },
    {
      icon: "qrcode-scan",
      label: "Validar Ticket",
      onPress: () => navigation.navigate("ValidateTicket"),
      show: isOwner,
    },
    {
      icon: "map-marker-multiple",
      label: "Gestionar Lugares",
      onPress: () => navigation.navigate("ManageLocations"),
      show: isOwner,
    },
    {
      icon: "ticket-percent-outline",
      label: "Mis Tickets",
      onPress: () => navigation.navigate("Tabs", { screen: "History" }),
      show: true,
    },
    {
      icon: "file-document-outline",
      label: "Términos y Condiciones",
      onPress: () => navigation.navigate("Terms"),
      show: true,
    },
    {
      icon: "clipboard-list-outline",
      label: "Auditoría",
      onPress: () => navigation.navigate("Audit"),
      show: isOwner,
    },
    {
      icon: isDark ? "weather-sunny" : "weather-night",
      label: isDark ? "Modo Claro" : "Modo Oscuro",
      onPress: toggleTheme,
      show: true,
    },
  ];

  return (
    <StyledView className="flex-1 bg-nautic-bg dark:bg-dark-bg">
      {/* ================= HEADER ================= */}
      <StyledView className="bg-nautic-primary dark:bg-dark-surface pt-[60px] pb-10 px-5 rounded-br-[40px]">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="self-end mb-5"
        >
          <MaterialCommunityIcons name="close" size={28} color="white" />
        </TouchableOpacity>

        <StyledView className="items-center">
          <Avatar.Text
            size={64}
            label={user?.name?.substring(0, 2).toUpperCase() || "US"}
            style={{ backgroundColor: "white" }}
            color="#0B4F9C"
          />

          <StyledText className="text-[22px] font-bold text-white mt-3">
            {user?.name}
          </StyledText>

          <StyledText className="text-sm text-white/80">
            {user?.email}
          </StyledText>
        </StyledView>
      </StyledView>

      {/* ================= MENU ================= */}
      <ScrollView className="p-5 pt-[30px]">
        {menuItems
          .filter((item) => item.show)
          .map((item, index) => (
            <TouchableOpacity
              key={index}
              className="
                flex-row items-center
                bg-white dark:bg-dark-surface
                p-4 rounded-2xl mb-3
                border border-gray-200 dark:border-dark-border
              "
              onPress={item.onPress}
            >
              <StyledView
                className="
                  w-10 h-10 rounded-xl
                  bg-nautic-secondary dark:bg-dark-bg
                  justify-center items-center mr-4
                "
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={24}
                  color="#0B4F9C"
                />
              </StyledView>

              <StyledText className="text-base font-semibold flex-1 text-slate-700 dark:text-dark-text">
                {item.label}
              </StyledText>

              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#94a3b8"
              />
            </TouchableOpacity>
          ))}

        <Divider className="my-5" />

        {/* ================= LOGOUT ================= */}
        <TouchableOpacity
          className="
            flex-row items-center
            bg-white dark:bg-dark-surface
            p-4 rounded-2xl
            border border-gray-200 dark:border-dark-border
          "
          onPress={logout}
        >
          <StyledView className="w-10 h-10 rounded-xl bg-red-50 justify-center items-center mr-4">
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color="#ef4444"
            />
          </StyledView>

          <StyledText className="text-base font-semibold flex-1 text-red-500">
            Cerrar Sesión
          </StyledText>
        </TouchableOpacity>

        <StyledView className="h-10" />
      </ScrollView>
    </StyledView>
  );
}



// import React from "react";
// import { View, TouchableOpacity, ScrollView } from "react-native";
// import { Text, Avatar, Divider } from "react-native-paper";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import { styled } from 'nativewind';

// import { useAuth } from "../context/AuthContext";
// import { useTheme } from "../context/ThemeContext";

// const StyledView = styled(View);
// const StyledText = styled(Text);

// export default function MenuScreen() {
//     const navigation = useNavigation<any>();
//     const { user, logout } = useAuth();
//     const { toggleTheme, isDark, theme } = useTheme();

//     const isOwner = user?.role === 'owner' || user?.role === 'admin';

//     const menuItems = [
//         {
//             icon: "account-circle-outline",
//             label: "Mi Perfil",
//             onPress: () => navigation.navigate("Profile"),
//             show: true
//         },
//         {
//             icon: "calendar-month",
//             label: "Calendario",
//             onPress: () => navigation.navigate("Calendar"),
//             show: isOwner
//         },
//         {
//             icon: "chart-bar",
//             label: "Reportes",
//             onPress: () => navigation.navigate("Reports"),
//             show: isOwner
//         },
//         {
//             icon: "qrcode-scan",
//             label: "Validar Ticket",
//             onPress: () => navigation.navigate("ValidateTicket"),
//             show: isOwner
//         },
//         {
//             icon: "map-marker-multiple",
//             label: "Gestionar Lugares",
//             onPress: () => navigation.navigate("ManageLocations"),
//             show: isOwner
//         },
//         {
//             icon: "history",
//             label: "Historial de Viajes",
//             onPress: () => navigation.navigate("History"),
//             show: true
//         },
//         {
//             icon: "file-document-outline",
//             label: "Términos y Condiciones",
//             onPress: () => navigation.navigate("Terms"),
//             show: true
//         },
//         {
//             icon: isDark ? "weather-sunny" : "weather-night",
//             label: isDark ? "Modo Claro" : "Modo Oscuro",
//             onPress: () => {
//                 console.log("Toggling theme...");
//                 toggleTheme();
//             },
//             show: true
//         },
//     ];

//     return (
//         <StyledView className={`flex-1 ${isDark ? 'bg-dark-bg' : 'bg-nautic-bg'}`}>
//             {/* Header del Menú */}
//             <StyledView className={`${isDark ? 'bg-dark-surface' : 'bg-nautic-primary'} pt-[60px] pb-10 px-5 rounded-br-[40px]`}>
//                 <TouchableOpacity
//                     onPress={() => navigation.goBack()}
//                     className="self-end mb-5"
//                 >
//                     <MaterialCommunityIcons name="close" size={28} color="white" />
//                 </TouchableOpacity>
//                 <StyledView className="items-center">
//                     <Avatar.Text
//                         size={64}
//                         label={user?.name?.substring(0, 2).toUpperCase() || "US"}
//                         style={{ backgroundColor: 'white' }}
//                         color={isDark ? "#00B4D8" : "#0B4F9C"}
//                     />
//                     <StyledText className="text-[22px] font-bold text-white mt-3">
//                         {user?.name}
//                     </StyledText>
//                     <StyledText className="text-sm text-white/80">
//                         {user?.email}
//                     </StyledText>
//                 </StyledView>
//             </StyledView>

//             {/* Lista de Opciones */}
//             <ScrollView className="p-5 pt-[30px]">
//                 {menuItems.filter(item => item.show).map((item, index) => (
//                     <TouchableOpacity
//                         key={index}
//                         className={`flex-row items-center ${isDark ? 'bg-dark-surface' : 'bg-white'} p-4 rounded-2xl mb-3 shadow-sm elevation-2`}
//                         onPress={item.onPress}
//                     >
//                         <StyledView className={`w-10 h-10 rounded-xl ${isDark ? 'bg-dark-bg' : 'bg-nautic-secondary'} justify-center items-center mr-4`}>
//                             <MaterialCommunityIcons
//                                 name={item.icon as any}
//                                 size={24}
//                                 color={isDark ? "#00B4D8" : "#0B4F9C"}
//                             />
//                         </StyledView>
//                         <StyledText className={`text-base font-semibold flex-1 ${isDark ? 'text-dark-text' : 'text-slate-700'}`}>
//                             {item.label}
//                         </StyledText>
//                         <MaterialCommunityIcons
//                             name="chevron-right"
//                             size={24}
//                             color={isDark ? "#64748b" : "#cbd5e1"}
//                         />
//                     </TouchableOpacity>
//                 ))}

//                 <Divider className="my-5" />

//                 <TouchableOpacity
//                     className={`flex-row items-center ${isDark ? 'bg-dark-surface' : 'bg-white'} p-4 rounded-2xl shadow-sm elevation-2`}
//                     onPress={logout}
//                 >
//                     <StyledView className="w-10 h-10 rounded-xl bg-red-50 justify-center items-center mr-4">
//                         <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
//                     </StyledView>
//                     <StyledText className="text-base font-semibold flex-1 text-red-500">
//                         Cerrar Sesión
//                     </StyledText>
//                 </TouchableOpacity>

//                 <StyledView className="h-10" />
//             </ScrollView>
//         </StyledView>
//     );
// }
