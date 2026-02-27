import React, { useState, useEffect, useRef } from "react";
import {
    View, ScrollView, Alert, KeyboardAvoidingView, Platform,
    TouchableOpacity, useColorScheme, TextInput, Modal
} from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import {
    User, Smartphone, CreditCard, Calendar,
    Home, HeartPulse, UserPlus, CheckCircle2, ChevronDown, Eye, EyeOff
} from "lucide-react-native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { updateProfile, getProfile } from "../services/user.service";

/* ─── Date helpers ─── */
const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => currentYear - 15 - i);

function daysInMonth(month: number, year: number) {
    return new Date(year, month + 1, 0).getDate();
}

/* ─── Wheel Picker ─── */
function WheelPicker({ data, selected, onSelect }: {
    data: (string | number)[]; selected: number; onSelect: (i: number) => void;
}) {
    const ITEM_H = 44;
    const ref = useRef<ScrollView>(null);

    useEffect(() => {
        ref.current?.scrollTo({ y: selected * ITEM_H, animated: false });
    }, []);

    return (
        <View style={{ height: ITEM_H * 5, overflow: "hidden" }}>
            <View style={{
                position: "absolute", left: 0, right: 0,
                top: ITEM_H * 2, height: ITEM_H,
                backgroundColor: "rgba(11,79,156,0.08)", borderRadius: 8, zIndex: 1
            }} />
            <ScrollView
                ref={ref}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_H}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
                onMomentumScrollEnd={e => {
                    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
                    onSelect(Math.max(0, Math.min(idx, data.length - 1)));
                }}
            >
                {data.map((item, i) => (
                    <View key={i} style={{ height: ITEM_H, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{
                            fontSize: i === selected ? 17 : 13,
                            fontWeight: i === selected ? "700" : "400",
                            color: i === selected ? "#0B4F9C" : "#94a3b8",
                        }}>
                            {typeof item === "number" ? String(item).padStart(2, "0") : item}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

/* ─── Date Modal ─── */
function DatePickerModal({ visible, day, month, year, onConfirm, onClose }: {
    visible: boolean; day: number; month: number; year: number;
    onConfirm: (d: number, m: number, y: number) => void; onClose: () => void;
}) {
    const [d, setD] = useState(day - 1);
    const [m, setM] = useState(month);
    const [y, setY] = useState(Math.max(0, YEARS.indexOf(year)));
    const days = Array.from({ length: daysInMonth(m, YEARS[y]) }, (_, i) => i + 1);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
                <View style={{ backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>Fecha de Nacimiento</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={{ color: "#94a3b8", fontSize: 16 }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        <View style={{ flex: 1, marginRight: 4 }}>
                            <Text style={{ textAlign: "center", color: "#64748b", fontSize: 11, marginBottom: 4 }}>DÍA</Text>
                            <WheelPicker data={days} selected={d} onSelect={setD} />
                        </View>
                        <View style={{ flex: 2, marginHorizontal: 4 }}>
                            <Text style={{ textAlign: "center", color: "#64748b", fontSize: 11, marginBottom: 4 }}>MES</Text>
                            <WheelPicker data={MONTHS} selected={m} onSelect={setM} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 4 }}>
                            <Text style={{ textAlign: "center", color: "#64748b", fontSize: 11, marginBottom: 4 }}>AÑO</Text>
                            <WheelPicker data={YEARS} selected={y} onSelect={setY} />
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => onConfirm(days[d], m, YEARS[y])}
                        style={{ backgroundColor: "#0B4F9C", marginTop: 20, padding: 16, borderRadius: 16, alignItems: "center" }}
                    >
                        <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

/* ─── Shared Input ─── */
function Input({ label, value, onChange, placeholder, keyboardType = "default", icon, rightIcon }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder: string; keyboardType?: any; icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}) {
    return (
        <View className="mb-4">
            <Text className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</Text>
            <View className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 flex-row items-center">
                {icon}
                <TextInput
                    value={value} onChangeText={onChange} placeholder={placeholder}
                    placeholderTextColor="#94a3b8" keyboardType={keyboardType}
                    style={{ flex: 1, paddingVertical: 12, marginLeft: 12, color: "#0f172a" }}
                />
                {rightIcon}
            </View>
        </View>
    );
}

/* ─── Card ─── */
function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <View className="bg-white dark:bg-dark-surface rounded-3xl p-5 mb-6 border border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 justify-center items-center mr-3">{icon}</View>
                <Text className="text-lg font-bold text-slate-800 dark:text-white">{title}</Text>
            </View>
            {children}
        </View>
    );
}

/* ─── Main Screen ─── */
export default function CompleteProfileScreen() {
    const navigation = useNavigation<any>();
    const { user, updateUser } = useAuth();
    const isDark = useColorScheme() === "dark";

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [showDateModal, setShowDateModal] = useState(false);

    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [selectedYear, setSelectedYear] = useState(currentYear - 25);

    const [formData, setFormData] = useState({
        name: user?.name || "",
        identificationNumber: "",
        phone: "",
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
    });

    const [isIdVisible, setIsIdVisible] = useState(false);
    const [unmaskedId, setUnmaskedId] = useState("");

    useEffect(() => { loadCurrentProfile(); }, []);

    async function loadCurrentProfile() {
        try {
            const profile = await getProfile();
            setFormData({
                name: profile.name || "",
                identificationNumber: profile.identificationNumber || "",
                phone: profile.phone || "",
                address: profile.address || "",
                emergencyContactName: profile.emergencyContactName || "",
                emergencyContactPhone: profile.emergencyContactPhone || "",
            });
            if (profile.birthDate) {
                const d = new Date(profile.birthDate);
                setSelectedDay(d.getDate());
                setSelectedMonth(d.getMonth());
                setSelectedYear(d.getFullYear());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setFetching(false);
        }
    }

    async function toggleIdVisibility() {
        if (isIdVisible) {
            setIsIdVisible(false);
            return;
        }

        try {
            setLoading(true);
            const profile = await getProfile(true); // Request unmasked
            setUnmaskedId(profile.identificationNumber);
            setIsIdVisible(true);
        } catch (e) {
            Alert.alert("Error", "No se pudo obtener la identificación real");
        } finally {
            setLoading(false);
        }
    }

    const formattedDate = `${String(selectedDay).padStart(2, "0")} de ${MONTHS[selectedMonth]} de ${selectedYear}`;

    const handleUpdate = async () => {
        if (!formData.name.trim() || !formData.identificationNumber.trim()) {
            Alert.alert("Campos requeridos", "Nombre e identificación son obligatorios.");
            return;
        }
        const phoneRegex = /^\d{10}$/;
        if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
            Alert.alert("Teléfono inválido", "El celular debe tener exactamente 10 dígitos.");
            return;
        }
        if (formData.emergencyContactPhone && !phoneRegex.test(formData.emergencyContactPhone.replace(/\s/g, ""))) {
            Alert.alert("Teléfono inválido", "El teléfono de emergencia debe tener exactamente 10 dígitos.");
            return;
        }
        setLoading(true);
        try {
            const birthDate = new Date(selectedYear, selectedMonth, selectedDay).toISOString();
            const finalData = { ...formData };
            if (finalData.identificationNumber.includes("*")) {
                delete (finalData as any).identificationNumber;
            }

            const res = await updateProfile({ ...finalData, birthDate });
            if (updateUser) updateUser(res.user);

            if (Platform.OS === 'web') {
                // Better feedback for web
                Alert.alert("¡Éxito!", "Tu información ha sido guardada correctamente.");
            } else {
                Alert.alert("¡Listo!", "Perfil actualizado correctamente.", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }
            setIsIdVisible(false);
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "No se pudo actualizar el perfil");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <AppContainer>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0B4F9C" />
                </View>
            </AppContainer>
        );
    }

    return (
        <AppContainer>
            <AppHeader title="Completar Perfil" showBack />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">

                    <View style={{ marginBottom: 20 }}>
                        <Text className="text-xl font-bold text-nautic-primary dark:text-white">Información de Seguridad</Text>
                        <Text className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                            Necesaria para tu seguridad y comunicación vía WhatsApp.
                        </Text>
                    </View>

                    <Card title="Datos Personales" icon={<User size={20} color={isDark ? "#94a3b8" : "#0B4F9C"} />}>
                        <Input label="Nombre Completo *" value={formData.name}
                            onChange={v => setFormData(p => ({ ...p, name: v }))}
                            placeholder="Tu nombre legal"
                            icon={<User size={18} color="#94a3b8" />} />
                        <Input
                            label="Cédula / T.I (tarjeta de identidad) *"
                            value={isIdVisible ? unmaskedId : formData.identificationNumber}
                            onChange={v => {
                                if (isIdVisible) {
                                    setUnmaskedId(v);
                                    setFormData(p => ({ ...p, identificationNumber: v }));
                                } else {
                                    setFormData(p => ({ ...p, identificationNumber: v }));
                                }
                            }}
                            placeholder="Sin puntos ni guiones"
                            keyboardType="numeric"
                            icon={<CreditCard size={18} color="#94a3b8" />}
                            rightIcon={
                                <TouchableOpacity onPress={toggleIdVisibility} className="p-2">
                                    {isIdVisible ? <EyeOff size={18} color="#0B4F9C" /> : <Eye size={18} color="#94a3b8" />}
                                </TouchableOpacity>
                            }
                        />
                        <Input label="Celular (WhatsApp) *" value={formData.phone}
                            onChange={v => setFormData(p => ({ ...p, phone: v }))}
                            placeholder="+57 300 123 4567"
                            keyboardType="phone-pad"
                            icon={<Smartphone size={18} color="#94a3b8" />} />

                        <Text className="text-sm text-slate-500 dark:text-slate-400 mb-1">Fecha de Nacimiento</Text>
                        <TouchableOpacity
                            onPress={() => setShowDateModal(true)}
                            style={{
                                backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0",
                                borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
                                flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Calendar size={18} color="#94a3b8" />
                                <Text style={{ marginLeft: 12, color: "#0f172a", fontWeight: "500" }}>{formattedDate}</Text>
                            </View>
                            <ChevronDown size={18} color="#94a3b8" />
                        </TouchableOpacity>

                        <Input label="Dirección" value={formData.address}
                            onChange={v => setFormData(p => ({ ...p, address: v }))}
                            placeholder="Calle, Carrera, Ciudad"
                            icon={<Home size={18} color="#94a3b8" />} />
                    </Card>

                    <Card title="Contacto de Emergencia" icon={<HeartPulse size={20} color="#ef4444" />}>
                        <Input label="Nombre del Contacto" value={formData.emergencyContactName}
                            onChange={v => setFormData(p => ({ ...p, emergencyContactName: v }))}
                            placeholder="Familiar o amigo"
                            icon={<UserPlus size={18} color="#94a3b8" />} />
                        <Input label="Teléfono de Emergencia" value={formData.emergencyContactPhone}
                            onChange={v => setFormData(p => ({ ...p, emergencyContactPhone: v }))}
                            placeholder="Número de contacto"
                            keyboardType="phone-pad"
                            icon={<Smartphone size={18} color="#94a3b8" />} />
                    </Card>

                    <View style={{
                        backgroundColor: "#eff6ff", padding: 16, borderRadius: 16, marginBottom: 32,
                        borderWidth: 1, borderColor: "#dbeafe"
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                            <CheckCircle2 size={18} color="#3b82f6" />
                            <Text style={{ marginLeft: 8, fontWeight: "700", color: "#1e40af" }}>Privacidad y Seguridad</Text>
                        </View>
                        <Text style={{ fontSize: 12, color: "#1d4ed8" }}>
                            Tu identificación se almacena encriptada con AES-256 en nuestra base de datos.
                        </Text>
                    </View>

                    <View style={{ marginBottom: 40 }}>
                        <PrimaryButton
                            label={loading ? "Guardando..." : "Guardar Información"}
                            onPress={handleUpdate}
                            disabled={loading}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <DatePickerModal
                visible={showDateModal}
                day={selectedDay} month={selectedMonth} year={selectedYear}
                onConfirm={(d, m, y) => { setSelectedDay(d); setSelectedMonth(m); setSelectedYear(y); setShowDateModal(false); }}
                onClose={() => setShowDateModal(false)}
            />
        </AppContainer>
    );
}
