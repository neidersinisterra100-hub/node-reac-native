import { Moon, Sun, LogOut, FileText } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const { toggleTheme, isDark } = useTheme();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-dashboard-navy dark:text-white mb-6">Configuración</h2>

      {/* Apariencia */}
      <div className="bg-white dark:bg-dashboard-blue rounded-xl shadow-sm p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
          Apariencia
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-orange-100 text-orange-500'}`}>
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Modo Oscuro</p>     
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isDark ? 'Activado' : 'Desactivado'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none       
              ${isDark ? 'bg-dashboard-orange' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                ${isDark ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Legal */}
      <div className="bg-white dark:bg-dashboard-blue rounded-xl shadow-sm p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
          Información Legal
        </h3>

        <div className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/terms')}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <FileText size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Términos y Condiciones</p>   
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reglas de uso de la plataforma
              </p>
            </div>
          </div>
          <div className="text-gray-400">
             ›
          </div>
        </div>
      </div>

      {/* Sesión */}
      <div className="bg-white dark:bg-dashboard-blue rounded-xl shadow-sm p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
          Sesión
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400">
              <LogOut size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Cerrar Sesión</p>   
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Finalizar tu sesión actual de forma segura
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg font-medium transition-colors duration-200"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};
