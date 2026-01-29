import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { getAllRoutes } from '../../services/route.service';
import { tripService } from '../../services/trip.service';
import { Compass, Anchor, Ticket, Building2, Map, Calendar, ArrowRight, Search, User, Menu } from 'lucide-react-native';
import { getMyTickets } from '../../services/ticket.service';
import { getMyCompanies } from '../../services/company.service';
import { getAllMunicipios } from '../../services/municipio.service';

const StyledText = styled(Text);
const StyledView = styled(View);

export const CompanyDashboardScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const isOwner = user?.role === 'owner' || user?.role === 'admin';

    const [loading, setLoading] = useState(true);
    const [routes, setRoutes] = useState<any[]>([]);
    const [trips, setTrips] = useState<any[]>([]);
    const [myTickets, setMyTickets] = useState<any[]>([]);
    const [activeMunicipioName, setActiveMunicipioName] = useState<string>("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const routesData = await getAllRoutes();
            setRoutes(routesData.slice(0, 3));

            if (isOwner) {
                const tripsData = await tripService.getAll();
                setTrips(tripsData.slice(0, 3));

                // Fetch Company to get Municipio
                // Assuming first company for now or active one
                const companies = await getMyCompanies();
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
            } else {
                // User: Load My Tickets
                const ticketsData = await getMyTickets();
                // Filter for upcoming? Assuming backend returns all.
                // Let's just show top 3 recent/upcoming
                setMyTickets(ticketsData.slice(0, 3));
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
                            <StyledText className="text-white/70 text-xs">{isOwner ? (user?.role === 'admin' ? 'Administrador' : 'Propietario') : 'Viajero'}</StyledText>
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
                        {isOwner && (
                            <StyledView className="mb-6">
                                <StyledView className="flex-row justify-between items-center mb-4 px-1">
                                    <StyledText className="text-lg font-bold text-nautic-navy">Rutas Activas</StyledText>
                                    <TouchableOpacity onPress={() => navigation.navigate('AllRoutes')}>
                                        <StyledText className="text-nautic-accent font-bold text-sm">Ver todas</StyledText>
                                    </TouchableOpacity>
                                </StyledView>

                                {routes.map((item, idx) => (
                                    <Card key={idx} className="mb-3 p-4 flex-row items-center">
                                        <StyledView className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                                            <Map size={20} color="#0B4F9C" />
                                        </StyledView>
                                        <StyledView className="flex-1">
                                            <StyledText className="font-bold text-gray-800">{item.origin} → {item.destination}</StyledText>
                                            <StyledText className="text-xs text-gray-500">
                                                {typeof item.company === 'object' ? item.company.name : 'Mi Empresa'}
                                            </StyledText>
                                        </StyledView>
                                    </Card>
                                ))}
                                {routes.length === 0 && (
                                    <StyledView className="items-center p-4"><StyledText className="text-gray-400">No hay rutas</StyledText></StyledView>
                                )}
                            </StyledView>
                        )}

                        {/* Viajes / Tickets Section */}
                        <StyledView className="mb-8">
                            <StyledView className="flex-row justify-between items-center mb-4 px-1">
                                <StyledText className="text-lg font-bold text-nautic-navy">{isOwner ? "Próximos Viajes (Gestión)" : "Mis Próximos Viajes"}</StyledText>
                                <TouchableOpacity onPress={() => navigation.navigate(isOwner ? 'AllTrips' : 'MyTickets')}>
                                    <StyledText className="text-nautic-accent font-bold text-sm">Ver todos</StyledText>
                                </TouchableOpacity>
                            </StyledView>

                            {isOwner ? (
                                trips.map((item, idx) => (
                                    <Card key={idx} className="mb-3 p-4 flex-row items-center border-l-4 border-l-emerald-500">
                                        <StyledView className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center mr-3">
                                            <Calendar size={20} color="#10B981" />
                                        </StyledView>
                                        <StyledView className="flex-1">
                                            <StyledText className="font-bold text-gray-800">
                                                {item.route?.origin || 'Origen'} → {item.route?.destination || 'Destino'}
                                            </StyledText>
                                            <StyledText className="text-xs text-gray-500">
                                                {new Date(item.date).toLocaleDateString()} • {item.departureTime}
                                            </StyledText>
                                        </StyledView>
                                        <StyledView>
                                            <StyledText className={`text-xs font-bold ${(item.isActive ?? item.active) ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {(item.isActive ?? item.active) ? 'ACTIVO' : 'CANCEL'}
                                            </StyledText>
                                        </StyledView>
                                    </Card>
                                ))
                            ) : (
                                myTickets.map((item, idx) => (
                                    <Card key={idx} className="mb-3 p-4 flex-row items-center border-l-4 border-l-nautic-primary">
                                        <StyledView className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                                            <Ticket size={20} color="#0B4F9C" />
                                        </StyledView>
                                        <StyledView className="flex-1">
                                            <StyledText className="font-bold text-gray-800">
                                                {item.routeName || "Viaje"}
                                            </StyledText>
                                            <StyledText className="text-xs text-gray-500">
                                                {item.date ? item.date.toString().substring(0, 10) : ""} • {item.departureAt}
                                            </StyledText>
                                        </StyledView>
                                        <StyledView>
                                            <StyledText className="text-xs font-bold text-green-600">CONFIRMADO</StyledText>
                                        </StyledView>
                                    </Card>
                                ))
                            )}

                            {/* Empty States */}
                            {isOwner && trips.length === 0 && (
                                <StyledView className="items-center p-4"><StyledText className="text-gray-400">No hay viajes programados</StyledText></StyledView>
                            )}
                            {!isOwner && myTickets.length === 0 && (
                                <StyledView className="items-center p-4">
                                    <StyledText className="text-gray-400 mb-2">No tienes viajes próximos</StyledText>
                                    <Button title="Buscar Viaje" onPress={() => navigation.navigate('LocationSelection')} variant="outline" />
                                </StyledView>
                            )}
                        </StyledView>
                    </>
                )}
            </ScrollView>
        </ScreenContainer>
    );
};
