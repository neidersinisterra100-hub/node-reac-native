import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
        mode: 'index' as const,
        intersect: false,
    }
  },
  elements: {
      line: {
          tension: 0.4 // Smooth curves
      }
  },
  scales: {
    x: {
      display: false, // Ocultar eje X para limpiar visualmente como en el diseño
    },
    y: {
      display: false, // Ocultar eje Y
    },
  },
};

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const data = {
  labels,
  datasets: [
    {
      fill: true,
      label: 'Lorem ipsum',
      data: [30, 50, 40, 60, 40, 70, 50],
      borderColor: '#ffa500', // Orange
      backgroundColor: 'rgba(255, 165, 0, 0.2)',
      borderWidth: 2,
      pointRadius: 0,
    },
    {
      fill: true,
      label: 'Dolor amet',
      data: [20, 40, 30, 50, 30, 60, 40],
      borderColor: '#1a2236', // Navy
      backgroundColor: 'rgba(26, 34, 54, 0.2)',
      borderWidth: 2,
      pointRadius: 0,
    },
  ],
};

export function AreaChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col">
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-dashboard-orange"></span>
            <span className="text-xs text-gray-500">Lorem ipsum</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-dashboard-navy"></span>
            <span className="text-xs text-gray-500">Dolor amet</span>
        </div>
      </div>
      <div className="flex-1 min-h-[150px]">
        <Line options={options} data={data} />
      </div>
    </div>
  );
}
