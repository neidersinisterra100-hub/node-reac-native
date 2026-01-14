import { useLocation } from 'react-router-dom';

export const EmptyPage = () => {
  const location = useLocation();
  const title = location.pathname.substring(1).replace('-', ' ').toUpperCase();

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-dashboard-navy mb-4">{title}</h2>
      <p className="text-gray-500">Esta funcionalidad estará disponible pronto.</p>
    </div>
  );
};
