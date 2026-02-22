import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text, Avatar, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ShieldCheck, ClipboardList } from "lucide-react-native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

const StyledView = styled(View);
const StyledText = styled(Text);

function formatDate(iso?: string | null): string {
    if (!iso) return "—";
    try {
        return format(parseISO(iso), "d 'de' MMMM yyyy", { locale: es });
    } catch {
        return iso;
    }
}

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const navigation = useNavigation<any>();

    const roleLabel: Record<string, string> = {
        user: "Pasajero",
        owner: "Propietario",
        admin: "Administrador",
        super_owner: "Super Propietario",
    };

    const isAdminOrOwner =
        user?.role === "owner" ||
        user?.role === "admin" ||
        user?.role === "super_owner";

    return (
        <AppContainer>
            <AppHeader title="Mi Perfil" />

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}>

                {/* ===== AVATAR ===== */}
                <StyledView className="items-center mb-8">
                    <Avatar.Text
                        size={88}
                        label={user?.name?.substring(0, 2).toUpperCase() || "US"}
                        style={{ backgroundColor: colors.primary }}
                        color="white"
                    />
                    <StyledText className="text-2xl font-bold text-nautic-primary mt-4">
                        {user?.name}
                    </StyledText>
                    <StyledView className="mt-1 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                        <StyledText className="text-xs font-black text-nautic-primary uppercase tracking-widest">
                            {roleLabel[user?.role ?? ""] ?? user?.role}
                        </StyledText>
                    </StyledView>
                </StyledView>

                {/* ===== INFORMACIÓN PERSONAL ===== */}
                <StyledView className="bg-white rounded-2xl p-5 shadow-sm mb-4 border border-slate-100">
                    <StyledText className="text-base font-bold text-nautic-primary mb-4">
                        Información Personal
                    </StyledText>

                    <StyledView className="flex-row items-center mb-4">
                        <MaterialCommunityIcons name="email-outline" size={22} color={colors.textSecondary} style={{ marginRight: 16 }} />
                        <StyledView className="flex-1">
                            <StyledText className="text-xs text-slate-400">Email</StyledText>
                            <StyledText className="text-sm text-slate-800 font-semibold">{user?.email}</StyledText>
                        </StyledView>
                    </StyledView>

                    <Divider style={{ marginVertical: 10 }} />

                    <StyledView className="flex-row items-center">
                        <MaterialCommunityIcons name="shield-account-outline" size={22} color={colors.textSecondary} style={{ marginRight: 16 }} />
                        <StyledView className="flex-1">
                            <StyledText className="text-xs text-slate-400">Rol</StyledText>
                            <StyledText className="text-sm text-slate-800 font-semibold capitalize">
                                {roleLabel[user?.role ?? ""] ?? user?.role}
                            </StyledText>
                        </StyledView>
                    </StyledView>
                </StyledView>

                {/* ===== AUDITORÍA DE CUENTA ===== */}
                <StyledView className="bg-white rounded-2xl p-5 shadow-sm mb-4 border border-slate-100">
                    <StyledView className="flex-row items-center mb-4">
                        <ShieldCheck size={18} color="#0B4F9C" style={{ marginRight: 8 }} />
                        <StyledText className="text-base font-bold text-nautic-primary">
                            Datos de Cuenta
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-row items-center mb-3">
                        <MaterialCommunityIcons name="calendar-check-outline" size={20} color="#64748B" style={{ marginRight: 12 }} />
                        <StyledView className="flex-1">
                            <StyledText className="text-xs text-slate-400">Cuenta creada el</StyledText>
                            <StyledText className="text-sm text-slate-700 font-medium">
                                {formatDate(user?.createdAt)}
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    <Divider style={{ marginVertical: 8 }} />

                    <StyledView className="flex-row items-center">
                        <MaterialCommunityIcons name="calendar-edit" size={20} color="#64748B" style={{ marginRight: 12 }} />
                        <StyledView className="flex-1">
                            <StyledText className="text-xs text-slate-400">Última actualización</StyledText>
                            <StyledText className="text-sm text-slate-700 font-medium">
                                {formatDate(user?.updatedAt)}
                            </StyledText>
                        </StyledView>
                    </StyledView>
                </StyledView>

                {/* ===== ACCESO A AUDITORÍA (solo Owners/Admins) ===== */}
                {isAdminOrOwner && user?.companyId && (
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("Audit", {
                                companyId: user.companyId,
                                companyName: "Mi Empresa",
                            })
                        }
                        className="bg-nautic-primary rounded-2xl p-4 mb-4 flex-row items-center justify-between shadow-md"
                    >
                        <StyledView>
                            <StyledText className="text-white font-bold text-base">
                                Auditoría de Empresa
                            </StyledText>
                            <StyledText className="text-blue-200 text-xs mt-0.5">
                                Historial completo de acciones
                            </StyledText>
                        </StyledView>
                        <ClipboardList size={28} color="white" strokeWidth={1.5} />
                    </TouchableOpacity>
                )}

                {/* ===== LOGOUT ===== */}
                <StyledView className="mt-4">
                    <PrimaryButton
                        label="Cerrar Sesión"
                        onPress={logout}
                    />
                </StyledView>

            </ScrollView>
        </AppContainer>
    );
}
