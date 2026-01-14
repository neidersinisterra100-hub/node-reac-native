import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ['Completed', 'Remaining'],
  datasets: [
    {
      data: [45, 55],
      backgroundColor: [
        '#1a2236', // Navy for the 45% part
        '#ffa500', // Orange for the rest (as per design interpretation, or maybe gray/white)
        // Revisando la imagen: El 45% es azul oscuro (navy), el resto es naranja.
      ],
      borderWidth: 0,
      cutout: '75%', // Thinner donut
    },
  ],
};

const options = {
    plugins: {
        tooltip: { enabled: false },
        legend: { display: false }
    }
}

export function DonutChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col items-center justify-between">
      <div className="relative w-40 h-40">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-dashboard-navy">45%</span>
        </div>
      </div>
      
      <div className="w-full space-y-2 mt-4">
          {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="text-center text-gray-400 text-sm">
                  Lorem ipsum
              </div>
          ))}
      </div>

      <button className="mt-4 bg-dashboard-orange text-white text-sm px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors w-full">
        Check Now
      </button>
    </div>
  );
}
