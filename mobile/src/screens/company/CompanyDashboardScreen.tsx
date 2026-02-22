import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { PressableCard } from '../../components/ui/Card';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { getAllRoutes } from '../../services/route.service';
import { tripService } from '../../services/trip.service';
import { Map, MapIcon, Compass, Anchor, Ticket, Building2, Search, Menu, Calendar, Ship } from 'lucide-react-native';
import { WeatherWidget } from '../../components/dashboard/WeatherWidget';
import { getAllCompanies, getMyCompanies } from '../../services/company.service';
import { getMyTickets } from '../../services/ticket.service';
import { getAllMunicipios } from '../../services/municipio.service';
import { formatTimeAmPm } from '../../utils/time';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardSkeleton } from '../../components/ui/Skeletons';

const StyledText = styled(Text);
const StyledView = styled(View);

export const CompanyDashboardScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const isOwner = user?.role === 'owner' || user?.role === 'admin' || user?.role === 'super_owner';
    const canUseMyCompanies = user?.role === 'owner' || user?.role === 'admin';

    const [loading, setLoading] = useState(true);
    const [routes, setRoutes] = useState<any[]>([]);
    const [trips, setTrips] = useState<any[]>([]);
    const [activeMunicipioName, setActiveMunicipioName] = useState<string>("");
    const [companyNamesById, setCompanyNamesById] = useState<Record<string, string>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [routesData, tripsData, companies] = await Promise.all([
                getAllRoutes(),
                tripService.getAll(),
                canUseMyCompanies ? getMyCompanies() : getAllCompanies(),
            ]);
            setRoutes(routesData.slice(0, 2));
            setTrips(tripsData.slice(0, 2));

            const companyMap = companies.reduce<Record<string, string>>((acc, company: any) => {
                if (company.id) acc[company.id] = company.name;
                if (company._id) acc[company._id] = company.name;
                return acc;
            }, {});
            setCompanyNamesById(companyMap);

            if (isOwner) {
                if (companies.length > 0) {
                    const activeCompany = companies.find(c => c.isActive) || companies[0];
                    if (activeCompany.municipioId) { // Check if it has string or object
                        // If backend populates it, it's object. If not, string.
                        // Let's assume it might not be populated in getMyCompanies yet.
                        // So we might need to fetch municipio list to find name, or fetch company details.
                        // Optimized way: Get all municipios and find name?
                        // Or if company has 'municipio' populated object.
                        // Let's check api response structure later if needed. For now assume ID and fetch all muni to map.
                        const allMunis = await getAllMunicipios(true); // Active only
                        const muni = allMunis.find(m => m._id === activeCompany.municipioId || m._id === (activeCompany as any).municipio);
                        if (muni) setActiveMunicipioName(muni.name);
                    }
                }
            }
        } catch (e) {
            console.log("Error loading dashboard", e);
        } finally {
            setLoading(false);
        }
    };

    const Shortcut = ({ icon, label, onPress, colors }: any) => (
        <TouchableOpacity onPress={onPress} className="items-center w-1/4">
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-14 h-14 rounded-2xl items-center justify-center mb-2 shadow-md"
            >
                {icon}
            </LinearGradient>
            <StyledText className="text-[11px] font-bold text-slate-600 text-center">{label}</StyledText>
        </TouchableOpacity>
    );

    const handleRoutePress = (item: any) => {
        navigation.navigate('RouteDetails', {
            routeId: item.id || item._id,
            origin: item.origin,
            destination: item.destination,
            companyName: getRouteCompanyName(item),
        });
    };

    const handleTripPress = (item: any) => {
        const tripId = item._id || item.id;
        if (!tripId) return;

        navigation.navigate('TripDetails', {
            tripId,
            trip: item,
        });
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
            return getTripCompanyName(matchedTrip);
        }

        return "Empresa";
    };

    const getTripCompanyName = (item: any) => {
        if (typeof item.company === 'object' && item.company?.name) {
            return item.company.name;
        }

        const companyId = typeof item.company === 'string'
            ? item.company
            : item.companyId || item.company?._id || item.company?.id;

        if (companyId && companyNamesById[companyId]) {
            return companyNamesById[companyId];
        }

        return "Empresa";
    };

    const [activeFacet, setActiveFacet] = useState<'aereo' | 'fluvial' | 'terrestre'>('fluvial');

    const FacetButton = ({ type, icon: Icon, label, color, bg }: { type: typeof activeFacet, icon: any, label: string, color: string, bg: string }) => {
        const isActive = activeFacet === type;
        return (
            <TouchableOpacity
                onPress={() => setActiveFacet(type)}
                className={`flex-1 flex-row items-center justify-center py-2.5 rounded-2xl mx-1 border ${isActive
                    ? 'bg-white shadow-sm border-white'
                    : 'bg-white/10 border-white/5'
                    }`}
            >
                <StyledView className={`w-8 h-8 rounded-xl items-center justify-center ${isActive ? bg : 'bg-white/20'}`}>
                    <Icon size={16} color={isActive ? "white" : "rgba(255,255,255,0.7)"} strokeWidth={2.5} />
                </StyledView>
                {isActive && (
                    <StyledText className="text-nautic-primary font-bold ml-2 text-[10px] uppercase tracking-tighter">
                        {label}
                    </StyledText>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer withPadding={false}>
            {/* Header */}
            <StyledView className="bg-nautic-primary pt-10 pb-5 px-6 rounded-b-[32px] shadow-lg">
                <StyledView className="flex-row justify-between items-center mb-3">
                    <StyledView className="flex-row items-center">
                        <StyledView className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3 border border-white/30">
                            <StyledText className="text-white font-bold text-base">
                                {user?.name?.substring(0, 2).toUpperCase() || "CP"}
                            </StyledText>
                        </StyledView>
                        <StyledView>
                            <StyledText className="text-white font-bold text-base">{user?.name}</StyledText>
                            <StyledText className="text-white/70 text-[10px]">
                                {isOwner
                                    ? (user?.role === 'admin'
                                        ? 'Administrador'
                                        : user?.role === 'super_owner'
                                            ? 'Super Propietario'
                                            : 'Propietario')
                                    : 'Viajero'}
                            </StyledText>
                        </StyledView>
                    </StyledView>
                    <StyledView className="flex-row gap-2">
                        <TouchableOpacity onPress={() => navigation.navigate('LocationSelection')}>
                            <StyledView className="bg-white/10 p-2 rounded-lg">
                                <Search size={18} color="white" />
                            </StyledView>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
                            <StyledView className="bg-white/10 p-2 rounded-lg">
                                <Menu size={18} color="white" />
                            </StyledView>
                        </TouchableOpacity>
                    </StyledView>
                </StyledView>

                <StyledView className="mb-1">
                    <View className="flex-row justify-between">
                        <FacetButton
                            type="aereo"
                            icon={(props: any) => <MaterialCommunityIcons name="airplane" {...props} />}
                            label="Aéreos"
                            color="#3b82f6"
                            bg="bg-blue-500"
                        />
                        <FacetButton
                            type="fluvial"
                            icon={Anchor}
                            label="Fluvial"
                            color="#10b981"
                            bg="bg-emerald-500"
                        />
                        <FacetButton
                            type="terrestre"
                            icon={(props: any) => <MaterialCommunityIcons name="bus" {...props} />}
                            label="Terrestre"
                            color="#f59e0b"
                            bg="bg-amber-500"
                        />
                    </View>
                </StyledView>
            </StyledView>

            <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                {activeFacet === 'fluvial' ? (
                    <>
                        {/* Shortcuts */}
                        <StyledView className="flex-row justify-between mb-8">
                            {isOwner ? (
                                <>
                                    <Shortcut
                                        icon={<Compass size={24} color="white" />}
                                        label="Rutas"
                                        onPress={() => navigation.navigate('AllRoutes')}
                                        colors={['#3b82f6', '#1d4ed8']}
                                    />
                                    <Shortcut
                                        icon={<Anchor size={24} color="white" />}
                                        label="Viajes"
                                        onPress={() => navigation.navigate('AllTrips')}
                                        colors={['#10b981', '#059669']}
                                    />
                                    <Shortcut
                                        icon={<Ticket size={24} color="white" />}
                                        label="Tickets"
                                        onPress={() => navigation.navigate('Passengers')}
                                        colors={['#f59e0b', '#d97706']}
                                    />
                                    <Shortcut
                                        icon={<Building2 size={24} color="white" />}
                                        label="Empresas"
                                        onPress={() => navigation.navigate('MyCompanies')}
                                        colors={['#8b5cf6', '#7c3aed']}
                                    />
                                </>
                            ) : (
                                <>
                                    <Shortcut
                                        icon={<Anchor size={24} color="white" />}
                                        label="Viajes"
                                        onPress={() => navigation.navigate('AllTrips')}
                                        colors={['#10b981', '#059669']}
                                    />
                                    <Shortcut
                                        icon={<Ticket size={24} color="white" />}
                                        label="Tickets"
                                        onPress={async () => {
                                            try {
                                                const tickets = await getMyTickets();
                                                if (tickets.length > 0) {
                                                    navigation.navigate('Ticket', { ticketId: tickets[0]._id });
                                                } else {
                                                    navigation.navigate('MyTickets');
                                                }
                                            } catch (e) {
                                                navigation.navigate('MyTickets');
                                            }
                                        }}
                                        colors={['#f59e0b', '#d97706']}
                                    />
                                    <Shortcut
                                        icon={<Compass size={24} color="white" />}
                                        label="Rutas"
                                        onPress={() => navigation.navigate('AllRoutes')}
                                        colors={['#3b82f6', '#1d4ed8']}
                                    />
                                </>
                            )}
                        </StyledView>

                        {/* Weather Widget */}
                        <WeatherWidget />

                        {loading ? (
                            <DashboardSkeleton />
                        ) : (
                            <>
                                {/* Rutas Recientes */}
                                <StyledView className="mb-8">
                                    <StyledView className="flex-row justify-between items-center mb-5 px-1">
                                        <StyledView>
                                            <StyledText className="text-xl font-black text-nautic-navy dark:text-dark-text tracking-tight">Rutas Activas</StyledText>
                                            <StyledView className="h-1 w-8 bg-blue-500 rounded-full mt-1" />
                                        </StyledView>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('AllRoutes')}
                                            className="bg-blue-500/10 dark:bg-blue-500/20 px-4 py-2 rounded-xl border border-blue-500/20 active:opacity-70"
                                            style={{ shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}
                                        >
                                            <StyledText className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest">Ver todas</StyledText>
                                        </TouchableOpacity>
                                    </StyledView>

                                    {routes.slice(0, 1).map((item, idx) => {
                                        const companyName = getRouteCompanyName(item);
                                        return (
                                            <PressableCard
                                                key={item._id || item.id || `${item.origin}-${item.destination}-${idx}`}
                                                className="mb-4 p-5 shadow-sm border-0 bg-white dark:bg-dark-surface rounded-[24px]"
                                                style={{ borderLeftWidth: 6, borderLeftColor: "#3b82f6" }}
                                                onPress={() => handleRoutePress(item)}
                                            >
                                                <StyledView className="flex-row items-center">
                                                    <StyledView className="bg-blue-50 dark:bg-blue-900/40 p-3 rounded-2xl mr-4">
                                                        <Map size={24} color="#3b82f6" strokeWidth={2.5} />
                                                    </StyledView>
                                                    <StyledView className="flex-1">
                                                        <StyledView className="flex-row flex-wrap items-center">
                                                            <StyledText className="font-black text-nautic-navy dark:text-white text-xl leading-tight mr-2">
                                                                {item.origin}
                                                            </StyledText>
                                                            <StyledView className="flex-row items-center bg-slate-100 dark:bg-dark-bg px-2 py-1 rounded-lg">
                                                                <MapIcon size={12} color="#64748b" style={{ marginRight: 4 }} />
                                                                <StyledText className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                                                    {item.destination}
                                                                </StyledText>
                                                            </StyledView>
                                                        </StyledView>
                                                        <StyledText className="mt-1.5 text-[10px] text-blue-500 font-bold uppercase tracking-widest">
                                                            {companyName}
                                                        </StyledText>
                                                    </StyledView>
                                                </StyledView>
                                            </PressableCard>
                                        );
                                    })}
                                    {routes.length === 0 && (
                                        <StyledView className="items-center p-8 bg-slate-50 dark:bg-dark-bg rounded-[24px] border border-dashed border-slate-200 dark:border-dark-border/50">
                                            <StyledText className="text-slate-400 font-bold">No hay rutas disponibles</StyledText>
                                        </StyledView>
                                    )}
                                </StyledView>

                                {/* Viajes Section */}
                                <StyledView className="mb-12">
                                    <StyledView className="flex-row justify-between items-center mb-5 px-1">
                                        <StyledView>
                                            <StyledText className="text-xl font-black text-nautic-navy dark:text-dark-text tracking-tight">
                                                {isOwner ? "Próximos Viajes" : "Tu Próximo Viaje"}
                                            </StyledText>
                                            <StyledView className="h-1 w-8 bg-emerald-500 rounded-full mt-1" />
                                        </StyledView>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('AllTrips')}
                                            className="bg-emerald-500/10 dark:bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/20 active:opacity-70"
                                            style={{ shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}
                                        >
                                            <StyledText className="text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest">Ver todos</StyledText>
                                        </TouchableOpacity>
                                    </StyledView>

                                    {trips.slice(0, 1).map((item, idx) => {
                                        const isActive = item.isActive ?? item.active;
                                        return (
                                            <PressableCard
                                                key={item._id || item.id || `${item.date}-${item.departureTime}-${idx}`}
                                                className="mb-4 p-5 shadow-sm border-0 bg-white dark:bg-dark-surface rounded-[24px]"
                                                style={{ borderLeftWidth: 6, borderLeftColor: isActive ? "#10b981" : "#f43f5e" }}
                                                onPress={() => handleTripPress(item)}
                                            >
                                                <StyledView className="flex-row justify-between items-start mb-4">
                                                    <StyledView className="flex-row items-center flex-1">
                                                        <StyledView className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl mr-4">
                                                            <Calendar size={24} color="#10b981" strokeWidth={2.5} />
                                                        </StyledView>
                                                        <StyledView className="flex-1">
                                                            <StyledText className="font-black text-nautic-navy dark:text-white text-lg">
                                                                {item.route?.origin || 'Origen'} → {item.route?.destination || 'Destino'}
                                                            </StyledText>
                                                            <StyledText className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                                                                {getTripCompanyName(item)}
                                                            </StyledText>
                                                        </StyledView>
                                                    </StyledView>

                                                    <StyledView className="bg-emerald-500 px-3 py-1.5 rounded-xl shadow-sm">
                                                        <StyledText className="text-white font-black text-sm">
                                                            ${Number(item.price || 0).toLocaleString('es-CO')}
                                                        </StyledText>
                                                    </StyledView>
                                                </StyledView>

                                                <StyledView className="flex-row justify-between items-center bg-slate-50 dark:bg-dark-bg p-3 rounded-2xl">
                                                    <StyledText className="text-xs font-bold text-slate-600 dark:text-dark-text-muted">
                                                        📅 {new Date(item.date).toLocaleDateString()}  •  ⏰ {formatTimeAmPm(item.departureTime)}
                                                    </StyledText>
                                                    <StyledView className={`px-2.5 py-1 rounded-lg ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-rose-100 dark:bg-rose-900/40'}`}>
                                                        <StyledText className={`text-[9px] font-black tracking-widest ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                                            {isActive ? 'CONFIRMADO' : 'PENDIENTE'}
                                                        </StyledText>
                                                    </StyledView>
                                                </StyledView>
                                            </PressableCard>
                                        );
                                    })}

                                    {/* Empty State */}
                                    {trips.length === 0 && (
                                        <StyledView className="items-center p-8 bg-slate-50 dark:bg-dark-bg rounded-[24px] border border-dashed border-slate-200 dark:border-dark-border/50">
                                            <StyledText className="text-slate-400 font-bold">No hay viajes programados</StyledText>
                                        </StyledView>
                                    )}
                                </StyledView>
                            </>
                        )}
                    </>
                ) : (
                    activeFacet === 'terrestre' ? (
                        <StyledView className="mt-6 mb-12">
                            {/* Terrestre Hub */}
                            <PressableCard
                                onPress={() => navigation.navigate('TerrestreRide')}
                                className="bg-amber-500 p-8 rounded-[40px] shadow-xl shadow-amber-500/30 overflow-hidden border-0"
                            >
                                <LinearGradient
                                    colors={['#f59e0b', '#d97706']}
                                    style={StyleSheet.absoluteFill}
                                />
                                <StyledView className="flex-row justify-between items-center relative z-10">
                                    <StyledView className="flex-1">
                                        <StyledText className="text-white text-3xl font-black leading-tight mb-2">
                                            Solicitar{"\n"}un Viaje
                                        </StyledText>
                                        <StyledText className="text-white/80 font-bold text-xs uppercase tracking-widest">
                                            Transporte Terrestre
                                        </StyledText>
                                    </StyledView>
                                    <StyledView className="bg-white/20 p-5 rounded-[32px] border border-white/20">
                                        <MaterialCommunityIcons name="car-side" size={48} color="white" />
                                    </StyledView>
                                </StyledView>

                                <StyledView className="mt-8 bg-white/10 py-3 rounded-2xl items-center border border-white/10">
                                    <StyledText className="text-white font-black uppercase text-[10px] tracking-[4px]">
                                        Comenzar Ahora
                                    </StyledText>
                                </StyledView>
                            </PressableCard>

                            {/* Stats row */}
                            <StyledView className="flex-row gap-4 mt-6">
                                <StyledView className="flex-1 bg-white dark:bg-dark-surface p-5 rounded-[32px] shadow-sm border border-slate-100 dark:border-dark-border/50">
                                    <StyledText className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Cerca de ti</StyledText>
                                    <StyledText className="text-nautic-navy dark:text-white text-xl font-black">5 Conductores</StyledText>
                                </StyledView>
                                <StyledView className="flex-1 bg-white dark:bg-dark-surface p-5 rounded-[32px] shadow-sm border border-slate-100 dark:border-dark-border/50">
                                    <StyledText className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Tu Rating</StyledText>
                                    <StyledText className="text-nautic-navy dark:text-white text-xl font-black">4.9 ★</StyledText>
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    ) : (
                        <StyledView className="mt-12 items-center justify-center py-20 px-10 bg-white dark:bg-dark-surface rounded-[40px] shadow-sm border border-slate-100 dark:border-dark-border/50">
                            <StyledView className={`w-20 h-20 rounded-full items-center justify-center mb-6 bg-blue-50 dark:bg-blue-900/20`}>
                                <MaterialCommunityIcons name="airplane-clock" size={40} color="#3b82f6" />
                            </StyledView>
                            <StyledText className="text-2xl font-black text-nautic-navy dark:text-dark-text text-center mb-2">
                                Próximamente
                            </StyledText>
                            <StyledText className="text-slate-500 dark:text-dark-text-muted text-center text-sm leading-relaxed">
                                Estamos trabajando para traer el transporte aéreo a nuestra plataforma.
                            </StyledText>

                            <StyledView className="mt-8 px-6 py-2 bg-slate-100 dark:bg-dark-bg rounded-full">
                                <StyledText className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inauguración 2026</StyledText>
                            </StyledView>
                        </StyledView>
                    )
                )}
            </ScrollView>
        </ScreenContainer>
    );
};
