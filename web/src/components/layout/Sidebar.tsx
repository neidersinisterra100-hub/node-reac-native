import { Home, User, Settings, Briefcase, Map, Navigation, BarChart } from 'lucide-react';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const allNavItems = [
  { icon: Home, label: 'Dashboard', path: '/', roles: ['admin', 'owner', 'user'] },
  { icon: User, label: 'Perfil', path: '/profile', roles: ['admin', 'owner', 'user'] },
  { icon: Briefcase, label: 'Crear Empresa', path: '/companies', roles: ['admin', 'owner'] },
  { icon: Map, label: 'Ver Rutas', path: '/routes', roles: ['admin', 'owner', 'user'] },
  { icon: Navigation, label: 'Ver Viajes', path: '/trips', roles: ['admin', 'owner', 'user'] },
  { icon: BarChart, label: 'Reportes', path: '/reports', roles: ['admin', 'owner'] }, // 👈 Nuevo
  { icon: Settings, label: 'Configuración', path: '/settings', roles: ['admin', 'owner', 'user'] },
];

export function Sidebar() {
  const location = useLocation();
  const user = useAuthStore(state => state.user);
  const userRole = user?.role || 'user';
  const setSelectedCompany = useAuthStore(state => state.setSelectedCompany); // Necesitamos esto para limpiar

  const handleNavClick = () => {
      // Si el usuario hace clic en cualquier ítem del menú (Dashboard, Rutas, Viajes),
      // reseteamos la empresa seleccionada para que vea "Todo".
      // Solo mantenemos la selección si la navegación fuera interna (ej. de empresa a ruta),
      // pero el Sidebar es navegación global.
      setSelectedCompany(null);
  };

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-dashboard-navy text-white flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="p-8 flex flex-col items-center border-b border-gray-700/30">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 overflow-hidden">
            <User className="w-12 h-12 text-dashboard-navy" />
        </div>
        <h2 className="text-xl font-bold tracking-wide uppercase">{user?.name || 'User'}</h2>
        <p className="text-xs text-gray-400 mt-1">{user?.email || 'email@example.com'}</p>
      </div>

      <nav className="flex-1 py-6 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  onClick={handleNavClick}
                  className={clsx(
                    "flex items-center gap-4 px-6 py-3 rounded-lg transition-colors duration-200 group",
                    isActive ? "text-dashboard-orange bg-white/5" : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon size={20} className={clsx(
                      "transition-colors",
                      isActive ? "text-dashboard-orange" : "group-hover:text-white"
                  )} />
                  <span className="capitalize text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
