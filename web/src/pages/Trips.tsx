import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, MapPin } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTrips } from '../hooks/useTrips';
import { TripForm } from '../components/trips/TripForm';
import { TripCard } from '../components/trips/TripCard';
import { isPopulatedRoute } from '../utils/typeGuards';

export function Trips() {
  const location = useLocation();
  const filterRouteId = location.state?.filterRouteId;
  const [isCreating, setIsCreating] = useState(false);
  const setSelectedCompany = useAuthStore(state => state.setSelectedCompany);

  const { 
    trips, 
    companies, 
    loading, 
    isOwner, 
    canToggle, 
    selectedCompanyId, 
    toggleActive, 
    deleteTrip, 
    addTrip 
  } = useTrips();

  const filteredTrips = trips.filter(t => {
      // Filtro de ruta específica (si venimos de Routes)
      if (filterRouteId) {
          const tripRouteId = isPopulatedRoute(t.route) ? t.route._id : t.route;
          if (tripRouteId !== filterRouteId) return false;
      }
      // El filtro de empresa ya se aplica en el hook/backend al cargar,
      // pero si el usuario cambia el select en local sin recargar todo (aunque el hook recarga),
      // aseguramos consistencia si fuera necesario.
      // Dado que el hook recarga con selectedCompanyId, 'trips' ya debería ser correcto.
      return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dashboard-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Viajes</h2>
            <p className="text-gray-500 dark:text-gray-400">
                {isOwner ? "Gestiona tus viajes programados" : "Tus próximos viajes"}
            </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
             {isOwner && companies.length > 0 && (
                <select
                    value={selectedCompanyId || ''}
                    onChange={(e) => setSelectedCompany(e.target.value ? { _id: e.target.value, name: e.target.options[e.target.selectedIndex].text } : null)}
                    className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                    <option value="">Todas las Empresas</option>
                    {companies.map(c => (
                        <option key={`filter-select-${c._id}`} value={c._id}>{c.name}</option>
                    ))}
                </select>
            )}

            {isOwner && (
                <button 
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-dashboard-navy hover:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
                <Plus size={20} />
                <span>{isCreating ? 'Cancelar' : 'Nuevo Viaje'}</span>
                </button>
            )}
        </div>
      </div>

      {isCreating && (
        <TripForm 
            isOwner={isOwner} 
            onSuccess={(newTrip) => {
                addTrip(newTrip);
                setIsCreating(false);
            }}
            onCancel={() => setIsCreating(false)}
        />
      )}

      {filteredTrips.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-gray-400 dark:text-gray-500" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {isOwner ? "No tienes viajes registrados" : "No hay viajes disponibles por el momento"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                {isOwner ? "Comienza creando tu primer viaje." : "Consulta más tarde para ver nuevos viajes programados."}
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard 
                key={trip._id} 
                trip={trip} 
                isOwner={isOwner} 
                canToggle={canToggle}
                onToggleActive={toggleActive}
                onDelete={deleteTrip}
            />
          ))}
        </div>
      )}
    </div>
  );
}
