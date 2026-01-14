import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Avatar, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <AppContainer>
      <AppHeader title="Mi Perfil" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerProfile}>
            <Avatar.Text 
                size={80} 
                label={user?.name?.substring(0, 2).toUpperCase() || "US"} 
                style={{ backgroundColor: colors.primary }} 
                color="white"
            />
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.role}>{user?.role === 'owner' ? 'Propietario' : 'Usuario'}</Text>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            <View style={styles.infoRow}>
                <MaterialCommunityIcons name="email-outline" size={24} color={colors.textSecondary} />
                <View style={styles.infoTextContainer}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user?.email}</Text>
                </View>
            </View>

            <Divider style={{ marginVertical: 12 }} />

            <View style={styles.infoRow}>
                <MaterialCommunityIcons name="shield-account-outline" size={24} color={colors.textSecondary} />
                <View style={styles.infoTextContainer}>
                    <Text style={styles.label}>Rol</Text>
                    <Text style={styles.value}>{user?.role}</Text>
                </View>
            </View>
        </View>

        <View style={styles.logoutContainer}>
            <PrimaryButton 
                label="Cerrar Sesión" 
                onPress={logout} 
                variant="danger"
            />
        </View>
      </ScrollView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  headerProfile: {
      alignItems: 'center',
      marginBottom: 32,
  },
  name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 16,
  },
  role: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
  },
  section: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 16,
  },
  infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
  },
  infoTextContainer: {
      flex: 1,
  },
  label: {
      fontSize: 12,
      color: colors.textSecondary,
  },
  value: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: '500',
  },
  logoutContainer: {
      marginTop: 32,
  }
});
