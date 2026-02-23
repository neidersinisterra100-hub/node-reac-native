import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, Modal, FlatList, ActivityIndicator } from "react-native";
import { Text, Avatar, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { styled } from "nativewind";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLocation } from "../context/LocationContext";
import { getAllMunicipios, Municipio } from "../services/municipio.service";
import { getAllCities, City } from "../services/city.service";

const StyledView = styled(View);
const StyledText = styled(Text);

export default function MenuScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { selectedMunicipio, selectedCity, selectMunicipio, selectCity } = useLocation();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [viewMode, setViewMode] = useState<'municipio' | 'city'>('municipio');

  const isOwner = user?.role === "owner" || user?.role === "admin";

  const loadLocations = async () => {
    setLocationsLoading(true);
    try {
      const [muns, cts] = await Promise.all([
        getAllMunicipios(true),
        getAllCities()
      ]);
      setMunicipios(muns);
      setCities(cts);
    } catch (e) {
      console.error(e);
    } finally {
      setLocationsLoading(false);
    }
  };

  const menuItems = [
    {
      icon: "account-circle-outline",
      label: "Mi Perfil",
      onPress: () => navigation.navigate("Profile"),
      show: true,
    },
    {
      icon: "weather-pouring",
      label: "Clima y Mareas",
      onPress: () => navigation.navigate("WeatherMarine"),
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
        {/* Ubicación Actual Button */}
        <TouchableOpacity
          className="flex-row items-center bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl mb-4 border border-emerald-100 dark:border-emerald-800/20"
          onPress={() => {
            loadLocations();
            setViewMode('municipio');
            setShowLocationModal(true);
          }}
        >
          <StyledView className="w-10 h-10 rounded-xl bg-emerald-500/10 justify-center items-center mr-4">
            <MaterialCommunityIcons name="map-marker" size={24} color="#10b981" />
          </StyledView>
          <StyledView className="flex-1">
            <StyledText className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Ubicación Actual</StyledText>
            <StyledText className="text-base font-bold text-slate-800 dark:text-white">
              {selectedMunicipio?.name || "Seleccionar"}{selectedCity ? ` - ${selectedCity.name}` : ''}
            </StyledText>
          </StyledView>
          <MaterialCommunityIcons name="pencil-outline" size={20} color="#10b981" />
        </TouchableOpacity>

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

      {/* ================= LOCATION MODAL ================= */}
      <Modal visible={showLocationModal} animationType="slide" transparent={true} onRequestClose={() => setShowLocationModal(false)}>
        <StyledView className="flex-1 bg-black/60 justify-end">
          <StyledView className="bg-white dark:bg-dark-surface rounded-t-[40px] p-6 h-3/4 shadow-2xl">
            <StyledView className="flex-row justify-between items-center mb-6">
              <StyledText className="text-2xl font-black text-nautic-navy dark:text-white">
                {viewMode === 'municipio' ? 'Seleccionar Municipio' : 'Seleccionar Ciudad'}
              </StyledText>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#94a3b8" />
              </TouchableOpacity>
            </StyledView>

            {locationsLoading ? (
              <StyledView className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#10b981" />
              </StyledView>
            ) : (
              <FlatList
                data={(viewMode === 'municipio'
                  ? municipios
                  : cities.filter(c => (typeof c.municipio === 'object' ? (c.municipio as any)._id : c.municipio) === selectedMunicipio?._id)) as any}
                keyExtractor={(item: any) => item._id}
                renderItem={({ item }: { item: any }) => (
                  <TouchableOpacity
                    className="flex-row items-center p-4 mb-2 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border/20"
                    onPress={async () => {
                      if (viewMode === 'municipio') {
                        await selectMunicipio(item);
                        setViewMode('city');
                      } else {
                        await selectCity(item);
                        setShowLocationModal(false);
                      }
                    }}
                  >
                    <MaterialCommunityIcons name="map-marker-outline" size={24} color="#10b981" />
                    <StyledText className="ml-3 text-base font-bold text-slate-700 dark:text-white">{item.name}</StyledText>
                  </TouchableOpacity>
                )}
              />
            )}
          </StyledView>
        </StyledView>
      </Modal>
    </StyledView>
  );
}
