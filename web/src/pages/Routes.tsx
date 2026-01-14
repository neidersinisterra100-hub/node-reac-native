import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Map as MapIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useRoutes } from '../hooks/useRoutes';
import { RouteForm } from '../components/routes/RouteForm';
import { RouteCard } from '../components/routes/RouteCard';
import { isPopulatedCompany } from '../utils/typeGuards';
import { Route } from '../services/route.service';

export function RoutesPage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const setSelectedCompany = useAuthStore(state => state.setSelectedCompany);

  const { 
    routes, 
    companies, 
    loading, 
    isOwner, 
    isAdmin,
    canToggle, 
    selectedCompanyId, 
    selectedCompany,
    toggleActive, 
    deleteRoute, 
    addRoute 
  } = useRoutes();

  const handleRouteClick = (route: Route) => {
      if (!selectedCompanyId) {
          const routeCompId = isPopulatedCompany(route.company) ? route.company._id : route.company;
          const company = companies.find(c => c._id === routeCompId);
          if (company) {
              setSelectedCompany({ _id: company._id, name: company.name });
          }
      }
      navigate('/trips', { state: { filterRouteId: route._id } });
  };

  // Filtrado de rutas
  const filteredRoutes = routes.filter(r => {
      const routeCompanyId = isPopulatedCompany(r.company) ? r.company._id : r.company;

      // Filtro de empresa seleccionada
      if (selectedCompanyId && routeCompanyId !== selectedCompanyId) return false;

      // Filtro de rol
      if (isAdmin || isOwner) return true;
      
      // Usuario normal: verificar si la empresa está activa
      if (isPopulatedCompany(r.company)) {
          return r.company.active;

      }
      
      const company = companies.find(c => c._id === routeCompanyId);
      return company && company.active;
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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Rutas</h2>
            <p className="text-gray-500 dark:text-gray-400">
                {isOwner ? "Gestiona las rutas de tus empresas" : "Rutas disponibles para viajar"}
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
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
            )}

            {isOwner && (
                <button 
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-dashboard-navy hover:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
                <Plus size={20} />
                <span>{isCreating ? 'Cancelar' : 'Nueva Ruta'}</span>
                </button>
            )}
        </div>
      </div>

      {isCreating && (
        <RouteForm 
            companies={companies}
            onSuccess={(newRoute) => {
                addRoute(newRoute);
                setIsCreating(false);
            }}
            onCancel={() => setIsCreating(false)}
        />
      )}

      {filteredRoutes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapIcon className="text-gray-400 dark:text-gray-500" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {isOwner 
                    ? (routes.length > 0 ? "No hay rutas para empresas activas" : "No tienes rutas registradas")
                    : "No hay rutas disponibles por el momento"
                }
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                {isOwner 
                    ? (routes.length > 0 ? "Activa una empresa para ver sus rutas." : "Crea rutas para asignar a tus viajes.")
                    : "Intenta de nuevo más tarde."
                }
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => (
            <RouteCard 
                key={`${route._id}-${isPopulatedCompany(route.company) ? route.company._id : route.company}`} 
                route={route}
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                selectedCompanyName={selectedCompany?.name}
                canToggle={canToggle}
                isOwner={isOwner}
                onClick={handleRouteClick}
                onToggleActive={toggleActive}
                onDelete={deleteRoute}
            />
          ))}
        </div>
      )}
    </div>
  );
}
