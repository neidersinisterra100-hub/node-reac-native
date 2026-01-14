import { Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function Header() {
  const selectedCompany = useAuthStore(state => state.selectedCompany);
  const user = useAuthStore(state => state.user);

  const title = selectedCompany ? (
      <div className="flex flex-col ">
          <span className="text-sm text-gray-500 font-normal">Empresa Seleccionada</span>
          <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse drop-shadow-sm filter">
              {selectedCompany.name}
          </span>
      </div>
  ) : (user?.role === 'owner' ? 'Panel de Control' : 'Dashboard User');

  return (
    <header className="flex items-center justify-between  py-6 mb-8">
      <div className="text-2xl font-semibold text-gray-800 dark:text-white transition-colors duration-200">
          {title}
      </div>
      <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
        <Menu size={24} />
      </button>
    </header>
  );
}
