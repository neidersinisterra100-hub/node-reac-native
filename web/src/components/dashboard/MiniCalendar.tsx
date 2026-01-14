import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export function MiniCalendar() {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  // Mock days for visual representation
  const dates = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
            <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} className="text-gray-400" /></button>
            <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} className="text-gray-400" /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {days.map(d => <span key={d} className="text-gray-400 font-medium">{d}</span>)}
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs flex-1">
        {dates.map(date => {
            const isSelected = date === 15;
            const isRange = date === 16 || date === 17;
            const isToday = date === 8;
            
            return (
                <div 
                    key={date} 
                    className={clsx(
                        "flex items-center justify-center rounded-sm h-6 w-6 mx-auto cursor-pointer",
                        isSelected ? "bg-dashboard-navy text-white" : 
                        isRange ? "bg-blue-100 text-dashboard-navy" :
                        isToday ? "bg-dashboard-orange text-white" : "text-gray-600 hover:bg-gray-50"
                    )}
                >
                    {date}
                </div>
            )
        })}
      </div>
    </div>
  );
}
