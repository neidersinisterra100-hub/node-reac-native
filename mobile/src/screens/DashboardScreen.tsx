import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Avatar, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { getAllRoutes } from '../services/route.service';
import { tripService } from '../services/trip.service';
import { colors } from '../theme/colors';

export default function DashboardScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const isOwner = user?.role === 'owner' || user?.role === 'admin';

    const [loading, setLoading] = useState(true);
    const [routes, setRoutes] = useState<any[]>([]);
    const [trips, setTrips] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const routesData = await getAllRoutes();
            setRoutes(routesData.slice(0, 3));
            const tripsData = await tripService.getAll();
            setTrips(tripsData.slice(0, 3));
        } catch (e) {
            console.log("Error loading dashboard", e);
        } finally {
            setLoading(false);
        }
    };

    const renderRouteItem = (item: any) => (
        <TouchableOpacity
            key={item.id || item._id || Math.random().toString()}
            style={styles.listItem}
            onPress={() => navigation.navigate('AllRoutes')}
        >
            <View style={[styles.iconBox, { backgroundColor: '#e0f2f1' }]}>
                <MaterialCommunityIcons name="compass-outline" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemTitle}>{item.origin} → {item.destination}</Text>
                <Text style={styles.itemSubtitle}>
                    {typeof item.company === 'object' ? item.company.name : 'Empresa'}
                </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    const renderTripItem = (item: any) => {
        const origin = item.route?.origin || 'Origen';
        const dest = item.route?.destination || 'Destino';
        const isActive = item.isActive ?? item.active;

        return (
            <TouchableOpacity
                key={item.id || item._id || Math.random().toString()}
                style={styles.listItem}
                onPress={() => navigation.navigate('AllTrips')}
            >
                <View style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
                    <MaterialCommunityIcons name="sail-boat" size={24} color="#2e7d32" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.itemTitle}>{origin} → {dest}</Text>
                    <Text style={styles.itemSubtitle}>
                        {new Date(item.date).toLocaleDateString()} • {item.departureTime}
                    </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.statusBadge, { color: isActive ? '#2e7d32' : '#c62828' }]}>
                        {isActive ? 'Activo' : 'Cancelado'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[
            styles.container,
            {
                // backgroundColor: scheme === "dark" ? "#020617" : "#f8fafc",
            },
        ]}>
            {/* Header con Gradiente */}
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <View style={styles.userInfo}>
                        <Avatar.Text
                            size={48}
                            label={user?.name?.substring(0, 2).toUpperCase() || "CP"}
                            style={{ backgroundColor: 'white' }}
                            color="#1e3a8a"
                        />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.userName}>{user?.name?.toUpperCase()}</Text>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                        </View>
                    </View>
                    <View style={styles.headerIcons}>
                        <IconButton icon="bell-outline" iconColor="white" size={26} onPress={() => { }} />
                        <IconButton
                            icon="dots-vertical"
                            iconColor="white"
                            size={26}
                            onPress={() => navigation.navigate("Menu")}
                        />
                    </View>
                </View>
                <Text style={styles.pageTitle}>Resumen de Operación</Text>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Accesos Rápidos - BOTONES GRANDES Y COLORIDOS */}
                <View style={styles.shortcutsRow}>
                    <TouchableOpacity onPress={() => navigation.navigate("AllRoutes")} style={styles.shortcutBtn}>
                        <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.shortcutIconBg}>
                            <MaterialCommunityIcons name="compass-outline" size={28} color="white" />
                        </LinearGradient>
                        <Text style={styles.shortcutText}>Rutas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("AllTrips")} style={styles.shortcutBtn}>
                        <LinearGradient colors={['#10b981', '#059669']} style={styles.shortcutIconBg}>
                            <MaterialCommunityIcons name="anchor" size={28} color="white" />
                        </LinearGradient>
                        <Text style={styles.shortcutText}>Viajes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("MyTickets")} style={styles.shortcutBtn}>
                        <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.shortcutIconBg}>
                            <MaterialCommunityIcons name="ticket-confirmation" size={28} color="white" />
                        </LinearGradient>
                        <Text style={styles.shortcutText}>Tickets</Text>
                    </TouchableOpacity>

                    {isOwner && (
                        <TouchableOpacity onPress={() => navigation.navigate("MyCompanies")} style={styles.shortcutBtn}>
                            <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.shortcutIconBg}>
                                <MaterialCommunityIcons name="domain" size={28} color="white" />
                            </LinearGradient>
                            <Text style={styles.shortcutText}>Empresas</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* Card 1: Rutas Activas */}
                        <View style={styles.cardContainer}>
                            <LinearGradient
                                colors={['#2563eb', '#1d4ed8']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.cardHeaderGradient}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="map-marker-path" size={22} color="white" style={{ marginRight: 8 }} />
                                    <Text style={styles.cardTitleWhite}>Rutas Activas</Text>
                                </View>
                                <TouchableOpacity onPress={() => navigation.navigate('AllRoutes')}>
                                    <Text style={styles.seeAllWhite}>Ver todas</Text>
                                </TouchableOpacity>
                            </LinearGradient>

                            <View style={styles.listContent}>
                                {routes.length > 0 ? routes.map(renderRouteItem) : (
                                    <Text style={styles.emptyText}>No hay rutas registradas</Text>
                                )}
                            </View>
                        </View>

                        {/* Card 2: Próximos Viajes */}
                        <View style={[styles.cardContainer, { marginTop: 24 }]}>
                            <LinearGradient
                                colors={['#059669', '#047857']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.cardHeaderGradient}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="clock-outline" size={22} color="white" style={{ marginRight: 8 }} />
                                    <Text style={styles.cardTitleWhite}>Próximos Viajes</Text>
                                </View>
                                <TouchableOpacity onPress={() => navigation.navigate('AllTrips')}>
                                    <Text style={styles.seeAllWhite}>Ver todas</Text>
                                </TouchableOpacity>
                            </LinearGradient>

                            <View style={styles.listContent}>
                                {trips.length > 0 ? trips.map(renderTripItem) : (
                                    <Text style={styles.emptyText}>No hay viajes programados</Text>
                                )}
                            </View>
                        </View>
                    </>
                )}

                <View style={{ height: 40 }} />
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
        paddingTop: 50,
        paddingBottom: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 8,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    userEmail: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 4,
    },
    pageTitle: {
        color: 'white',
        fontSize: 26,
        fontWeight: '800',
        marginLeft: 4,
    },
    scrollContent: {
        padding: 20,
    },
    shortcutsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        marginTop: -10,
    },
    shortcutBtn: {
        alignItems: 'center',
        width: '23%',
    },
    shortcutIconBg: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        elevation: 4,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    shortcutText: {
        fontSize: 11,
        color: '#475569',
        fontWeight: '700',
        textAlign: 'center'
    },
    // Card Styles
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    cardHeaderGradient: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
    },
    cardTitleWhite: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white',
    },
    seeAllWhite: {
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '600',
        fontSize: 13,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    listContent: {
        padding: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        backgroundColor: 'white',
        borderRadius: 16, // More rounded
        borderWidth: 1,
        borderColor: '#f1f5f9',
        // Shadow for "Card" feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    itemSubtitle: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    statusBadge: {
        fontSize: 12,
        fontWeight: '700',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        overflow: 'hidden', // for background color if needed, typically text color is enough
    },
    emptyText: {
        textAlign: 'center',
        padding: 30,
        color: '#94a3b8',
        fontStyle: 'italic'
    }
});
