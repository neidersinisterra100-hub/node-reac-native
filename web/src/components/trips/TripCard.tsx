import { MapPin, Calendar, Clock, Bus, DollarSign, Power, Trash2 } from 'lucide-react';
import { Trip } from '../../types/trip';
import { isPopulatedRoute, isPopulatedCompany } from '../../utils/typeGuards';

interface TripCardProps {
  trip: Trip;
  isOwner: boolean;
  canToggle: boolean;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export function TripCard({ trip, isOwner, canToggle, onToggleActive, onDelete }: TripCardProps) {
  
  const handleDelete = () => {
      const confirmed = window.confirm("⚠️ ¿Eliminar este viaje permanentemente?");
      if (!confirmed) return;
      onDelete(trip._id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Bus className="text-dashboard-orange dark:text-orange-400" size={24} />
        </div>
        <div className="flex items-center gap-2">
            {canToggle && (
                <>
                    <button 
                        onClick={() => onToggleActive(trip._id, trip.active)}
                        title={trip.active ? "Desactivar" : "Activar"}
                        className={`p-2 rounded-full transition-all duration-200 ${
                        trip.active 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700'
                    }`}>
                        <Power size={18} />
                    </button>
                    {isOwner && (
                        <button 
                            onClick={handleDelete}
                            title="Eliminar"
                            className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </>
            )}
            {!canToggle && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    trip.active 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                    {trip.active ? 'Activo' : 'Inactivo'}
                </span>
            )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
         Viaje en {trip.transportType}
      </h3>
      
      {/* Mostrar Nombre de la Empresa */}
      {trip.company && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">
              {isPopulatedCompany(trip.company) ? trip.company.name : ''}
          </div>
      )}
      
      {isPopulatedRoute(trip.route) && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-700 dark:text-gray-300">
              <MapPin size={16} className="text-blue-500" />
              <span className="font-medium">{trip.route.origin}</span>
              <span className="text-gray-400">→</span>
              <span className="font-medium">{trip.route.destination}</span>
          </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm">
                {new Date(trip.date).toLocaleDateString()}
            </span>
        </div>
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Clock size={18} className="text-gray-400" />
            <span className="text-sm">{trip.departureTime}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <DollarSign size={18} className="text-gray-400" />
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                $ {trip.price.toLocaleString()}
            </span>
        </div>
         <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Bus size={18} className="text-gray-400" />
            <span className="text-sm">Capacidad: {trip.capacity}</span>
        </div>
      </div>
    </div>
  );
}
