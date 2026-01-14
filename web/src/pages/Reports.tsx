import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getOccupancyReport, getSalesReport, OccupancyReport, SalesReport } from '../services/report.service';
import { FileText, Loader2, TrendingUp, Users } from 'lucide-react';

// Registrar componentes de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [occupancyData, setOccupancyData] = useState<OccupancyReport[]>([]);
  const [dateRange, setDateRange] = useState({
      from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Últimos 30 días
      to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Intentar cargar ventas
      try {
        const sales = await getSalesReport(dateRange.from, dateRange.to);
        setSalesData(sales);
      } catch (err) {
        console.error("Error loading sales report:", err);
        // Opcional: Mostrar notificación de error específico
      }

      // Intentar cargar ocupación
      try {
        const occupancy = await getOccupancyReport();
        setOccupancyData(occupancy);
      } catch (err) {
        console.error("Error loading occupancy report:", err);
      }
      
    } catch (error) {
      console.error("Critical error in reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Configuración Gráfica Ventas
  const salesChartData = {
    labels: salesData.map(d => d._id),
    datasets: [
      {
        label: 'Ventas ($)',
        data: salesData.map(d => d.totalSales),
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // Blue-500
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const salesOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Ventas Diarias' },
    },
  };

  // Configuración Gráfica Ocupación (Promedio General)
  const avgOccupancy = occupancyData.length 
    ? occupancyData.reduce((acc, curr) => acc + curr.occupancyRate, 0) / occupancyData.length 
    : 0;
  
  const occupancyChartData = {
      labels: ['Ocupado', 'Disponible'],
      datasets: [
          {
              data: [avgOccupancy, 100 - avgOccupancy],
              backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(229, 231, 235, 0.6)'],
              borderColor: ['rgb(16, 185, 129)', 'rgb(229, 231, 235)'],
              borderWidth: 1,
          }
      ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-500">Analiza el rendimiento de tu empresa</p>
        </div>
        
        {/* Filtro Fechas Simple */}
        <div className="flex gap-2">
            <input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="border rounded px-2 py-1"
            />
            <span className="self-center">-</span>
            <input 
                type="date" 
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="border rounded px-2 py-1"
            />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ventas Totales (Periodo)</p>
                            <h3 className="text-2xl font-bold">
                                ${salesData.reduce((acc, curr) => acc + curr.totalSales, 0).toLocaleString('es-CO')}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tickets Vendidos</p>
                            <h3 className="text-2xl font-bold">
                                {salesData.reduce((acc, curr) => acc + curr.ticketsCount, 0)}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ocupación Promedio</p>
                            <h3 className="text-2xl font-bold">
                                {Math.round(avgOccupancy)}%
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ventas */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <Bar options={salesOptions} data={salesChartData} />
                </div>

                {/* Ocupación */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Ocupación Global</h3>
                    <div className="w-64 h-64">
                        <Doughnut data={occupancyChartData} />
                    </div>
                    <p className="text-sm text-gray-500 mt-4 text-center">
                        Basado en viajes futuros y recientes activos.
                    </p>
                </div>
            </div>

            {/* Tabla Ocupación Detallada */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Detalle de Ocupación por Viaje</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Fecha</th>
                                <th className="px-6 py-3 font-medium">Capacidad</th>
                                <th className="px-6 py-3 font-medium">Vendidos</th>
                                <th className="px-6 py-3 font-medium">Ocupación</th>
                                <th className="px-6 py-3 font-medium">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {occupancyData.map((trip) => (
                                <tr key={trip.tripId} className="hover:bg-gray-50">
                                    <td className="px-6 py-3">
                                        {new Date(trip.date).toLocaleDateString()} {new Date(trip.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                    <td className="px-6 py-3">{trip.capacity}</td>
                                    <td className="px-6 py-3">{trip.sold}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full ${trip.occupancyRate > 80 ? 'bg-red-500' : trip.occupancyRate > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                    style={{ width: `${trip.occupancyRate}%` }}
                                                />
                                            </div>
                                            <span>{trip.occupancyRate}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        {trip.occupancyRate >= 100 ? (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Lleno</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Disponible</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {occupancyData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No hay viajes activos para mostrar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
      )}
    </div>
  );
}
