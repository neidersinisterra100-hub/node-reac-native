import {
    View,
    Alert,
    TextInput,
    ScrollView,
    Switch,
    StyleSheet,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { Text } from "react-native-paper";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';

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
import { Users, Building2, ShieldCheck } from "lucide-react-native";

/** 
 * Tipo específico para el formulario
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

type ComplianceKeys = keyof NonNullable<CreateCompanyInput["compliance"]>;

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
    });

    const handleInputChange = (field: keyof CreateCompanyForm, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleComplianceChange = (field: ComplianceKeys, value: boolean) => {
        setFormData((prev) => ({
            ...prev,
            compliance: { ...prev.compliance, [field]: value },
        }));
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            Alert.alert("Nombre requerido", "Ingresa el nombre de la empresa");
            return;
        }

        if (!user || user.role.toLowerCase() !== "owner") {
            Alert.alert("Acceso restringido", "Solo los owners pueden crear empresas");
            return;
        }

        setLoading(true);

        try {
            if (formData.adminEmail && formData.adminPassword) {
                await createCompanyWithAdmin(formData);
            } else {
                await createCompany(formData);
            }

            Alert.alert("Éxito", "Empresa creada correctamente");
            navigation.goBack();
        } catch (error: any) {
            console.log("❌ Error createCompany:", error);
            Alert.alert("Error", error?.message || "No se pudo crear la empresa");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppContainer>
            <AppHeader title="Crear Empresa" showBack />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* ===== INFO GENERAL ===== */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Building2 size={20} color={colors.primary} />
                            <Text style={styles.cardTitle}>Información General</Text>
                        </View>

                        <Text style={styles.label}>Nombre Comercial *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: NauticGo S.A."
                            placeholderTextColor="#9ca3af"
                            value={formData.name}
                            onChangeText={(text) => handleInputChange("name", text)}
                        />

                        <Text style={styles.label}>NIT</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="900.123.456-1"
                            placeholderTextColor="#9ca3af"
                            value={formData.nit}
                            onChangeText={(text) => handleInputChange("nit", text)}
                        />

                        <Text style={styles.label}>Representante Legal</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.legalRepresentative}
                            onChangeText={(text) => handleInputChange("legalRepresentative", text)}
                        />

                        <Text style={styles.label}>Nro. Licencia / Habilitación</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.licenseNumber}
                            onChangeText={(text) => handleInputChange("licenseNumber", text)}
                        />
                    </View>

                    {/* ===== ADMINISTRADOR ===== */}
                    <LinearGradient
                        colors={['#eff6ff', '#dbeafe']}
                        style={styles.adminCard}
                    >
                        <View style={styles.cardHeader}>
                            <Users size={20} color="#1d4ed8" />
                            <Text style={styles.adminTitle}>Administrador Asignado</Text>
                        </View>

                        <Text style={styles.adminLabel}>Nombre Admin *</Text>
                        <TextInput
                            style={styles.adminInput}
                            placeholder="Nombre Completo"
                            placeholderTextColor="#94a3b8"
                            value={formData.adminName}
                            onChangeText={(text) => handleInputChange("adminName", text)}
                        />

                        <Text style={styles.adminLabel}>Email (Login) *</Text>
                        <TextInput
                            style={styles.adminInput}
                            placeholder="admin@empresa.com"
                            placeholderTextColor="#94a3b8"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formData.adminEmail}
                            onChangeText={(text) => handleInputChange("adminEmail", text)}
                        />

                        <Text style={styles.adminLabel}>Contraseña *</Text>
                        <TextInput
                            style={styles.adminInput}
                            placeholder="******"
                            placeholderTextColor="#94a3b8"
                            secureTextEntry
                            value={formData.adminPassword}
                            onChangeText={(text) => handleInputChange("adminPassword", text)}
                        />
                        <Text style={styles.helperText}>
                            * Este usuario gestionará rutas y viajes de esta empresa.
                        </Text>
                    </LinearGradient>

                    {/* ===== COMPLIANCE ===== */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <ShieldCheck size={20} color="#16a34a" />
                            <Text style={styles.cardTitle}>Checklist de Cumplimiento</Text>
                        </View>

                        <ComplianceItem
                            label="Constitución Legal (Cámara/RUT)"
                            value={formData.compliance.hasLegalConstitution}
                            onValueChange={(val) => handleComplianceChange("hasLegalConstitution", val)}
                        />
                        <ComplianceItem
                            label="Habilitación Transporte"
                            value={formData.compliance.hasTransportLicense}
                            onValueChange={(val) => handleComplianceChange("hasTransportLicense", val)}
                        />
                        <ComplianceItem
                            label="Matrículas de Embarcaciones"
                            value={formData.compliance.hasVesselRegistration}
                            onValueChange={(val) => handleComplianceChange("hasVesselRegistration", val)}
                        />
                        <ComplianceItem
                            label="Seguros Vigentes"
                            value={formData.compliance.hasInsurance}
                            onValueChange={(val) => handleComplianceChange("hasInsurance", val)}
                        />
                    </View>

                    <PrimaryButton
                        label={loading ? "Creando..." : "Registrar Empresa"}
                        onPress={handleCreate}
                        disabled={loading}
                    />

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </AppContainer>
    );
}

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
        <View style={styles.complianceRow}>
            <Text style={styles.complianceLabel}>{label}</Text>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: "#e5e7eb", true: colors.primary + "80" }}
                thumbColor={value ? colors.primary : "#f4f3f4"}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#f3f4f6",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#6b7280",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        fontSize: 16,
        color: "#1f2937",
    },
    // Admin Section
    adminCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#bfdbfe",
    },
    adminTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1e40af",
    },
    adminLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#2563eb",
        marginBottom: 8,
    },
    adminInput: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#bfdbfe",
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        fontSize: 16,
        color: "#1f2937",
    },
    helperText: {
        fontSize: 12,
        color: "#3b82f6",
        fontStyle: "italic",
        marginTop: 4,
    },
    // Compliance
    complianceRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    complianceLabel: {
        fontSize: 14,
        color: "#4b5563",
        flex: 1,
        marginRight: 8,
    },
});
