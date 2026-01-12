import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppContainer from '../components/ui/AppContainer';
import AppHeader from '../components/ui/AppHeader';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../theme/colors';

const screenWidth = Dimensions.get("window").width;

// Mock Data para Reportes
const MOCK_REPORTS = {
  totalSales: 4500000,
  totalTickets: 124,
  occupancy: 85,
  monthlySales: [
    { label: 'Ene', value: 1200000 },
    { label: 'Feb', value: 1900000 },
    { label: 'Mar', value: 1500000 },
    { label: 'Abr', value: 2200000 },
    { label: 'May', value: 2800000 },
    { label: 'Jun', value: 4500000 },
  ],
  topRoute: "Buenaventura - Juanchaco"
};

export default function ReportsScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simular carga de datos
    setLoading(true);
    setTimeout(() => {
        setData(MOCK_REPORTS);
        setLoading(false);
    }, 1000);
  }, []);

  const styles = getStyles(theme);

  // Componente de Tarjeta de Métrica (KPI)
  const MetricCard = ({ title, value, icon, color, gradient }: any) => (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.metricCard}
      >
          <View style={styles.metricIconContainer}>
              <MaterialCommunityIcons name={icon} size={24} color="white" />
          </View>
          <View>
              <Text style={styles.metricValue}>{value}</Text>
              <Text style={styles.metricTitle}>{title}</Text>
          </View>
      </LinearGradient>
  );

  // Componente de Gráfico de Barras Simple
  const BarChart = ({ data }: { data: any[] }) => {
      const maxValue = Math.max(...data.map(d => d.value));
      return (
          <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Ventas Mensuales</Text>
              <View style={styles.barsContainer}>
                  {data.map((item, index) => {
                      const height = (item.value / maxValue) * 100; // Porcentaje de altura
                      return (
                          <View key={index} style={styles.barWrapper}>
                              <View style={[styles.bar, { height: `${height}%` }]} />
                              <Text style={styles.barLabel}>{item.label}</Text>
                          </View>
                      );
                  })}
              </View>
          </View>
      );
  };

  return (
    <AppContainer>
      <AppHeader title="Reportes" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {loading ? (
             <Text style={{ textAlign: 'center', marginTop: 20 }}>Cargando reportes...</Text>
        ) : (
            <>
                {/* KPI CARDS */}
                <View style={styles.kpiContainer}>
                    <MetricCard 
                        title="Ventas Totales" 
                        value={`$ ${(data?.totalSales || 0).toLocaleString()}`} 
                        icon="currency-usd" 
                        gradient={['#3b82f6', '#2563eb']}
                    />
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <MetricCard 
                                title="Tickets" 
                                value={data?.totalTickets} 
                                icon="ticket-confirmation" 
                                gradient={['#10b981', '#059669']}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <MetricCard 
                                title="Ocupación" 
                                value={`${data?.occupancy}%`} 
                                icon="account-group" 
                                gradient={['#f59e0b', '#d97706']}
                            />
                        </View>
                    </View>
                </View>

                {/* CHARTS SECTION */}
                <BarChart data={data?.monthlySales || []} />

                {/* ADDITIONAL INFO */}
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <MaterialCommunityIcons name="trophy" size={24} color="#f59e0b" />
                        <Text style={styles.infoTitle}>Ruta Más Popular</Text>
                    </View>
                    <Text style={styles.infoValue}>{data?.topRoute}</Text>
                </View>

                 <View style={{ height: 40 }} />
            </>
        )}

      </ScrollView>
    </AppContainer>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  content: {
    padding: 16,
  },
  kpiContainer: {
      marginBottom: 24,
  },
  row: {
      flexDirection: 'row',
      marginTop: 16,
  },
  metricCard: {
      borderRadius: 20,
      padding: 20,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
  },
  metricIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
  },
  metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
  },
  metricTitle: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '500',
  },
  // Chart Styles
  chartContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
  },
  chartTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 20,
  },
  barsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 150,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
  },
  barWrapper: {
      alignItems: 'center',
      width: 30,
      height: '100%',
      justifyContent: 'flex-end',
  },
  bar: {
      width: 12,
      backgroundColor: colors.primary,
      borderRadius: 6,
      marginBottom: 8,
  },
  barLabel: {
      fontSize: 10,
      color: theme.colors.textSecondary,
  },
  // Info Card
  infoCard: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      elevation: 2,
  },
  infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
  },
  infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#4b5563',
  },
  infoValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1f2937',
      paddingLeft: 36, // Align with text
  }
});
