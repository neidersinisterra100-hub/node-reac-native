import { User, Mail, Shield, Calendar, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Profile() {
  const user = useAuthStore(state => state.user);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">No hay información de usuario disponible.</p>
      </div>
    );
  }

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'owner':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'user':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'owner': return 'Dueño de Empresa';
      case 'user': return 'Usuario';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 bg-dashboard-navy rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-medium mt-2 inline-block ${getRoleBadgeColor(user.role)}`}>
            {getRoleLabel(user.role)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Personal */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
            Información Personal
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <User className="text-gray-500 dark:text-gray-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre Completo</p>
                <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Mail className="text-gray-500 dark:text-gray-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Correo Electrónico</p>
                <p className="font-medium text-gray-800 dark:text-white">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Shield className="text-gray-500 dark:text-gray-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rol del Sistema</p>
                <p className="font-medium text-gray-800 dark:text-white capitalize">{getRoleLabel(user.role)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles de la Cuenta */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
            Detalles de la Cuenta
          </h3>

          <div className="space-y-6">
             <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Calendar className="text-gray-500 dark:text-gray-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Registro</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'No disponible'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Clock className="text-gray-500 dark:text-gray-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
                <p className="font-medium text-gray-800 dark:text-white">
                   {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'No disponible'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
