import { useState, useEffect } from 'react';
// import { useAuthStore } from '../store/authStore';
import { getMyCompanies, getCompanyAdmins, Company, CompanyAdmin } from '../services/company.service';
import { calendarService, Schedule } from '../services/calendar.service';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, UserCheck } from 'lucide-react';

export default function AdminCalendar() {
    // const user = useAuthStore(state => state.user);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [companyAdmins, setCompanyAdmins] = useState<CompanyAdmin[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. Cargar Empresas al inicio
    useEffect(() => {
        loadCompanies();
    }, []);

    // 2. Cargar Admins y Horarios cuando cambia la empresa o el mes
    useEffect(() => {
        if (selectedCompanyId) {
            loadAdmins(selectedCompanyId);
            loadSchedules(selectedCompanyId, currentDate);
        }
    }, [selectedCompanyId, currentDate]);

    const loadCompanies = async () => {
        try {
            const data = await getMyCompanies();
            setCompanies(data);
            if (data.length > 0) setSelectedCompanyId(data[0]._id);
        } catch (error) {
            console.error("Error loading companies", error);
        }
    };

    const loadAdmins = async (companyId: string) => {
        try {
            const data = await getCompanyAdmins(companyId);
            setCompanyAdmins(data);
        } catch (error) {
            console.error("Error loading admins", error);
        }
    };

    const loadSchedules = async (companyId: string, date: Date) => {
        setLoading(true);
        try {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const data = await calendarService.getSchedule(companyId, year, month);
            setSchedules(data);
        } catch (error) {
            console.error("Error loading schedules", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignAdmin = async (day: number, adminId: string) => {
        if (!selectedCompanyId) return;
        
        // Crear fecha en UTC para evitar problemas de zona horaria al guardar
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dateToAssign = new Date(year, month, day);

        try {
            await calendarService.setSchedule({
                date: dateToAssign,
                companyId: selectedCompanyId,
                adminId: adminId,
                active: true
            });
            // Recargar para ver cambios
            loadSchedules(selectedCompanyId, currentDate);
        } catch (error) {
            alert("Error al asignar turno");
        }
    };

    // Helpers de Calendario
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

    // Buscar si hay un schedule para un día específico
    const getScheduleForDay = (day: number) => {
        return schedules.find(s => {
            const sDate = new Date(s.date);
            return sDate.getDate() === day;
        });
    };

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" />
                        Calendario de Turnos
                    </h1>
                    <p className="text-gray-500 text-sm">Asigna qué administrador trabaja cada día.</p>
                </div>
                
                {/* Selector de Empresa */}
                <div className="w-full md:w-64">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empresa</label>
                    <select 
                        value={selectedCompanyId} 
                        onChange={(e) => setSelectedCompanyId(e.target.value)} 
                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    >
                        {companies.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Controles del Mes */}
            <div className="bg-white dark:bg-gray-800 rounded-t-xl p-4 flex justify-between items-center border-b dark:border-gray-700 shadow-sm">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <ChevronLeft className="dark:text-white" />
                </button>
                <h2 className="text-lg md:text-xl font-bold capitalize text-gray-800 dark:text-white">
                    {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <ChevronRight className="dark:text-white" />
                </button>
            </div>

            {/* Grid Calendario (Scrollable en Mobile) */}
            <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm border border-t-0 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]"> {/* Ancho mínimo para forzar scroll en móviles pequeños */}
                        
                        {/* Cabecera Días */}
                        <div className="grid grid-cols-7 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
                                <div key={day} className="p-3 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Días del Mes */}
                        <div className="grid grid-cols-7 bg-gray-200 dark:bg-gray-700 gap-px border-b dark:border-gray-700">
                            {blanks.map(i => (
                                <div key={`blank-${i}`} className="h-32 bg-gray-50 dark:bg-gray-800"></div>
                            ))}
                            
                            {days.map(day => {
                                const schedule = getScheduleForDay(day);
                                const hasAdmin = !!schedule;
                                const adminName = typeof schedule?.admin === 'object' ? schedule.admin.name : 'Desconocido';

                                return (
                                    <div key={day} className="h-32 bg-white dark:bg-gray-800 p-2 relative group hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <span className={`text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full ${hasAdmin ? 'bg-blue-100 text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {day}
                                        </span>
                                        
                                        {/* Slot de Asignación */}
                                        <div className="mt-2 h-full">
                                            {loading ? (
                                                <div className="flex justify-center mt-4"><Loader2 className="animate-spin w-4 h-4 text-gray-400"/></div>
                                            ) : hasAdmin ? (
                                                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-2 rounded-lg text-xs border border-blue-200 dark:border-blue-800">
                                                    <div className="font-bold flex items-center gap-1 mb-1">
                                                        <UserCheck size={12} />
                                                        Asignado
                                                    </div>
                                                    <div className="truncate" title={adminName}>{adminName}</div>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-center text-gray-400 mt-6 group-hover:hidden">
                                                    - Libre -
                                                </div>
                                            )}

                                            {/* Overlay Hover para asignar */}
                                            <div className="hidden group-hover:flex flex-col gap-1 absolute inset-0 bg-white/95 dark:bg-gray-800/95 p-2 items-center justify-center z-10 transition-opacity animate-in fade-in duration-200">
                                                <span className="text-xs font-bold mb-2 text-gray-600 dark:text-gray-300">Asignar turno:</span>
                                                <div className="w-full overflow-y-auto max-h-[80px] space-y-1 custom-scrollbar">
                                                    {companyAdmins.length === 0 ? (
                                                        <p className="text-xs text-red-500 text-center">No hay admins</p>
                                                    ) : (
                                                        companyAdmins.map(admin => (
                                                            <button 
                                                                key={admin._id} 
                                                                onClick={() => handleAssignAdmin(day, admin._id)} 
                                                                className={`text-xs w-full px-2 py-1 rounded truncate text-left transition-colors ${
                                                                    schedule?.admin && (typeof schedule.admin === 'object' ? schedule.admin._id === admin._id : schedule.admin === admin._id)
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900'
                                                                }`}
                                                            >
                                                                {admin.name}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
