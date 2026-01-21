import {
    View,
    Alert,
    TextInput as RNTextInput,
    ScrollView,
    Switch,
} from "react-native";
import { Text } from "react-native-paper";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

import {
    createCompany,
    createCompanyWithAdmin,
    CreateCompanyInput,
} from "../services/company.service";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import { Users, FileText, Building2, ShieldCheck } from "lucide-react-native";


/**
 * Tipo específico para el formulario
 * Aquí compliance es OBLIGATORIO
 */
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

/* =========================================================
   TIPOS AUXILIARES
   ========================================================= */

/**
 * Extraemos el tipo real del objeto compliance
 * para evitar que TypeScript lo trate como `undefined`
 */
type ComplianceKeys = keyof NonNullable<CreateCompanyInput["compliance"]>;

export default function CreateCompanyScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);

    /**
     * Estado del formulario
     * NOTA: compliance SIEMPRE se inicializa
     */

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
    });


    /* =========================================================
       HANDLERS DE FORMULARIO
       ========================================================= */

    /**
     * Actualiza campos simples del formulario
     * (name, nit, legalRepresentative, etc.)
     */
    const handleInputChange = (
        field: keyof CreateCompanyForm,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    /**
     * Actualiza los checks de compliance
     * Usamos ComplianceKeys para evitar el error `never`
     */
    const handleComplianceChange = (
        field: ComplianceKeys,
        value: boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            compliance: {
                ...prev.compliance,
                [field]: value,
            },
        }));
    };

    /* =========================================================
       SUBMIT
       ========================================================= */

    const handleCreate = async () => {
        // Validación mínima
        if (!formData.name.trim()) {
            Alert.alert("Nombre requerido", "Ingresa el nombre de la empresa");
            return;
        }

        // Seguridad frontend
        if (!user || user.role.toLowerCase() !== "owner") {
            Alert.alert(
                "Acceso restringido",
                "Solo los owners pueden crear empresas"
            );
            return;
        }

        setLoading(true);

        try {
            if (formData.adminEmail && formData.adminPassword) {
                // Si hay datos de admin, usar creación transaccional
                await createCompanyWithAdmin(formData);
            } else {
                // Creación simple
                await createCompany(formData);
            }

            Alert.alert("Éxito", "Empresa creada correctamente");
            navigation.goBack();
        } catch (error: any) {
            console.log("❌ Error createCompany:", error);
            Alert.alert(
                "Error",
                error?.message || "No se pudo crear la empresa"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================
       RENDER
       ========================================================= */

    return (
        <AppContainer>
            <AppHeader title="Crear Empresa" />

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* ===== INFO GENERAL ===== */}
                <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Building2 size={20} color={colors.primary} />
                        <Text className="text-lg font-bold text-gray-800">
                            Información General
                        </Text>
                    </View>

                    <Text className="text-gray-500 mb-2 font-medium">
                        Nombre Comercial *
                    </Text>
                    <RNTextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
                        placeholder="Ej: NauticGo S.A."
                        placeholderTextColor="#9ca3af"
                        value={formData.name}
                        onChangeText={(text) =>
                            handleInputChange("name", text)
                        }
                    />

                    <Text className="text-gray-500 mb-2 font-medium">
                        NIT
                    </Text>
                    <RNTextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
                        placeholder="900.123.456-1"
                        placeholderTextColor="#9ca3af"
                        value={formData.nit}
                        onChangeText={(text) =>
                            handleInputChange("nit", text)
                        }
                    />

                    <Text className="text-gray-500 mb-2 font-medium">
                        Representante Legal
                    </Text>
                    <RNTextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
                        value={formData.legalRepresentative}
                        onChangeText={(text) =>
                            handleInputChange(
                                "legalRepresentative",
                                text
                            )
                        }
                    />

                    <Text className="text-gray-500 mb-2 font-medium">
                        Nro. Licencia / Habilitación
                    </Text>
                    <RNTextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
                        value={formData.licenseNumber}
                        onChangeText={(text) =>
                            handleInputChange("licenseNumber", text)
                        }
                    />
                </View>

                {/* ===== ADMINISTRADOR ===== */}
                <View className="bg-blue-50/50 p-6 rounded-2xl shadow-sm border border-blue-100 mb-6">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Users size={20} color="#1d4ed8" />
                        <Text className="text-lg font-bold text-blue-800">
                            Administrador Asignado
                        </Text>
                    </View>

                    <Text className="text-blue-600 mb-2 font-medium">Nombre Admin *</Text>
                    <RNTextInput
                        className="bg-white border border-blue-200 rounded-xl p-4 mb-4 text-gray-800"
                        placeholder="Nombre Completo"
                        placeholderTextColor="#94a3b8"
                        value={formData.adminName}
                        onChangeText={(text) => handleInputChange("adminName", text)}
                    />

                    <Text className="text-blue-600 mb-2 font-medium">Email (Login) *</Text>
                    <RNTextInput
                        className="bg-white border border-blue-200 rounded-xl p-4 mb-4 text-gray-800"
                        placeholder="admin@empresa.com"
                        placeholderTextColor="#94a3b8"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formData.adminEmail}
                        onChangeText={(text) => handleInputChange("adminEmail", text)}
                    />

                    <Text className="text-blue-600 mb-2 font-medium">Contraseña *</Text>
                    <RNTextInput
                        className="bg-white border border-blue-200 rounded-xl p-4 mb-2 text-gray-800"
                        placeholder="******"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry
                        value={formData.adminPassword}
                        onChangeText={(text) => handleInputChange("adminPassword", text)}
                    />
                    <Text className="text-[10px] text-blue-500 italic mt-1">
                        * Este usuario gestionará rutas y viajes de esta empresa.
                    </Text>
                </View>

                {/* ===== COMPLIANCE ===== */}
                <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center gap-2 mb-4">
                        <ShieldCheck size={20} color="#16a34a" />
                        <Text className="text-lg font-bold text-gray-800">
                            Checklist de Cumplimiento
                        </Text>
                    </View>

                    <ComplianceItem
                        label="Constitución Legal (Cámara/RUT)"
                        value={formData.compliance.hasLegalConstitution}
                        onValueChange={(val) =>
                            handleComplianceChange(
                                "hasLegalConstitution",
                                val
                            )
                        }
                    />

                    <ComplianceItem
                        label="Habilitación Transporte (Dimar/Min)"
                        value={formData.compliance.hasTransportLicense}
                        onValueChange={(val) =>
                            handleComplianceChange(
                                "hasTransportLicense",
                                val
                            )
                        }
                    />

                    <ComplianceItem
                        label="Matrículas de Embarcaciones"
                        value={formData.compliance.hasVesselRegistration}
                        onValueChange={(val) =>
                            handleComplianceChange(
                                "hasVesselRegistration",
                                val
                            )
                        }
                    />

                    <ComplianceItem
                        label="Seguros Vigentes (RC/Pasajeros)"
                        value={formData.compliance.hasInsurance}
                        onValueChange={(val) =>
                            handleComplianceChange(
                                "hasInsurance",
                                val
                            )
                        }
                    />
                </View>

                <PrimaryButton
                    label={loading ? "Creando..." : "Registrar Empresa"}
                    onPress={handleCreate}
                    disabled={loading}
                />
            </ScrollView>
        </AppContainer>
    );
}

/* =========================================================
   COMPONENTE REUTILIZABLE
   ========================================================= */

function ComplianceItem({
    label,
    value,
    onValueChange,
}: {
    label: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
}) {
    return (
        <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
            <Text className="text-gray-600 flex-1 mr-2">
                {label}
            </Text>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{
                    false: "#e5e7eb",
                    true: colors.primary + "80",
                }}
                thumbColor={value ? colors.primary : "#f4f3f4"}
            />
        </View>
    );
}
