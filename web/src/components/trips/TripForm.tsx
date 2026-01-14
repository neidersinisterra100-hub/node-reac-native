import { useState, useEffect } from 'react';
import { tripService } from '../../services/trip.service';
import { Route } from '../../services/route.service';
import { Trip } from '../../types/trip';

interface TripFormProps {
  onSuccess: (newTrip: Trip) => void;
  onCancel: () => void;
  isOwner: boolean;
}

export function TripForm({ onSuccess, onCancel, isOwner }: TripFormProps) {
  const [newTripData, setNewTripData] = useState({
      routeId: '',
      date: new Date().toISOString().split('T')[0],
      departureTime: '08:00',
      price: 5000,
      transportType: 'Lancha'
  });
  
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);

  useEffect(() => {
      if (isOwner) {
          const loadRoutes = async () => {
             try {
                const { routeService } = await import('../../services/route.service');
                const routes = await routeService.getAll();
                setAvailableRoutes(routes);
             } catch (error) {
                 console.error("Error loading routes for select:", error);
             }
          };
          loadRoutes();
      }
  }, [isOwner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { routeId, date, departureTime, price, transportType } = newTripData;

    if (routeId && date && departureTime && price > 0 && transportType) {
        try {
            const newTrip = await tripService.create({
                routeId,
                date,
                departureTime,
                price,
                transportType
            }); 
            onSuccess(newTrip);
            // Reset form
            setNewTripData({
                routeId: '',
                date: new Date().toISOString().split('T')[0],
                departureTime: '08:00',
                price: 5000,
                transportType: 'Lancha'
            });
        } catch (error) {
            console.error("Error creating trip:", error);
            alert("Error al crear viaje.");
        }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Programar Nuevo Viaje</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select 
                value={newTripData.routeId}
                onChange={(e) => setNewTripData({...newTripData, routeId: e.target.value})}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            >
                <option value="">Selecciona una Ruta</option>
                {availableRoutes.map(r => (
                    <option key={r._id} value={r._id}>{r.name || `${r.origin} - ${r.destination}`}</option>
                ))}
            </select>
            <input 
                type="date" 
                value={newTripData.date}
                onChange={(e) => setNewTripData({...newTripData, date: e.target.value})}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input 
                type="time" 
                value={newTripData.departureTime}
                onChange={(e) => setNewTripData({...newTripData, departureTime: e.target.value})}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input 
                type="text" 
                value={newTripData.transportType}
                onChange={(e) => setNewTripData({...newTripData, transportType: e.target.value})}
                placeholder="Tipo de Transporte (ej. Lancha, Bus)"
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <div className="flex gap-2">
                <span className="flex items-center px-3 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-500">$</span>
                <input 
                    type="number" 
                    value={newTripData.price || ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        setNewTripData({...newTripData, price: val === '' ? 0 : parseInt(val)})
                    }}
                    placeholder="Precio"
                    className="w-full px-4 py-2 border rounded-r-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                />
            </div>
        </div>
        <div className="mt-4 flex justify-end">
            <button 
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
                Guardar Viaje
            </button>
        </div>
    </form>
  );
}
