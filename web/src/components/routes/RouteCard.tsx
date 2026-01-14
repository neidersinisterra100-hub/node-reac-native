import { Navigation, Power, Trash2, Building2 } from 'lucide-react';
import { Route } from '../../services/route.service';
import { Company } from '../../services/company.service';
import { isPopulatedCompany } from '../../utils/typeGuards';

interface RouteCardProps {
  route: Route;
  companies: Company[];
  selectedCompanyId: string | null;
  selectedCompanyName: string | undefined;
  canToggle: boolean;
  isOwner: boolean;
  onClick: (route: Route) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export function RouteCard({ 
  route, 
  companies, 
  selectedCompanyId, 
  selectedCompanyName,
  canToggle, 
  isOwner, 
  onClick, 
  onToggleActive, 
  onDelete 
}: RouteCardProps) {

  const getCompanyName = (route: Route) => {
      // 1. Intentar obtener del objeto populado
      if (isPopulatedCompany(route.company)) {
          return route.company.name;
      }
      
      // 2. Si es ID, buscar en la lista cargada
      const routeCompanyId = route.company as string;
      const company = companies.find(c => c._id === routeCompanyId);
      if (company) return company.name;
      
      // 3. Fallback seguro al seleccionado (solo si coincide ID)
      if (selectedCompanyId && selectedCompanyId === routeCompanyId && selectedCompanyName) {
          return selectedCompanyName;
      }

      return 'Empresa desconocida';
  };

  const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleActive(route._id, route.active);
  };

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      const confirmed = window.confirm("⚠️ ¿Eliminar esta ruta?\n\nSe eliminarán los viajes asociados.");
      if (!confirmed) return;
      onDelete(route._id);
  };

  return (
    <div 
        onClick={() => onClick(route)}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <Navigation className="text-indigo-600 dark:text-indigo-400" size={24} />
        </div>
        <div className="flex items-center gap-2">
            {canToggle && (
                <>
                    <button 
                        onClick={handleToggle}
                        title={route.active ? "Desactivar" : "Activar"}
                        className={`p-2 rounded-full transition-all duration-200 ${
                        route.active 
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
                    route.active 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                    {route.active ? 'Activa' : 'Inactiva'}
                </span>
            )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{route.name}</h3>
      
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Building2 size={16} />
          <span>{getCompanyName(route)}</span>
      </div>

      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Origen</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{route.origin}</span>
        </div>
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destino</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{route.destination}</span>
        </div>
      </div>
    </div>
  );
}
