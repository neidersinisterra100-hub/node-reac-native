import { useState } from 'react';
import { routeService, Route } from '../../services/route.service';
import { Company } from '../../services/company.service';

interface RouteFormProps {
  companies: Company[];
  onSuccess: (newRoute: Route) => void;
  onCancel: () => void;
}

export function RouteForm({ companies, onSuccess, onCancel }: RouteFormProps) {
  const [newRouteData, setNewRouteData] = useState({
      origin: '',
      destination: '',
      companyId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { origin, destination, companyId } = newRouteData;
    
    if (origin && destination && companyId) {
        try {
            const newRoute = await routeService.create({ 
                origin, 
                destination, 
                companyId 
            });
            onSuccess(newRoute);
            setNewRouteData({ origin: '', destination: '', companyId: '' });
        } catch (error) {
            console.error("Error creating route:", error);
            alert("Error al crear ruta.");
        }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Registrar Nueva Ruta</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
                type="text" 
                value={newRouteData.origin}
                onChange={(e) => setNewRouteData({...newRouteData, origin: e.target.value})}
                placeholder="Ciudad de Origen"
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input 
                type="text" 
                value={newRouteData.destination}
                onChange={(e) => setNewRouteData({...newRouteData, destination: e.target.value})}
                placeholder="Ciudad de Destino"
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <select 
                value={newRouteData.companyId}
                onChange={(e) => setNewRouteData({...newRouteData, companyId: e.target.value})}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            >
                <option value="">Selecciona una Empresa</option>
                {companies.map(c => (
                    <option key={`create-select-${c._id}`} value={c._id}>{c.name}</option>
                ))}
            </select>
        </div>
        <div className="mt-4 flex justify-end">
            <button 
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
                Guardar Ruta
            </button>
        </div>
    </form>
  );
}
