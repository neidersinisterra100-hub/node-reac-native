import {
    View,
    Alert,
    TextInput,
    ScrollView,
    Switch,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

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
    adminPassword: string;
};

type ComplianceKeys = keyof CreateCompanyForm["compliance"];

/* =========================
   SCREEN
========================= */

export default function CreateCompanyScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
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
        adminPassword: "",
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
            const municipioId =
                typeof c.municipio === "string"
                    ? c.municipio
                    : c.municipio?._id;

            return municipioId === muniId && c.isActive;
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
            formData.adminEmail && formData.adminPassword
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
                    <Card title="Información General" icon={<Building2 size={20} />}>
                        <Input
                            label="Nombre Comercial *"
                            value={formData.name ?? ""}
                            onChange={v => handleInputChange("name", v)}
                        />

                        <Input
                            label="NIT"
                            value={formData.nit ?? ""}
                            onChange={v => handleInputChange("nit", v)}
                        />

                        <Input
                            label="Representante Legal"
                            value={formData.legalRepresentative ?? ""}
                            onChange={v => handleInputChange("legalRepresentative", v)}
                        />

                    </Card>

                    {/* ===== COMPLIANCE ===== */}
                    <Card title="Checklist de Cumplimiento" icon={<ShieldCheck size={20} />}>
                        {Object.entries(formData.compliance).map(([key, value]) => (
                            <ComplianceRow
                                key={key}
                                label={key}
                                value={value}
                                onChange={val =>
                                    handleComplianceChange(key as ComplianceKeys, val)
                                }
                            />
                        ))}
                    </Card>

                    <PrimaryButton
                        label={loading ? "Creando..." : "Registrar Empresa"}
                        onPress={handleCreate}
                        disabled={loading}
                    />
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
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <>
            <Text className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                {label}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChange}
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
