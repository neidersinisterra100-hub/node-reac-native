import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Avatar, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { getAllRoutes } from '../services/route.service';
import { tripService } from '../services/trip.service';
import { getAllCompanies, getMyCompanies } from '../services/company.service';
import { getMyTickets } from '../services/ticket.service';
import { colors } from '../theme/colors';
import { formatTimeAmPm } from '../utils/time';
import { DashboardSkeleton } from '../components/ui/Skeletons';
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);

export default function DashboardScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const isOwner = user?.role === 'owner' || user?.role === 'admin' || user?.role === 'super_owner';
    const canUseMyCompanies = user?.role === 'owner' || user?.role === 'admin';

    const [loading, setLoading] = useState(true);
    const [routes, setRoutes] = useState<any[]>([]);
    const [trips, setTrips] = useState<any[]>([]);
    const [companyNamesById, setCompanyNamesById] = useState<Record<string, string>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [routesData, tripsData, companiesData] = await Promise.all([
                getAllRoutes(),
                tripService.getAll(),
                canUseMyCompanies ? getMyCompanies() : getAllCompanies(),
            ]);
            setRoutes(routesData.slice(0, 2));
            setTrips(tripsData.slice(0, 2));

            const companyMap = companiesData.reduce<Record<string, string>>((acc, company: any) => {
                if (company.id) acc[company.id] = company.name;
                if (company._id) acc[company._id] = company.name;
                return acc;
            }, {});
            setCompanyNamesById(companyMap);
        } catch (e) {
            console.log("Error loading dashboard", e);
        } finally {
            setLoading(false);
        }
    };

    const getRouteCompanyName = (item: any) => {
        if (typeof item.company === 'object' && item.company?.name) {
            return item.company.name;
        }

        if (typeof item.company === 'string' && companyNamesById[item.company]) {
            return companyNamesById[item.company];
        }

        const companyId = item.companyId || item.company?._id || item.company?.id;
        if (companyId && companyNamesById[companyId]) {
            return companyNamesById[companyId];
        }

        const matchedTrip = trips.find((trip: any) =>
            trip.route?.origin === item.origin &&
            trip.route?.destination === item.destination
        );
        if (matchedTrip) {
            if (typeof matchedTrip.company === 'object' && matchedTrip.company?.name) {
                return matchedTrip.company.name;
            }
            const tripCompanyId = typeof matchedTrip.company === 'string'
                ? matchedTrip.company
                : matchedTrip.company?.id || matchedTrip.company?._id;
            if (tripCompanyId && companyNamesById[tripCompanyId]) {
                return companyNamesById[tripCompanyId];
            }
        }

        return 'Empresa';
    };

    const renderRouteItem = (item: any) => (
        <TouchableOpacity
            key={item.id || item._id || Math.random().toString()}
            className="flex-row items-center p-4 mb-3 bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border/50 shadow-sm"
            onPress={() =>
                navigation.navigate('RouteDetails', {
                    routeId: item.id || item._id,
                    origin: item.origin,
                    destination: item.destination,
                    companyName: getRouteCompanyName(item),
                })
            }
        >
            <StyledView className="w-[50px] h-[50px] rounded-xl justify-center items-center bg-emerald-50 dark:bg-emerald-900/20">
                <MaterialCommunityIcons name="compass-outline" size={24} color="#009688" />
            </StyledView>
            <StyledView className="flex-1 ml-3">
                <StyledView className="flex-row items-center flex-wrap">
                    <StyledText className="text-base font-bold text-slate-800 dark:text-dark-text mr-2">{item.origin}</StyledText>
                    <MaterialCommunityIcons name="arrow-right" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                    <StyledText className="text-base font-bold text-slate-800 dark:text-dark-text">{item.destination}</StyledText>
                </StyledView>
                <StyledText className="text-[10px] text-slate-500 dark:text-dark-text-muted mt-0.5 font-medium uppercase">
                    {getRouteCompanyName(item)}
                </StyledText>
            </StyledView>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />
        </TouchableOpacity>
    );

    const renderTripItem = (item: any) => {
        const origin = item.route?.origin || 'Origen';
        const dest = item.route?.destination || 'Destino';
        const isActive = item.isActive ?? item.active;

        return (
            <TouchableOpacity
                key={item.id || item._id || Math.random().toString()}
                className="flex-row items-center p-4 mb-3 bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border/50 shadow-sm"
                onPress={() =>
                    navigation.navigate('TripDetails', {
                        tripId: item._id || item.id,
                        trip: item,
                    })
                }
            >
                <StyledView className="w-[50px] h-[50px] rounded-xl justify-center items-center bg-green-50 dark:bg-green-900/20">
                    <MaterialCommunityIcons name="sail-boat" size={24} color="#2e7d32" />
                </StyledView>
                <StyledView className="flex-1 ml-3">
                    <StyledView className="flex-row flex-wrap items-center">
                        <StyledText className="text-base font-bold text-slate-800 dark:text-dark-text mr-2">{origin}</StyledText>
                        <MaterialCommunityIcons name="arrow-right" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                        <StyledText className="text-base font-bold text-slate-800 dark:text-dark-text">{dest}</StyledText>
                    </StyledView>
                    <StyledText className="text-[11px] text-slate-500 dark:text-dark-text-muted mt-0.5 font-medium">
                        {new Date(item.date).toLocaleDateString()} • {formatTimeAmPm(item.departureTime)}
                    </StyledText>
                </StyledView>
                <StyledView className="items-end">
                    <StyledText className={`text-[12px] font-bold px-2 py-0.5 rounded-lg ${isActive ? 'text-green-700 bg-green-50 dark:bg-green-900/20' : 'text-red-700 bg-red-50 dark:bg-red-900/20'}`}>
                        {isActive ? 'Activo' : 'Cancelado'}
                    </StyledText>
                </StyledView>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-nautic-bg dark:bg-dark-bg transition-colors duration-200">
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
                            color="#080c14"
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
                        <StyledText className="text-[11px] text-slate-600 dark:text-dark-text-muted font-bold text-center">Rutas</StyledText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("AllTrips")} style={styles.shortcutBtn}>
                        <LinearGradient colors={['#10b981', '#059669']} style={styles.shortcutIconBg}>
                            <MaterialCommunityIcons name="anchor" size={28} color="white" />
                        </LinearGradient>
                        <StyledText className="text-[11px] text-slate-600 dark:text-dark-text-muted font-bold text-center">Viajes</StyledText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={async () => {
                            if (isOwner) {
                                navigation.navigate("Passengers");
                                return;
                            }
                            try {
                                const tickets = await getMyTickets();
                                if (tickets.length > 0) {
                                    // Abrimos el primero (más reciente por el sort: -1 del backend)
                                    navigation.navigate("Ticket", { ticketId: tickets[0]._id });
                                } else {
                                    navigation.navigate("MyTickets");
                                }
                            } catch (e) {
                                navigation.navigate("MyTickets");
                            }
                        }}
                        style={styles.shortcutBtn}
                    >
                        <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.shortcutIconBg}>
                            <MaterialCommunityIcons name="ticket-confirmation" size={28} color="white" />
                        </LinearGradient>
                        <StyledText className="text-[11px] text-slate-600 dark:text-dark-text-muted font-bold text-center">Tickets</StyledText>
                    </TouchableOpacity>

                    {isOwner && (
                        <TouchableOpacity onPress={() => navigation.navigate("MyCompanies")} style={styles.shortcutBtn}>
                            <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.shortcutIconBg}>
                                <MaterialCommunityIcons name="domain" size={28} color="white" />
                            </LinearGradient>
                            <StyledText className="text-[11px] text-slate-600 dark:text-dark-text-muted font-bold text-center">Empresas</StyledText>
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <DashboardSkeleton />
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
