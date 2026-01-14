import { MapPin, Map as MapIcon, ArrowRight, Ship, Clock, DollarSign, Briefcase } from 'lucide-react';
import { useEffect, useState } from 'react';
import { tripService } from '../services/trip.service';
import { routeService, Route } from '../services/route.service';
import { companyService } from '../services/company.service';
import { useAuthStore } from '../store/authStore';
import { useStatsStore } from '../store/statsStore'; // 👈 Restaurado
import { useNavigate } from 'react-router-dom';
import { Trip } from '../types/trip';
import { MetricCard } from '../components/dashboard/MetricCard'; // 👈 Restaurado

export function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);

    const user = useAuthStore(state => state.user);
    const { stats, setStats } = useStatsStore(); // 👈 Restaurado
    const setSelectedCompany = useAuthStore(state => state.setSelectedCompany);
    const navigate = useNavigate();

    const isOwner = user?.role === 'owner' || user?.role === 'admin';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Cargar viajes recientes
                const tripsData = await tripService.getAll();
                setTrips(Array.isArray(tripsData) ? tripsData.slice(0, 5) : []);

                // Cargar rutas
                const rawRoutes = await routeService.getAll();
                const uniqueRoutes = Array.from(new Map(rawRoutes.map((r: Route) => [r._id, r])).values());
                setRoutes(uniqueRoutes.slice(0, 5));

                // Cargar Empresas (para el conteo)
                let companiesCount = 0;
                if (isOwner) {
                    try {
                        const companies = await companyService.getAll();
                        companiesCount = Array.isArray(companies) ? companies.length : 0;
                    } catch (e) { console.error(e); }
                }

                // Actualizar Stats para los botones
                setStats({
                    earnings: 0, // Esto se ve en reportes, pero mantenemos el botón
                    trips: Array.isArray(tripsData) ? tripsData.length : 0,
                    routes: uniqueRoutes.length,
                    companies: companiesCount,
                    likes: 0, rating: 0, share: 0
                });

            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [isOwner, setStats]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dashboard-navy"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hola, {user?.name} 👋</h1>
                    <p className="text-gray-500">Aquí tienes un resumen de tu operación hoy.</p>
                </div>
            </div>

            {/* 🔘 BOTONES DE NAVEGACIÓN (METRIC CARDS) - RESTAURADOS */}
            {isOwner && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div onClick={() => { }} className="cursor-pointer transition-transform hover:scale-105">
                        <MetricCard
                            title="Ingresos"
                            value={`$ ${stats.earnings}`}
                            icon={DollarSign}
                            iconColor="text-white bg-dashboard-navy rounded-full p-0.5 w-6 h-6"
                        />
                    </div>

                    <div onClick={() => { setSelectedCompany(null); navigate('/trips'); }} className="cursor-pointer transition-transform hover:scale-105">
                        <MetricCard
                            title="Viajes"
                            value={stats.trips.toString()}
                            icon={MapPin}
                            iconColor="text-dashboard-orange"
                        />
                    </div>

                    <div onClick={() => { setSelectedCompany(null); navigate('/routes'); }} className="cursor-pointer transition-transform hover:scale-105">
                        <MetricCard
                            title="Rutas"
                            value={stats.routes.toString()}
                            icon={MapIcon}
                            iconColor="text-dashboard-orange"
                        />
                    </div>

                    <div onClick={() => { setSelectedCompany(null); navigate('/companies'); }} className="cursor-pointer transition-transform hover:scale-105">
                        <MetricCard
                            title="Empresas"
                            value={stats.companies.toString()}
                            icon={Briefcase}
                            iconColor="text-dashboard-orange"
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LISTA DE RUTAS */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <MapIcon className="w-5 h-5 text-blue-600" />
                            Rutas Activas
                        </h2>
                        <button
                            onClick={() => navigate('/routes')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            Ver todas <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {routes.length > 0 ? (
                        <div className="space-y-4">
                            {routes.map((route) => (
                                <div key={route._id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{route.origin} → {route.destination}</h3>
                                            <p className="text-sm text-gray-500">
                                                {typeof route.company === 'object' && route.company ? route.company.name : 'Empresa'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {/* <span className="text-sm font-medium text-gray-900">${route.price}</span> Route doesn't have price */}

                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">No hay rutas registradas.</div>
                    )}
                </div>

                {/* LISTA DE VIAJES (PRÓXIMOS ZARPES) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Ship className="w-5 h-5 text-green-600" />
                            Próximos Zarpes
                        </h2>
                        <button
                            onClick={() => navigate('/trips')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            Ver todos <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {trips.length > 0 ? (
                        <div className="space-y-4">
                            {trips.map((trip) => {
                                const origin = typeof trip.route === 'object' ? trip.route?.origin : 'Origen';
                                const dest = typeof trip.route === 'object' ? trip.route?.destination : 'Destino';

                                return (
                                    <div key={trip._id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{origin} → {dest}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(trip.date).toLocaleDateString()} • {trip.departureTime}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${trip.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {trip.active ? 'Activo' : 'Cancelado'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">No hay viajes programados.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
