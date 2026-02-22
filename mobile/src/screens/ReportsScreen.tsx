import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'lucide-react-native';

import AppContainer from '../components/ui/AppContainer';
import AppHeader from '../components/ui/AppHeader';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../theme/colors';
import { getSalesReport, getOccupancyReport, SalesReport, OccupancyReport } from '../services/report.service';
import { DetailSkeleton } from '../components/ui/Skeletons';

const screenWidth = Dimensions.get("window").width;

// Helper to format date for API
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

export default function ReportsScreen() {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [salesData, setSalesData] = useState<SalesReport[]>([]);
    const [occupancyData, setOccupancyData] = useState<OccupancyReport[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({
        from: formatDate(new Date(new Date().setDate(new Date().getDate() - 30))), // Last 30 days
        to: formatDate(new Date())
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Load sales data
            try {
                const sales = await getSalesReport(dateRange.from, dateRange.to);
                setSalesData(sales);
            } catch (err) {
                console.error("Error loading sales report:", err);
                setError("Error al cargar ventas");
            }

            // Load occupancy data
            try {
                const occupancy = await getOccupancyReport();
                setOccupancyData(occupancy);
            } catch (err) {
                console.error("Error loading occupancy report:", err);
                if (!error) setError("Error al cargar ocupación");
            }
        } catch (err) {
            console.error("Critical error in reports:", err);
            setError("Error al cargar reportes");
        } finally {
            setLoading(false);
        }
    }, [dateRange.from, dateRange.to]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const styles = getStyles(theme);

    // Calculate metrics from real data
    const totalSales = salesData.reduce((acc, curr) => acc + curr.totalSales, 0);
    const totalTickets = salesData.reduce((acc, curr) => acc + curr.ticketsCount, 0);
    const avgOccupancy = occupancyData.length
        ? Math.round(occupancyData.reduce((acc, curr) => acc + curr.occupancyRate, 0) / occupancyData.length)
        : 0;

    // Prepare chart data
    const chartData = salesData.map(d => ({
        label: new Date(d._id).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        value: d.totalSales
    }));

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

                {/* Date Range Selector */}
                <View style={styles.dateRangeContainer}>
                    <Text style={styles.dateRangeLabel}>Rango de Fechas</Text>
                    <View style={styles.dateInputsRow}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <TextInput
                                mode="outlined"
                                value={dateRange.from}
                                onChangeText={(text) => setDateRange({ ...dateRange, from: text })}
                                placeholder="Desde"
                                dense
                                style={styles.dateInput}
                                left={<TextInput.Icon icon={() => <Calendar size={16} color="#64748B" />} />}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <TextInput
                                mode="outlined"
                                value={dateRange.to}
                                onChangeText={(text) => setDateRange({ ...dateRange, to: text })}
                                placeholder="Hasta"
                                dense
                                style={styles.dateInput}
                                left={<TextInput.Icon icon={() => <Calendar size={16} color="#64748B" />} />}
                            />
                        </View>
                    </View>
                </View>

                {error && (
                    <View style={styles.errorContainer}>
                        <MaterialCommunityIcons name="alert-circle" size={20} color="#ef4444" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {loading ? (
                    <DetailSkeleton />
                ) : (
                    <>
                        {/* Show empty state if no data */}
                        {salesData.length === 0 && occupancyData.length === 0 ? (
                            <View style={styles.emptyStateContainer}>
                                <MaterialCommunityIcons name="chart-box-outline" size={64} color="#d1d5db" />
                                <Text style={styles.emptyStateTitle}>No hay datos disponibles</Text>
                                <Text style={styles.emptyStateText}>
                                    No se encontraron reportes para el rango de fechas seleccionado.
                                </Text>
                                <Text style={styles.emptyStateHint}>
                                    Intenta ajustar el rango de fechas o verifica que haya viajes registrados.
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* KPI CARDS */}
                                {salesData.length > 0 && (
                                    <View style={styles.kpiContainer}>
                                        <MetricCard
                                            title="Ventas Totales"
                                            value={`$ ${totalSales.toLocaleString('es-CO')}`}
                                            icon="currency-usd"
                                            gradient={['#3b82f6', '#2563eb']}
                                        />
                                        <View style={styles.row}>
                                            <View style={{ flex: 1, marginRight: 8 }}>
                                                <MetricCard
                                                    title="Tickets"
                                                    value={totalTickets}
                                                    icon="ticket-confirmation"
                                                    gradient={['#10b981', '#059669']}
                                                />
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 8 }}>
                                                <MetricCard
                                                    title="Ocupación"
                                                    value={`${avgOccupancy}%`}
                                                    icon="account-group"
                                                    gradient={['#f59e0b', '#d97706']}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {/* CHARTS SECTION */}
                                {chartData.length > 0 && <BarChart data={chartData} />}

                                {/* OCCUPANCY TABLE */}
                                {occupancyData.length > 0 && (
                                    <View style={styles.infoCard}>
                                        <View style={styles.infoHeader}>
                                            <MaterialCommunityIcons name="chart-line" size={24} color="#10b981" />
                                            <Text style={styles.infoTitle}>Ocupación por Viaje</Text>
                                        </View>
                                        {occupancyData.slice(0, 5).map((trip, index) => (
                                            <View key={trip.tripId} style={styles.occupancyRow}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.occupancyDate}>
                                                        {new Date(trip.date).toLocaleDateString('es-ES')}
                                                    </Text>
                                                    <Text style={styles.occupancyDetails}>
                                                        {trip.sold}/{trip.capacity} asientos
                                                    </Text>
                                                </View>
                                                <View style={styles.occupancyBadge}>
                                                    <Text style={styles.occupancyPercent}>{trip.occupancyRate}%</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        )}

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
    },
    // Date Range Styles
    dateRangeContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    dateRangeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    dateInputsRow: {
        flexDirection: 'row',
    },
    dateInput: {
        backgroundColor: theme.colors.surface,
        fontSize: 12,
    },
    // Error Styles
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '500',
    },
    // Occupancy Row Styles
    occupancyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    occupancyDate: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    occupancyDetails: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    occupancyBadge: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    occupancyPercent: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    // Empty State Styles
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 24,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyStateHint: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
        fontStyle: 'italic',
    }
});
