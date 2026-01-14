import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Ocultamos la leyenda por defecto para personalizarla o simplificar como en el diseño
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 10,
        },
        color: '#9ca3af',
      }
    },
    y: {
      display: true, // Mostramos eje Y para referencia
      border: {
          display: false
      },
      grid: {
          color: '#f3f4f6',
      },
      ticks: {
          display: true, // En el diseño hay números a la izquierda, aunque pequeños
          font: {
            size: 10
          },
          color: '#9ca3af',
          stepSize: 10
      }
    },
  },
  barPercentage: 0.6,
  categoryPercentage: 0.8,
};

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const data = {
  labels,
  datasets: [
    {
      label: '2019',
      data: [30, 45, 25, 60, 35, 80, 40, 50, 30, 45, 25, 40], // Mock data
      backgroundColor: '#1a2236', // dashboard-navy
      borderRadius: 4,
    },
    {
      label: '2020',
      data: [20, 35, 50, 40, 65, 50, 70, 45, 20, 35, 50, 40], // Mock data
      backgroundColor: '#ffa500', // dashboard-orange
      borderRadius: 4,
    },
  ],
};

export function BarChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-500 font-medium">Result</h3>
        <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1 text-xs text-right text-gray-400">
                <span className="flex items-center gap-1 justify-end"><span className="w-2 h-2 bg-dashboard-navy rounded-sm"></span>2019</span>
                <span className="flex items-center gap-1 justify-end"><span className="w-2 h-2 bg-dashboard-orange rounded-sm"></span>2020</span>
            </div>
            <button className="bg-dashboard-orange text-white text-xs px-3 py-1.5 rounded-full hover:bg-orange-600 transition-colors">
            Check Now
            </button>
        </div>
      </div>
      <div className="flex-1 min-h-[200px]">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
}
