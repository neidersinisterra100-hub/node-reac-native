import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Text, Avatar, Button, IconButton } from 'react-native-paper';
import { BarChart, LineChart, ProgressChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors'; // Asegúrate de tener esto o usar constantes
import AppContainer from '../components/ui/AppContainer';

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
  const { width } = useWindowDimensions();

  // Datos dummy o reales (podrías conectarlos a un servicio de stats)
  const [stats, setStats] = useState({
    earnings: 628,
    share: 2434,
    likes: 1259,
    rating: 8.5
  });

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(26, 34, 54, ${opacity})`, // Navy
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  };

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => '#1a2236', // Navy
      },
      {
        data: [10, 30, 20, 60, 80, 30],
        color: (opacity = 1) => '#ff6b00', // Orange
      }
    ]
  };

  return (
    <View style={styles.container}>
      {/* Header Personalizado con Curva */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
            <View style={styles.userInfo}>
                <Avatar.Text 
                    size={45} 
                    label={user?.name?.substring(0, 2).toUpperCase() || "JD"} 
                    style={{ backgroundColor: 'white' }} 
                    color="#1a2236" 
                />
                <View style={{ marginLeft: 12 }}>
                    <Text style={styles.userName}>{user?.name?.toUpperCase() || "USUARIO"}</Text>
                    <Text style={styles.userEmail}>{user?.email || "usuario@email.com"}</Text>
                </View>
            </View>
            <View style={styles.headerIcons}>
                <IconButton icon="bell-outline" iconColor="white" size={24} onPress={() => {}} />
            </View>
        </View>
        <Text style={styles.pageTitle}>Dashboard {user?.role === 'owner' ? 'Propietario' : 'Usuario'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Accesos Directos (Navegación) */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
            <TouchableOpacity onPress={() => navigation.navigate("MyCompanies")} style={styles.shortcutBtn}>
                 <MaterialCommunityIcons name="domain" size={24} color="#ff6b00" />
                 <Text style={styles.shortcutText}>Empresas</Text>
            </TouchableOpacity>
            {/* Si quisieras ir directo a rutas de todas las empresas, necesitarías una pantalla especial, 
                pero por ahora redirigimos a empresas que es el flujo correcto */}
            <TouchableOpacity onPress={() => navigation.navigate("MyCompanies")} style={styles.shortcutBtn}>
                 <MaterialCommunityIcons name="routes" size={24} color="#1a2236" />
                 <Text style={styles.shortcutText}>Rutas</Text>
            </TouchableOpacity>
             <TouchableOpacity onPress={() => {}} style={styles.shortcutBtn}>
                 <MaterialCommunityIcons name="ticket-confirmation-outline" size={24} color="#10b981" />
                 <Text style={styles.shortcutText}>Tickets</Text>
            </TouchableOpacity>
        </View>

        {/* Metrics Grid */}
        <View style={styles.grid}>
            <View style={styles.col}>
                <MetricCard title="Ganancias" value={`$ ${stats.earnings}`} icon="currency-usd" iconBackgroundColor="#1a2236" />
                <MetricCard title="Me gusta" value={`${stats.likes}`} icon="thumb-up" iconBackgroundColor="#3b82f6" />
            </View>
            <View style={styles.col}>
                <MetricCard title="Compartidos" value={`${stats.share}`} icon="share-variant" iconBackgroundColor="#8b5cf6" />
                <MetricCard title="Calificación" value={`${stats.rating}`} icon="star" iconBackgroundColor="#f59e0b" />
            </View>
        </View>

        {/* Bar Chart Section */}
        <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Rendimiento Mensual</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                    data={barData}
                    width={screenWidth} 
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={chartConfig}
                    verticalLabelRotation={0}
                    fromZero
                    showValuesOnTopOfBars={false}
                    withInnerLines={true}
                    style={{ paddingRight: 40 }}
                />
            </ScrollView>
        </View>

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
      marginTop: 4,
      color: '#4b5563',
      fontWeight: '500'
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
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },
});
