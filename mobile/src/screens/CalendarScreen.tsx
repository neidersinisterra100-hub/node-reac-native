import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import {
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react-native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";

import {
  calendarService,
  Schedule,
} from "../services/calendar.service";
import {
  getMyCompanies,
  getCompanyAdmins,
  Company,
  CompanyAdmin,
} from "../services/company.service";

export default function CalendarScreen() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [companyAdmins, setCompanyAdmins] = useState<CompanyAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdminPicker, setShowAdminPicker] = useState<number | null>(null);

  /* =========================
     LOAD INITIAL DATA
  ========================= */
  useEffect(() => {
    loadCompanies();
  }, []);

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
      if (data.length > 0) setSelectedCompanyId(data[0].id);
    } catch (e) {
      console.error("Error loading companies", e);
    }
  };

  const loadAdmins = async (companyId: string) => {
    try {
      const data = await getCompanyAdmins(companyId);
      setCompanyAdmins(data);
    } catch (e) {
      console.error("Error loading admins", e);
    }
  };

  const loadSchedules = async (companyId: string, date: Date) => {
    setLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const data = await calendarService.getSchedule(
        companyId,
        year,
        month
      );
      setSchedules(data);
    } catch (e) {
      console.error("Error loading schedules", e);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CALENDAR HELPERS
  ========================= */
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth });

  const handlePrevMonth = () =>
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1
      )
    );

  const handleNextMonth = () =>
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      )
    );

  const getScheduleForDay = (day: number) =>
    schedules.find((s) => {
      const d = new Date(s.date);
      return d.getDate() === day;
    });

  const handleAssignAdmin = async (day: number, adminId: string) => {
    if (!selectedCompanyId) return;

    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    try {
      await calendarService.setSchedule({
        date,
        companyId: selectedCompanyId,
        adminId,
        active: true,
      });
      loadSchedules(selectedCompanyId, currentDate);
      setShowAdminPicker(null);
    } catch (e) {
      console.error("Error assigning admin", e);
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <AppContainer>
      <AppHeader title="Calendario de Turnos" showBack />

      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {/* ================= COMPANY SELECTOR ================= */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Empresa
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {companies.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCompanyId(c.id)}
                className={`px-4 py-2 mr-2 rounded-full border
                  ${
                    selectedCompanyId === c.id
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }
                `}
              >
                <Text
                  className={`text-sm font-medium
                    ${
                      selectedCompanyId === c.id
                        ? "text-white"
                        : "text-slate-700 dark:text-slate-200"
                    }
                  `}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ================= MONTH HEADER ================= */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={handlePrevMonth} className="p-2">
            <ChevronLeft size={24} className="text-slate-700 dark:text-slate-200" />
          </TouchableOpacity>

          <Text className="text-lg font-bold capitalize text-slate-800 dark:text-slate-100">
            {currentDate.toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </Text>

          <TouchableOpacity onPress={handleNextMonth} className="p-2">
            <ChevronRight size={24} className="text-slate-700 dark:text-slate-200" />
          </TouchableOpacity>
        </View>

        {/* ================= CALENDAR ================= */}
        <View className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm">
          {/* DAY HEADERS */}
          <View className="flex-row mb-2">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
              <View key={d} className="flex-1 items-center">
                <Text className="text-xs font-semibold text-slate-400">
                  {d}
                </Text>
              </View>
            ))}
          </View>

          {/* DAYS GRID */}
          <View className="flex-row flex-wrap">
            {blanks.map((_, i) => (
              <View key={`b-${i}`} className="w-[14.28%] aspect-square" />
            ))}

            {days.map((day) => {
              const schedule = getScheduleForDay(day);
              const hasAdmin = !!schedule;
              const adminName =
                typeof schedule?.admin === "object"
                  ? schedule.admin.name
                  : "";

              return (
                <TouchableOpacity
                  key={day}
                  onPress={() =>
                    setShowAdminPicker(
                      showAdminPicker === day ? null : day
                    )
                  }
                  className={`w-[14.28%] aspect-square border border-slate-100 dark:border-slate-800 items-center justify-center relative
                    ${hasAdmin ? "bg-blue-50 dark:bg-blue-900/30" : ""}
                  `}
                >
                  <Text
                    className={`text-sm font-semibold mb-1
                      ${
                        hasAdmin
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-700 dark:text-slate-200"
                      }
                    `}
                  >
                    {day}
                  </Text>

                  {loading ? (
                    <ActivityIndicator size="small" />
                  ) : hasAdmin ? (
                    <View className="flex-row items-center bg-blue-100 dark:bg-blue-800 px-1 rounded">
                      <UserCheck size={12} className="text-blue-600 dark:text-blue-300" />
                      <Text
                        numberOfLines={1}
                        className="text-[10px] ml-1 text-blue-700 dark:text-blue-200"
                      >
                        {adminName}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-[10px] text-slate-300">-</Text>
                  )}

                  {/* ADMIN PICKER */}
                  {showAdminPicker === day && (
                    <View className="absolute inset-0 bg-white dark:bg-slate-800 z-20 p-2 rounded-lg">
                      <Text className="text-xs font-bold text-center mb-2 text-slate-700 dark:text-slate-200">
                        Asignar turno
                      </Text>

                      <ScrollView>
                        {companyAdmins.length === 0 ? (
                          <Text className="text-xs text-red-500 text-center">
                            No hay admins
                          </Text>
                        ) : (
                          companyAdmins.map((admin) => (
                            <TouchableOpacity
                              key={admin._id}
                              onPress={() =>
                                handleAssignAdmin(day, admin._id)
                              }
                              className="px-2 py-1 mb-1 bg-slate-100 dark:bg-slate-700 rounded"
                            >
                              <Text className="text-xs text-slate-800 dark:text-slate-100">
                                {admin.name}
                              </Text>
                            </TouchableOpacity>
                          ))
                        )}
                      </ScrollView>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>
    </AppContainer>
  );
}



// import React, { useEffect, useState } from 'react';
// import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
// import { Text, ActivityIndicator } from 'react-native-paper';
// import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, UserCheck } from 'lucide-react-native';

// import AppContainer from '../components/ui/AppContainer';
// import AppHeader from '../components/ui/AppHeader';
// import { useTheme } from '../context/ThemeContext';
// import { calendarService, Schedule } from '../services/calendar.service';
// import { getMyCompanies, getCompanyAdmins, Company, CompanyAdmin } from '../services/company.service';

// const { width } = Dimensions.get('window');

// export default function CalendarScreen() {
//     const { theme } = useTheme();
//     const [companies, setCompanies] = useState<Company[]>([]);
//     const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
//     const [currentDate, setCurrentDate] = useState(new Date());
//     const [schedules, setSchedules] = useState<Schedule[]>([]);
//     const [companyAdmins, setCompanyAdmins] = useState<CompanyAdmin[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [showAdminPicker, setShowAdminPicker] = useState<number | null>(null);

//     // Load companies on mount
//     useEffect(() => {
//         loadCompanies();
//     }, []);

//     // Load admins and schedules when company or month changes
//     useEffect(() => {
//         if (selectedCompanyId) {
//             loadAdmins(selectedCompanyId);
//             loadSchedules(selectedCompanyId, currentDate);
//         }
//     }, [selectedCompanyId, currentDate]);

//     const loadCompanies = async () => {
//         try {
//             const data = await getMyCompanies();
//             setCompanies(data);
//             if (data.length > 0) setSelectedCompanyId(data[0].id);
//         } catch (error) {
//             console.error("Error loading companies", error);
//         }
//     };

//     const loadAdmins = async (companyId: string) => {
//         try {
//             const data = await getCompanyAdmins(companyId);
//             setCompanyAdmins(data);
//         } catch (error) {
//             console.error("Error loading admins", error);
//         }
//     };

//     const loadSchedules = async (companyId: string, date: Date) => {
//         setLoading(true);
//         try {
//             const year = date.getFullYear();
//             const month = date.getMonth() + 1;
//             const data = await calendarService.getSchedule(companyId, year, month);
//             setSchedules(data);
//         } catch (error) {
//             console.error("Error loading schedules", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAssignAdmin = async (day: number, adminId: string) => {
//         if (!selectedCompanyId) return;

//         const year = currentDate.getFullYear();
//         const month = currentDate.getMonth();
//         const dateToAssign = new Date(year, month, day);

//         try {
//             await calendarService.setSchedule({
//                 date: dateToAssign,
//                 companyId: selectedCompanyId,
//                 adminId: adminId,
//                 active: true
//             });
//             // Reload schedules
//             loadSchedules(selectedCompanyId, currentDate);
//             setShowAdminPicker(null);
//         } catch (error) {
//             console.error("Error assigning admin", error);
//         }
//     };

//     // Calendar helpers
//     const getDaysInMonth = (date: Date) => {
//         return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//     };

//     const getFirstDayOfMonth = (date: Date) => {
//         return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
//     };

//     const daysInMonth = getDaysInMonth(currentDate);
//     const firstDay = getFirstDayOfMonth(currentDate);
//     const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
//     const blanks = Array.from({ length: firstDay }, (_, i) => i);

//     const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
//     const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

//     const getScheduleForDay = (day: number) => {
//         return schedules.find(s => {
//             const sDate = new Date(s.date);
//             return sDate.getDate() === day;
//         });
//     };

//     const styles = getStyles(theme);

//     return (
//         <AppContainer>
//             <AppHeader title="Calendario de Turnos" showBack />

//             <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
//                 {/* Company Selector */}
//                 <View style={styles.selectorContainer}>
//                     <Text style={styles.selectorLabel}>Empresa</Text>
//                     <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.companyScroll}>
//                         {companies.map(c => (
//                             <TouchableOpacity
//                                 key={c.id}
//                                 onPress={() => setSelectedCompanyId(c.id)}
//                                 style={[
//                                     styles.companyChip,
//                                     selectedCompanyId === c.id && styles.companyChipActive
//                                 ]}
//                             >
//                                 <Text style={[
//                                     styles.companyChipText,
//                                     selectedCompanyId === c.id && styles.companyChipTextActive
//                                 ]}>
//                                     {c.name}
//                                 </Text>
//                             </TouchableOpacity>
//                         ))}
//                     </ScrollView>
//                 </View>

//                 {/* Month Navigation */}
//                 <View style={styles.monthHeader}>
//                     <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
//                         <ChevronLeft size={24} color={theme.colors.textPrimary} />
//                     </TouchableOpacity>
//                     <Text style={styles.monthTitle}>
//                         {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
//                     </Text>
//                     <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
//                         <ChevronRight size={24} color={theme.colors.textPrimary} />
//                     </TouchableOpacity>
//                 </View>

//                 {/* Calendar Grid */}
//                 <View style={styles.calendarContainer}>
//                     {/* Day Headers */}
//                     <View style={styles.dayHeaderRow}>
//                         {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
//                             <View key={day} style={styles.dayHeader}>
//                                 <Text style={styles.dayHeaderText}>{day}</Text>
//                             </View>
//                         ))}
//                     </View>

//                     {/* Calendar Days */}
//                     <View style={styles.daysGrid}>
//                         {blanks.map(i => (
//                             <View key={`blank-${i}`} style={styles.dayCell} />
//                         ))}

//                         {days.map(day => {
//                             const schedule = getScheduleForDay(day);
//                             const hasAdmin = !!schedule;
//                             const adminName = typeof schedule?.admin === 'object' ? schedule.admin.name : 'Desconocido';
//                             const isPickerOpen = showAdminPicker === day;

//                             return (
//                                 <TouchableOpacity
//                                     key={day}
//                                     style={[styles.dayCell, hasAdmin && styles.dayCellAssigned]}
//                                     onPress={() => setShowAdminPicker(isPickerOpen ? null : day)}
//                                 >
//                                     <Text style={[styles.dayNumber, hasAdmin && styles.dayNumberAssigned]}>
//                                         {day}
//                                     </Text>
//                                     {loading ? (
//                                         <ActivityIndicator size="small" color="#3b82f6" />
//                                     ) : hasAdmin ? (
//                                         <View style={styles.adminBadge}>
//                                             <UserCheck size={12} color="#2563eb" />
//                                             <Text style={styles.adminName} numberOfLines={1}>{adminName}</Text>
//                                         </View>
//                                     ) : (
//                                         <Text style={styles.emptyText}>-</Text>
//                                     )}

//                                     {/* Admin Picker Overlay */}
//                                     {isPickerOpen && (
//                                         <View style={styles.adminPickerOverlay}>
//                                             <Text style={styles.pickerTitle}>Asignar turno:</Text>
//                                             <ScrollView style={styles.adminList}>
//                                                 {companyAdmins.length === 0 ? (
//                                                     <Text style={styles.noAdminsText}>No hay admins</Text>
//                                                 ) : (
//                                                     companyAdmins.map(admin => (
//                                                         <TouchableOpacity
//                                                             key={admin._id}
//                                                             onPress={() => handleAssignAdmin(day, admin._id)}
//                                                             style={[
//                                                                 styles.adminOption,
//                                                                 schedule?.admin && (typeof schedule.admin === 'object' ? schedule.admin._id === admin._id : schedule.admin === admin._id) && styles.adminOptionSelected
//                                                             ]}
//                                                         >
//                                                             <Text style={styles.adminOptionText} numberOfLines={1}>
//                                                                 {admin.name}
//                                                             </Text>
//                                                         </TouchableOpacity>
//                                                     ))
//                                                 )}
//                                             </ScrollView>
//                                         </View>
//                                     )}
//                                 </TouchableOpacity>
//                             );
//                         })}
//                     </View>
//                 </View>

//                 <View style={{ height: 40 }} />
//             </ScrollView>
//         </AppContainer>
//     );
// }

// const getStyles = (theme: any) => StyleSheet.create({
//     content: {
//         padding: 16,
//     },
//     selectorContainer: {
//         marginBottom: 20,
//     },
//     selectorLabel: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: theme.colors.textPrimary,
//         marginBottom: 12,
//     },
//     companyScroll: {
//         flexGrow: 0,
//     },
//     companyChip: {
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//         borderRadius: 20,
//         backgroundColor: theme.colors.surface,
//         marginRight: 8,
//         borderWidth: 1,
//         borderColor: '#e5e7eb',
//     },
//     companyChipActive: {
//         backgroundColor: '#3b82f6',
//         borderColor: '#3b82f6',
//     },
//     companyChipText: {
//         fontSize: 14,
//         color: theme.colors.textPrimary,
//         fontWeight: '500',
//     },
//     companyChipTextActive: {
//         color: 'white',
//     },
//     monthHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 16,
//     },
//     monthButton: {
//         padding: 8,
//     },
//     monthTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: theme.colors.textPrimary,
//         textTransform: 'capitalize',
//     },
//     calendarContainer: {
//         backgroundColor: theme.colors.surface,
//         borderRadius: 16,
//         padding: 12,
//         elevation: 2,
//     },
//     dayHeaderRow: {
//         flexDirection: 'row',
//         marginBottom: 8,
//     },
//     dayHeader: {
//         flex: 1,
//         alignItems: 'center',
//         paddingVertical: 8,
//     },
//     dayHeaderText: {
//         fontSize: 12,
//         fontWeight: '600',
//         color: theme.colors.textSecondary,
//     },
//     daysGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//     },
//     dayCell: {
//         width: `${100 / 7}%`,
//         aspectRatio: 1,
//         padding: 4,
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderWidth: 0.5,
//         borderColor: '#f3f4f6',
//         position: 'relative',
//     },
//     dayCellAssigned: {
//         backgroundColor: '#eff6ff',
//     },
//     dayNumber: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: theme.colors.textPrimary,
//         marginBottom: 4,
//     },
//     dayNumberAssigned: {
//         color: '#2563eb',
//     },
//     emptyText: {
//         fontSize: 10,
//         color: '#d1d5db',
//     },
//     adminBadge: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#dbeafe',
//         paddingHorizontal: 4,
//         paddingVertical: 2,
//         borderRadius: 8,
//         gap: 2,
//         maxWidth: '90%',
//     },
//     adminName: {
//         fontSize: 8,
//         color: '#2563eb',
//         fontWeight: '600',
//     },
//     adminPickerOverlay: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'white',
//         zIndex: 10,
//         padding: 8,
//         borderRadius: 8,
//         elevation: 8,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//     },
//     pickerTitle: {
//         fontSize: 10,
//         fontWeight: 'bold',
//         color: '#4b5563',
//         marginBottom: 6,
//         textAlign: 'center',
//     },
//     adminList: {
//         maxHeight: 80,
//     },
//     adminOption: {
//         paddingVertical: 6,
//         paddingHorizontal: 8,
//         backgroundColor: '#f3f4f6',
//         borderRadius: 6,
//         marginBottom: 4,
//     },
//     adminOptionSelected: {
//         backgroundColor: '#3b82f6',
//     },
//     adminOptionText: {
//         fontSize: 10,
//         color: '#1f2937',
//         fontWeight: '500',
//     },
//     noAdminsText: {
//         fontSize: 10,
//         color: '#ef4444',
//         textAlign: 'center',
//         paddingVertical: 8,
//     },
// });
