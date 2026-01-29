import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, UserCheck } from 'lucide-react-native';

import AppContainer from '../components/ui/AppContainer';
import AppHeader from '../components/ui/AppHeader';
import { useTheme } from '../context/ThemeContext';
import { calendarService, Schedule } from '../services/calendar.service';
import { getMyCompanies, getCompanyAdmins, Company, CompanyAdmin } from '../services/company.service';

const { width } = Dimensions.get('window');

export default function CalendarScreen() {
    const { theme } = useTheme();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [companyAdmins, setCompanyAdmins] = useState<CompanyAdmin[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAdminPicker, setShowAdminPicker] = useState<number | null>(null);

    // Load companies on mount
    useEffect(() => {
        loadCompanies();
    }, []);

    // Load admins and schedules when company or month changes
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
            // Reload schedules
            loadSchedules(selectedCompanyId, currentDate);
            setShowAdminPicker(null);
        } catch (error) {
            console.error("Error assigning admin", error);
        }
    };

    // Calendar helpers
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

    const getScheduleForDay = (day: number) => {
        return schedules.find(s => {
            const sDate = new Date(s.date);
            return sDate.getDate() === day;
        });
    };

    const styles = getStyles(theme);

    return (
        <AppContainer>
            <AppHeader title="Calendario de Turnos" showBack />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Company Selector */}
                <View style={styles.selectorContainer}>
                    <Text style={styles.selectorLabel}>Empresa</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.companyScroll}>
                        {companies.map(c => (
                            <TouchableOpacity
                                key={c.id}
                                onPress={() => setSelectedCompanyId(c.id)}
                                style={[
                                    styles.companyChip,
                                    selectedCompanyId === c.id && styles.companyChipActive
                                ]}
                            >
                                <Text style={[
                                    styles.companyChipText,
                                    selectedCompanyId === c.id && styles.companyChipTextActive
                                ]}>
                                    {c.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Month Navigation */}
                <View style={styles.monthHeader}>
                    <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
                        <ChevronLeft size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.monthTitle}>
                        {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
                        <ChevronRight size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarContainer}>
                    {/* Day Headers */}
                    <View style={styles.dayHeaderRow}>
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                            <View key={day} style={styles.dayHeader}>
                                <Text style={styles.dayHeaderText}>{day}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Calendar Days */}
                    <View style={styles.daysGrid}>
                        {blanks.map(i => (
                            <View key={`blank-${i}`} style={styles.dayCell} />
                        ))}

                        {days.map(day => {
                            const schedule = getScheduleForDay(day);
                            const hasAdmin = !!schedule;
                            const adminName = typeof schedule?.admin === 'object' ? schedule.admin.name : 'Desconocido';
                            const isPickerOpen = showAdminPicker === day;

                            return (
                                <TouchableOpacity
                                    key={day}
                                    style={[styles.dayCell, hasAdmin && styles.dayCellAssigned]}
                                    onPress={() => setShowAdminPicker(isPickerOpen ? null : day)}
                                >
                                    <Text style={[styles.dayNumber, hasAdmin && styles.dayNumberAssigned]}>
                                        {day}
                                    </Text>
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#3b82f6" />
                                    ) : hasAdmin ? (
                                        <View style={styles.adminBadge}>
                                            <UserCheck size={12} color="#2563eb" />
                                            <Text style={styles.adminName} numberOfLines={1}>{adminName}</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.emptyText}>-</Text>
                                    )}

                                    {/* Admin Picker Overlay */}
                                    {isPickerOpen && (
                                        <View style={styles.adminPickerOverlay}>
                                            <Text style={styles.pickerTitle}>Asignar turno:</Text>
                                            <ScrollView style={styles.adminList}>
                                                {companyAdmins.length === 0 ? (
                                                    <Text style={styles.noAdminsText}>No hay admins</Text>
                                                ) : (
                                                    companyAdmins.map(admin => (
                                                        <TouchableOpacity
                                                            key={admin._id}
                                                            onPress={() => handleAssignAdmin(day, admin._id)}
                                                            style={[
                                                                styles.adminOption,
                                                                schedule?.admin && (typeof schedule.admin === 'object' ? schedule.admin._id === admin._id : schedule.admin === admin._id) && styles.adminOptionSelected
                                                            ]}
                                                        >
                                                            <Text style={styles.adminOptionText} numberOfLines={1}>
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

                <View style={{ height: 40 }} />
            </ScrollView>
        </AppContainer>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    content: {
        padding: 16,
    },
    selectorContainer: {
        marginBottom: 20,
    },
    selectorLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    companyScroll: {
        flexGrow: 0,
    },
    companyChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    companyChipActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    companyChipText: {
        fontSize: 14,
        color: theme.colors.textPrimary,
        fontWeight: '500',
    },
    companyChipTextActive: {
        color: 'white',
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthButton: {
        padding: 8,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        textTransform: 'capitalize',
    },
    calendarContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 12,
        elevation: 2,
    },
    dayHeaderRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dayHeader: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    dayHeaderText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: '#f3f4f6',
        position: 'relative',
    },
    dayCellAssigned: {
        backgroundColor: '#eff6ff',
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    dayNumberAssigned: {
        color: '#2563eb',
    },
    emptyText: {
        fontSize: 10,
        color: '#d1d5db',
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dbeafe',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 2,
        maxWidth: '90%',
    },
    adminName: {
        fontSize: 8,
        color: '#2563eb',
        fontWeight: '600',
    },
    adminPickerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        zIndex: 10,
        padding: 8,
        borderRadius: 8,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    pickerTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4b5563',
        marginBottom: 6,
        textAlign: 'center',
    },
    adminList: {
        maxHeight: 80,
    },
    adminOption: {
        paddingVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 6,
        marginBottom: 4,
    },
    adminOptionSelected: {
        backgroundColor: '#3b82f6',
    },
    adminOptionText: {
        fontSize: 10,
        color: '#1f2937',
        fontWeight: '500',
    },
    noAdminsText: {
        fontSize: 10,
        color: '#ef4444',
        textAlign: 'center',
        paddingVertical: 8,
    },
});
