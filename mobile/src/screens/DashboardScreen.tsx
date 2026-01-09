import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, useWindowDimensions, TouchableOpacity, Alert } from 'react-native';
import { Text, Avatar, Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

// Componente auxiliar para métricas
const MetricCard = ({ title, value, icon, iconBackgroundColor, iconColor = "white" }: any) => (
    <View style={styles.metricCard}>
        <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor || '#f3f4f6' }]}>
            <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
        </View>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
    </View>
);

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const isOwner = user?.role === 'owner' || user?.role === 'admin';

  // Datos dummy o reales
  const [stats, setStats] = useState({
    earnings: 628,
    share: 2434,
    likes: 1259,
    rating: 8.5
  });

  return (
    <View style={styles.container}>
      {/* Header Personalizado con Curva */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
            <View style={styles.userInfo}>
                <Avatar.Text
                    size={45}
                    label={user?.name?.substring(0, 2).toUpperCase() || "CP"}
                    style={{ backgroundColor: 'white' }}
                    color="#1a2236"
                />
                <View style={{ marginLeft: 12 }}>
                    <Text style={styles.userName}>{user?.name?.toUpperCase() || "CAPITÁN"}</Text>
                    <Text style={styles.userEmail}>{user?.email || "capitan@maritimo.com"}</Text>
                </View>
            </View>

            {/* 🔔 ICONOS HEADER */}
            <View style={styles.headerIcons}>
                <IconButton icon="bell-outline" iconColor="white" size={24} onPress={() => {}} />

                {/* 🍔 MENU BUTTON (Abre MenuScreen) */}
                <IconButton
                    icon="dots-vertical"
                    iconColor="white"
                    size={24}
                    onPress={() => navigation.navigate("Menu")}
                />
            </View>
        </View>
        <Text style={styles.pageTitle}>Dashboard {isOwner ? 'Propietario' : 'Usuario'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Accesos Directos (Navegación Condicional - TEMA MARÍTIMO ⚓️) */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
            {isOwner ? (
                <>
                    {/* OWNER */}
                    <TouchableOpacity onPress={() => navigation.navigate("MyCompanies")} style={styles.shortcutBtn}>
                        <MaterialCommunityIcons name="ferry" size={32} color="#ff6b00" />  
                        <Text style={styles.shortcutText}>Empresas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("AllRoutes")} style={styles.shortcutBtn}>
                        <MaterialCommunityIcons name="compass-outline" size={32} color="#1a2236" />
                        <Text style={styles.shortcutText}>Rutas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => Alert.alert("Info", "Selecciona una ruta para ver sus viajes.")} style={styles.shortcutBtn}>
                        <MaterialCommunityIcons name="anchor" size={32} color="#10b981" /> 
                        <Text style={styles.shortcutText}>Viajes</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    {/* USER */}
                    <TouchableOpacity onPress={() => navigation.navigate("AllRoutes")} style={styles.shortcutBtn}>
                        <MaterialCommunityIcons name="compass-outline" size={32} color="#ff6b00" />
                        <Text style={styles.shortcutText}>Rutas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("AllTrips")} style={styles.shortcutBtn}>
                        <MaterialCommunityIcons name="sail-boat" size={32} color="#1a2236" />
                        <Text style={styles.shortcutText}>Viajes</Text>
                    </TouchableOpacity>

                    {/* BOTÓN TICKETS CONECTADO 🎟️ */}
                    <TouchableOpacity onPress={() => navigation.navigate("MyTickets")} style={styles.shortcutBtn}>
                        <MaterialCommunityIcons name="ticket-confirmation" size={32} color="#10b981" />
                        <Text style={styles.shortcutText}>Tickets</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>

        {/* Metrics Grid - Solo visible para Owners/Admins */}
        {isOwner && (
            <View style={styles.grid}>
                <View style={styles.col}>
                    <MetricCard title="Ingresos" value={`$ ${stats.earnings}`} icon="currency-usd" iconBackgroundColor="#1a2236" />
                    <MetricCard title="Pasajeros" value={`${stats.likes}`} icon="account-group" iconBackgroundColor="#3b82f6" />
                </View>
                <View style={styles.col}>
                    <MetricCard title="Zarpes" value={`${stats.share}`} icon="anchor" iconBackgroundColor="#8b5cf6" />
                    <MetricCard title="Valoración" value={`${stats.rating}`} icon="star" iconBackgroundColor="#f59e0b" />
                </View>
            </View>
        )}

         <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1a2236', // Navy
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '300',
    marginLeft: 4,
  },
  scrollContent: {
    padding: 20,
  },
  shortcutBtn: {
      backgroundColor: 'white',
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
      width: '30%',
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 2,
  },
  shortcutText: {
      fontSize: 12,
      marginTop: 8,
      color: '#4b5563',
      fontWeight: '600'
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  col: {
    flex: 1,
    gap: 12,
  },
  metricCard: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 3,
  },
  iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
  },
  metricValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#1f2937',
  },
  metricTitle: {
      fontSize: 12,
      color: '#6b7280',
  },
});
