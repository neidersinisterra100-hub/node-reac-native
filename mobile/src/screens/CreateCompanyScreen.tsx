import {
    View,
    Alert,
    TextInput,
    ScrollView,
    Switch,
    KeyboardAvoidingView,
    Platform,
    useColorScheme,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { Text } from "react-native-paper";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { styled } from "nativewind";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

import {
    createCompany,
    createCompanyWithAdmin,
    CreateCompanyInput,
} from "../services/company.service";
import { useAuth } from "../context/AuthContext";
import { Users, Building2, ShieldCheck, Map } from "lucide-react-native";
import { getAllMunicipios, Municipio } from "../services/municipio.service";
import { getAllCities, City } from "../services/city.service";
import { departmentService } from "../services/department.service";
import { Department } from "../types/department";

/* =========================
   TYPES
========================= */

type CreateCompanyForm = Omit<CreateCompanyInput, "compliance"> & {
    compliance: {
        hasLegalConstitution: boolean;
        hasTransportLicense: boolean;
        hasVesselRegistration: boolean;
        hasCrewLicenses: boolean;
        hasInsurance: boolean;
        hasSafetyProtocols: boolean;
    };
    adminName: string;
    adminEmail: string;
};

type ComplianceKeys = keyof CreateCompanyForm["compliance"];

/* =========================
   SCREEN
========================= */

export default function CreateCompanyScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<CreateCompanyForm>({
        name: "",
        nit: "",
        legalRepresentative: "",
        licenseNumber: "",
        insurancePolicyNumber: "",
        compliance: {
            hasLegalConstitution: false,
            hasTransportLicense: false,
            hasVesselRegistration: false,
            hasCrewLicenses: false,
            hasInsurance: false,
            hasSafetyProtocols: false,
        },
        adminName: "",
        adminEmail: "",
        departmentId: "",
        municipioId: "",
        cityId: "",
    });

    const [departments, setDepartments] = useState<Department[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [filteredMunicipios, setFilteredMunicipios] = useState<Municipio[]>([]);
    const [filteredCities, setFilteredCities] = useState<City[]>([]);

    /* ✅ FIX: useEffect correcto */
    useEffect(() => {
        loadLocations();
    }, []);

    async function loadLocations() {
        const [deptData, muniData, cityData] = await Promise.all([
            departmentService.getAll(true),
            getAllMunicipios(true),
            getAllCities(),
        ]);
        setDepartments(deptData);
        setMunicipios(muniData);
        setCities(cityData);
    }

    const handleDepartmentChange = (deptId: string) => {
        setFormData(prev => ({
            ...prev,
            departmentId: deptId,
            municipioId: "",
            cityId: "",
        }));

        setFilteredMunicipios(
            municipios.filter(m => m.departmentId === deptId && m.isActive)
        );
        setFilteredCities([]);
    };

    const handleMunicipioChange = (muniId: string) => {
        setFormData(prev => ({ ...prev, municipioId: muniId, cityId: "" }));

        const filtered = cities.filter(c => {
            const cityMuniId = (c as any).municipioId || (typeof c.municipio === "object" ? c.municipio._id : c.municipio);
            return cityMuniId === muniId && c.isActive;
        });

        setFilteredCities(filtered);
    };

    const handleInputChange = (
        field: keyof CreateCompanyForm,
        value: string
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleComplianceChange = (
        field: ComplianceKeys,
        value: boolean
    ) => {
        setFormData(prev => ({
            ...prev,
            compliance: { ...prev.compliance, [field]: value },
        }));
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            Alert.alert("Nombre requerido", "Ingresa el nombre de la empresa");
            return;
        }

        if (!formData.municipioId || !formData.cityId) {
            Alert.alert("Ubicación requerida", "Selecciona Municipio y Ciudad");
            return;
        }

        if (!user || user.role !== "owner") {
            Alert.alert("Acceso restringido");
            return;
        }

        setLoading(true);
        try {
            formData.adminEmail
                ? await createCompanyWithAdmin(formData)
                : await createCompany(formData);

            Alert.alert("Éxito", "Empresa creada correctamente");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppContainer>
            <AppHeader title="Crear Empresa" showBack />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView className="px-4 py-6">
                    {/* ===== INFO GENERAL ===== */}
                    <Card title="Información General" icon={<Building2 size={20} color={isDark ? "#94a3b8" : "#0B4F9C"} />}>
                        <Input
                            label="Nombre Comercial *"
                            value={formData.name ?? ""}
                            onChange={v => handleInputChange("name", v)}
                            placeholder="Ej. NauticGo S.A."
                        />

                        <Input
                            label="NIT"
                            value={formData.nit ?? ""}
                            onChange={v => handleInputChange("nit", v)}
                            placeholder="Ej. 900.123.456-7"
                        />

                        <Input
                            label="Representante Legal"
                            value={formData.legalRepresentative ?? ""}
                            onChange={v => handleInputChange("legalRepresentative", v)}
                            placeholder="Nombre Completo"
                        />
                    </Card>

                    {/* ===== INFO LEGAL ===== */}
                    <Card title="Información Legal" icon={<ShieldCheck size={20} color={isDark ? "#94a3b8" : "#0B4F9C"} />}>
                        <Input
                            label="No. Habilitación"
                            value={formData.licenseNumber ?? ""}
                            onChange={v => handleInputChange("licenseNumber", v)}
                            placeholder="Res. 00123"
                        />
                        <Input
                            label="No. Póliza"
                            value={formData.insurancePolicyNumber ?? ""}
                            onChange={v => handleInputChange("insurancePolicyNumber", v)}
                            placeholder="Póliza 123456"
                        />
                    </Card>

                    {/* ===== UBICACIÓN ===== */}
                    <Card title="Ubicación Principal" icon={<Map size={20} color={isDark ? "#94a3b8" : "#0B4F9C"} />}>
                        <Text className="text-sm text-slate-500 dark:text-slate-400 mb-1">Departamento *</Text>
                        <View className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-4 overflow-hidden">
                            <FlatList
                                horizontal
                                data={departments}
                                keyExtractor={d => d._id}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleDepartmentChange(item._id)}
                                        className={`px-4 py-2 m-1 rounded-lg ${formData.departmentId === item._id ? 'bg-blue-600' : 'bg-transparent'}`}
                                    >
                                        <Text className={`text-xs ${formData.departmentId === item._id ? 'text-white font-bold' : 'text-slate-500'}`}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        <Text className="text-sm text-slate-500 dark:text-slate-400 mb-1">Municipio *</Text>
                        <View className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-4 overflow-hidden">
                            <FlatList
                                horizontal
                                data={filteredMunicipios}
                                keyExtractor={m => m._id}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleMunicipioChange(item._id)}
                                        className={`px-4 py-2 m-1 rounded-lg ${formData.municipioId === item._id ? 'bg-blue-600' : 'bg-transparent'}`}
                                    >
                                        <Text className={`text-xs ${formData.municipioId === item._id ? 'text-white font-bold' : 'text-slate-500'}`}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        <Text className="text-sm text-slate-500 dark:text-slate-400 mb-1">Ciudad / Punto *</Text>
                        <View className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-4 overflow-hidden">
                            <FlatList
                                horizontal
                                data={filteredCities}
                                keyExtractor={c => c._id}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleInputChange('cityId', item._id)}
                                        className={`px-4 py-2 m-1 rounded-lg ${formData.cityId === item._id ? 'bg-blue-600' : 'bg-transparent'}`}
                                    >
                                        <Text className={`text-xs ${formData.cityId === item._id ? 'text-white font-bold' : 'text-slate-500'}`}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </Card>

                    {/* ===== ADMIN ===== */}
                    <Card title="Administrador Asignado" icon={<Users size={20} color={isDark ? "#94a3b8" : "#0B4F9C"} />}>
                        <Input
                            label="Nombre Admin *"
                            value={formData.adminName}
                            onChange={v => handleInputChange("adminName", v)}
                            placeholder="Nombre del encargado"
                        />
                        <Input
                            label="Email (Login) *"
                            value={formData.adminEmail}
                            onChange={v => handleInputChange("adminEmail", v)}
                            placeholder="admin@empresa.com"
                        />
                        <Text className="text-[10px] text-blue-500 dark:text-blue-400 mt-[-10px] mb-4">
                            * Se enviará una invitación por email al administrador para que configure su propia contraseña segura.
                        </Text>
                    </Card>

                    {/* ===== COMPLIANCE ===== */}
                    <Card title="Checklist de Cumplimiento" icon={<ShieldCheck size={20} color={isDark ? "#94a3b8" : "#0B4F9C"} />}>
                        <ComplianceRow
                            label="Constitución Legal (Cámara/RUT)"
                            value={formData.compliance.hasLegalConstitution}
                            onChange={val => handleComplianceChange('hasLegalConstitution', val)}
                        />
                        <ComplianceRow
                            label="Habilitación Transporte (Dimar/Min)"
                            value={formData.compliance.hasTransportLicense}
                            onChange={val => handleComplianceChange('hasTransportLicense', val)}
                        />
                        <ComplianceRow
                            label="Matrículas de Embarcaciones"
                            value={formData.compliance.hasVesselRegistration}
                            onChange={val => handleComplianceChange('hasVesselRegistration', val)}
                        />
                        <ComplianceRow
                            label="Licencias de Tripulación"
                            value={formData.compliance.hasCrewLicenses}
                            onChange={val => handleComplianceChange('hasCrewLicenses', val)}
                        />
                        <ComplianceRow
                            label="Seguros Vigentes (RC/Pasajeros)"
                            value={formData.compliance.hasInsurance}
                            onChange={val => handleComplianceChange('hasInsurance', val)}
                        />
                        <ComplianceRow
                            label="Protocolos de Seguridad"
                            value={formData.compliance.hasSafetyProtocols}
                            onChange={val => handleComplianceChange('hasSafetyProtocols', val)}
                        />
                    </Card>

                    <View className="mb-10">
                        <PrimaryButton
                            label={loading ? "Creando..." : "Registrar Empresa"}
                            onPress={handleCreate}
                            disabled={loading}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </AppContainer>
    );
}

/* =========================
   UI HELPERS
========================= */

function Card({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <View className="bg-white dark:bg-slate-900 rounded-2xl p-5 mb-6 border border-slate-200 dark:border-slate-800">
            <View className="flex-row items-center gap-2 mb-4">
                {icon}
                <Text className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {title}
                </Text>
            </View>
            {children}
        </View>
    );
}

function Input({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <>
            <Text className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                {label}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 mb-4"
            />
        </>
    );
}

function ComplianceRow({
    label,
    value,
    onChange,
}: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <View className="flex-row justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
            <Text className="text-slate-700 dark:text-slate-300 text-sm">
                {label}
            </Text>
            <Switch value={value} onValueChange={onChange} />
        </View>
    );
}
