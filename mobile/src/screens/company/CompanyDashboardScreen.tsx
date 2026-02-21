import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { PressableCard } from '../../components/ui/Card';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { getAllRoutes } from '../../services/route.service';
import { tripService } from '../../services/trip.service';
import { Compass, Anchor, Ticket, Building2, Map, Calendar, Search, Menu } from 'lucide-react-native';
import { getAllCompanies, getMyCompanies } from '../../services/company.service';
import { getAllMunicipios } from '../../services/municipio.service';
import { formatTimeAmPm } from '../../utils/time';

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

    const Shortcut = ({ icon, label, onPress, color }: any) => (
        <TouchableOpacity onPress={onPress} className="items-center w-1/4">
            <StyledView className={`w-14 h-14 rounded-2xl items-center justify-center mb-2 shadow-sm ${color}`}>
                {icon}
            </StyledView>
            <StyledText className="text-xs font-bold text-gray-600 text-center">{label}</StyledText>
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

    return (
        <ScreenContainer withPadding={false}>
            {/* Header */}
            <StyledView className="bg-nautic-primary pt-12 pb-8 px-6 rounded-b-[32px] shadow-lg">
                <StyledView className="flex-row justify-between items-center mb-6">
                    <StyledView className="flex-row items-center">
                        <StyledView className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3 border border-white/30">
                            <StyledText className="text-white font-bold text-lg">
                                {user?.name?.substring(0, 2).toUpperCase() || "CP"}
                            </StyledText>
                        </StyledView>
                        <StyledView>
                            <StyledText className="text-white font-bold text-lg">{user?.name}</StyledText>
                            <StyledText className="text-white/70 text-xs">
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
                                <Search size={20} color="white" />
                            </StyledView>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
                            <StyledView className="bg-white/10 p-2 rounded-lg">
                                <Menu size={20} color="white" />
                            </StyledView>
                        </TouchableOpacity>
                    </StyledView>
                </StyledView>
                <StyledText className="text-white text-2xl font-bold ml-1">
                    {isOwner ? `Panel de Control - ${activeMunicipioName || "General"}` : "Hola, ¿A dónde vamos?"}
                </StyledText>
            </StyledView>

            <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                {/* Shortcuts */}
                <StyledView className="flex-row justify-between mb-8">
                    {isOwner ? (
                        <>
                            <Shortcut
                                icon={<Compass size={24} color="white" />}
                                label="Rutas"
                                onPress={() => navigation.navigate('AllRoutes')}
                                color="bg-blue-500"
                            />
                            <Shortcut
                                icon={<Anchor size={24} color="white" />}
                                label="Viajes"
                                onPress={() => navigation.navigate('AllTrips')}
                                color="bg-emerald-500"
                            />
                            <Shortcut
                                icon={<Ticket size={24} color="white" />}
                                label="Tickets"
                                onPress={() => navigation.navigate('MyTickets')}
                                color="bg-amber-500"
                            />
                            <Shortcut
                                icon={<Building2 size={24} color="white" />}
                                label="Empresas"
                                onPress={() => navigation.navigate('MyCompanies')}
                                color="bg-violet-500"
                            />

                            {/* <Shortcut
                                icon={<Map size={24} color="white" />}
                                label="Lugares"
                                onPress={() => navigation.navigate('ManageLocations')}
                                color="bg-rose-500"
                            /> Removed as per user request to not be in grid, maybe in Menu? */}
                        </>
                    ) : (
                        <>
                            <Shortcut
                                icon={<Anchor size={24} color="white" />}
                                label="Viajes"
                                onPress={() => navigation.navigate('AllTrips')}
                                color="bg-nautic-primary"
                            />
                            <Shortcut
                                icon={<Ticket size={24} color="white" />}
                                label="Mis Tickets"
                                onPress={() => navigation.navigate('MyTickets')} // Uses MyTickets (list) or Tabs 'History'
                                color="bg-amber-500"
                            />
                            <Shortcut
                                icon={<Compass size={24} color="white" />}
                                label="Rutas"
                                onPress={() => navigation.navigate('AllRoutes')} // Assuming AllRoutes works for user?
                                color="bg-violet-500"
                            />
                        </>
                    )}
                </StyledView>

                {loading ? (
                    <ActivityIndicator size="large" color="#0B4F9C" />
                ) : (
                    <>
                        {/* Rutas Recientes */}
                        <StyledView className="mb-6">
                            <StyledView className="flex-row justify-between items-center mb-4 px-1">
                                <StyledText className="text-lg font-bold text-nautic-navy">Rutas Activas</StyledText>
                                <TouchableOpacity onPress={() => navigation.navigate('AllRoutes')}>
                                    <StyledText className="text-nautic-accent font-bold text-sm">Ver todas</StyledText>
                                </TouchableOpacity>
                            </StyledView>

                            {routes.map((item, idx) => {
                                const companyName = getRouteCompanyName(item);
                                return (
                                    <PressableCard
                                        key={item._id || item.id || `${item.origin}-${item.destination}-${idx}`}
                                        className="mb-4 p-5 shadow-sm border-0 bg-white"
                                        style={{ borderLeftWidth: 4, borderLeftColor: "#0B4F9C" }}
                                        onPress={() => handleRoutePress(item)}
                                    >
                                        <StyledView className="flex-row items-center">
                                            <StyledView className="bg-blue-50 dark:bg-blue-900/40 p-2.5 rounded-xl mr-4">
                                                <Map size={22} color="#0B4F9C" />
                                            </StyledView>
                                            <StyledView className="flex-1">
                                                <StyledText className="font-extrabold text-nautic-primary dark:text-blue-400 text-lg leading-tight">
                                                    {item.origin}
                                                </StyledText>
                                                <StyledView className="flex-row items-center mt-1">
                                                    <StyledText className="text-xs text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider">
                                                        {item.destination}
                                                    </StyledText>
                                                </StyledView>
                                                <StyledText className="mt-1 text-[10px] text-nautic-primary/60 font-black uppercase tracking-tighter">
                                                    {companyName}
                                                </StyledText>
                                            </StyledView>
                                        </StyledView>
                                    </PressableCard>
                                );
                            })}
                            {routes.length === 0 && (
                                <StyledView className="items-center p-4"><StyledText className="text-gray-400">No hay rutas</StyledText></StyledView>
                            )}
                        </StyledView>

                        {/* Viajes Section */}
                        <StyledView className="mb-8">
                            <StyledView className="flex-row justify-between items-center mb-4 px-1">
                                <StyledText className="text-lg font-bold text-nautic-navy">
                                    {isOwner ? "Próximos Viajes (Gestión)" : "Próximos Viajes"}
                                </StyledText>
                                <TouchableOpacity onPress={() => navigation.navigate('AllTrips')}>
                                    <StyledText className="text-nautic-accent font-bold text-sm">Ver todos</StyledText>
                                </TouchableOpacity>
                            </StyledView>

                            {trips.map((item, idx) => {
                                const isActive = item.isActive ?? item.active;
                                return (
                                    <PressableCard
                                        key={item._id || item.id || `${item.date}-${item.departureTime}-${idx}`}
                                        className="mb-4 p-5 shadow-sm border-0 bg-white"
                                        style={{ borderLeftWidth: 4, borderLeftColor: isActive ? "#22c55e" : "#94a3b8" }}
                                        onPress={() => handleTripPress(item)}
                                    >
                                        <StyledView className="flex-row justify-between items-start mb-3">
                                            <StyledView className="flex-row items-center flex-1">
                                                <StyledView className="bg-emerald-50 dark:bg-emerald-900/20 p-2.5 rounded-xl mr-3">
                                                    <Calendar size={22} color="#10B981" />
                                                </StyledView>
                                                <StyledView className="flex-1">
                                                    <StyledText className="font-extrabold text-gray-800 dark:text-white text-base">
                                                        {item.route?.origin || 'Origen'} → {item.route?.destination || 'Destino'}
                                                    </StyledText>
                                                    <StyledText className="text-[10px] text-slate-400 font-black uppercase">
                                                        {getTripCompanyName(item)}
                                                    </StyledText>
                                                </StyledView>
                                            </StyledView>

                                            <StyledView className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                                <StyledText className="text-emerald-700 font-black text-sm">
                                                    ${Number(item.price || 0).toLocaleString('es-CO')}
                                                </StyledText>
                                            </StyledView>
                                        </StyledView>

                                        <StyledView className="flex-row justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                                            <StyledText className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                {new Date(item.date).toLocaleDateString()} • {formatTimeAmPm(item.departureTime)}
                                            </StyledText>
                                            <StyledView className={`px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                                                <StyledText className={`text-[9px] font-black tracking-widest ${isActive ? 'text-green-700' : 'text-red-700'}`}>
                                                    {isActive ? 'ACTIVO' : 'CANCELADO'}
                                                </StyledText>
                                            </StyledView>
                                        </StyledView>
                                    </PressableCard>
                                );
                            })}

                            {/* Empty State */}
                            {trips.length === 0 && (
                                <StyledView className="items-center p-4"><StyledText className="text-gray-400">No hay viajes programados</StyledText></StyledView>
                            )}
                        </StyledView>
                    </>
                )}
            </ScrollView>
        </ScreenContainer>
    );
};
