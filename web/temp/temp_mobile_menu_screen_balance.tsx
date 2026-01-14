import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Avatar, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

export default function MenuScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const isOwner = user?.role === 'owner' || user?.role === 'admin';

  const menuItems = [
    { 
        icon: "account-circle-outline", 
        label: "Mi Perfil", 
        onPress: () => navigation.navigate("Profile") 
    },
    // Solo mostrar Balance a Owners/Admins (opcional, pero lógico)
    ...(isOwner ? [{
        icon: "chart-bar", 
        label: "Balance y Estadísticas", 
        onPress: () => navigation.navigate("Balance") 
    }] : []),
    { 
        icon: "history", 
        label: "Historial de Viajes", 
        onPress: () => navigation.navigate("History") 
    },
    { 
        icon: "theme-light-dark", 
        label: "Cambiar Tema", 
        onPress: () => alert("Próximamente") 
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header del Menú */}
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
             <Avatar.Text 
                size={64} 
                label={user?.name?.substring(0, 2).toUpperCase() || "US"} 
                style={{ backgroundColor: 'white' }} 
                color={colors.primary}
            />
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
      </View>

      {/* Lista de Opciones */}
      <View style={styles.content}>
          {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                  <View style={styles.iconBox}>
                    <MaterialCommunityIcons name={item.icon as any} size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>
          ))}

          <Divider style={{ marginVertical: 20 }} />

          <TouchableOpacity style={styles.menuItem} onPress={logout}>
              <View style={[styles.iconBox, { backgroundColor: '#fee2e2' }]}>
                <MaterialCommunityIcons name="logout" size={24} color={colors.error} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.error }]}>Cerrar Sesión</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
      backgroundColor: colors.primary,
      paddingTop: 60,
      paddingBottom: 40,
      paddingHorizontal: 20,
      borderBottomRightRadius: 40,
  },
  closeButton: {
      alignSelf: 'flex-end',
      marginBottom: 20,
  },
  userInfo: {
      alignItems: 'center',
  },
  userName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: 'white',
      marginTop: 12,
  },
  userEmail: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
  },
  content: {
      padding: 20,
      marginTop: 20,
  },
  menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
  },
  iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: '#f1f5f9',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
  },
  menuLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#334155',
      flex: 1,
  }
});
