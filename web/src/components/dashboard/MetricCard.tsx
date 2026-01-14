import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon?: LucideIcon;
  iconColor?: string; // e.g., 'text-dashboard-orange'
}

export function MetricCard({ title, value, icon: Icon, iconColor = 'text-dashboard-orange' }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-dashboard-navy">{value}</span>
        {/* Aquí podríamos poner un indicador de tendencia si fuera necesario, como en la imagen del dolar */}
      </div>
    </div>
  );
}
