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
            <AppHeader title="Mi Perfil" showBack showAvatar={false} />

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
                    <StyledView className="mt-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/50">
                        <StyledText className="text-xs font-black text-nautic-primary dark:text-blue-300 uppercase tracking-widest">
                            {roleLabel[user?.role ?? ""] ?? user?.role}
                        </StyledText>
                    </StyledView>

                    {/* ===== INDICADOR DE PERFIL COMPLETADO ===== */}
                    {(() => {
                        const profileFields = [
                            user?.identificationNumber,
                            user?.phone,
                            user?.birthDate,
                            user?.address,
                            user?.emergencyContactName,
                            user?.emergencyContactPhone,
                        ];
                        const completedFields = profileFields.filter(field => typeof field === "string" ? field.trim().length > 0 : !!field).length;
                        const completionPercentage = Math.round((completedFields / profileFields.length) * 100);
                        const isComplete = completionPercentage === 100;
                        return (
                            <StyledView className="mt-4 w-full">
                                <StyledView className="flex-row justify-between items-center mb-1 px-1">
                                    <StyledText className={`text-xs font-bold ${isComplete ? "text-emerald-500" : "text-slate-500 dark:text-slate-400"}`}>
                                        {isComplete ? "Perfil Completo" : "Perfil Incompleto"}
                                    </StyledText>
                                    <StyledText className={`text-xs font-bold ${isComplete ? "text-emerald-500" : "text-nautic-primary dark:text-white"}`}>
                                        {completionPercentage}%
                                    </StyledText>
                                </StyledView>
                                <StyledView className="h-2.5 w-full bg-slate-200 dark:bg-dark-border/50 rounded-full overflow-hidden">
                                    <StyledView
                                        className={`h-full rounded-full ${isComplete ? "bg-emerald-500" : "bg-blue-500"}`}
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </StyledView>
                            </StyledView>
                        );
                    })()}

                </StyledView>

                {/* ===== COMPLETAR INFORMACIÓN ===== */}
                <TouchableOpacity
                    onPress={() => navigation.navigate("CompleteProfile")}
                    className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl p-4 mb-4 flex-row items-center justify-between"
                >
                    <StyledView className="flex-row items-center">
                        <MaterialCommunityIcons name="account-edit-outline" size={24} color="#10b981" />
                        <StyledView className="ml-3">
                            <StyledText className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                                Completar mi información
                            </StyledText>
                            <StyledText className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                                Agrega tu documento y contacto
                            </StyledText>
                        </StyledView>
                    </StyledView>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#10b981" />
                </TouchableOpacity>

                {/* ===== INFORMACIÓN PERSONAL ===== */}
                <StyledView className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm mb-4 border border-slate-100 dark:border-dark-border/50">
                    <StyledText className="text-base font-bold text-nautic-primary dark:text-white mb-4">
                        Información Personal
                    </StyledText>

                    <StyledView className="flex-row items-center mb-4">
                        <MaterialCommunityIcons name="email-outline" size={22} color={colors.textSecondary} style={{ marginRight: 16 }} />
                        <StyledView className="flex-1">
                            <StyledText className="text-xs text-slate-400 dark:text-slate-400">Email</StyledText>
                            <StyledText className="text-sm text-slate-800 dark:text-slate-200 font-semibold">{user?.email}</StyledText>
                        </StyledView>
                    </StyledView>

                    <StyledView className="h-[1px] bg-slate-100 dark:bg-dark-border/50 my-2.5" />

                    <StyledView className="flex-row items-center">
                        <MaterialCommunityIcons name="shield-account-outline" size={22} color={colors.textSecondary} style={{ marginRight: 16 }} />
                        <StyledView className="flex-1">
                            <StyledText className="text-xs text-slate-400 dark:text-slate-400">Rol</StyledText>
                            <StyledText className="text-sm text-slate-800 dark:text-slate-200 font-semibold capitalize">
                                {roleLabel[user?.role ?? ""] ?? user?.role}
                            </StyledText>
                        </StyledView>
                    </StyledView>
                </StyledView>

                {/* ===== AUDITORÍA DE CUENTA ===== */}
                <StyledView className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm mb-4 border border-slate-100 dark:border-dark-border/50">
                    <StyledView className="flex-row items-center mb-4">
                        <ShieldCheck size={18} color="#0B4F9C" style={{ marginRight: 8 }} />
                        <StyledText className="text-base font-bold text-nautic-primary dark:text-white">
                            Datos de Cuenta
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-row items-center mb-3">
                        <MaterialCommunityIcons name="calendar-check-outline" size={20} color="#64748B" style={{ marginRight: 12 }} />
                        <StyledView className="flex-1">
                            <StyledText className="text-xs text-slate-400 dark:text-slate-400">Cuenta creada el</StyledText>
                            <StyledText className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                {formatDate(user?.createdAt)}
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    <StyledView className="h-[1px] bg-slate-100 dark:bg-dark-border/50 my-2" />

                    <StyledView className="flex-row items-center">
                        <MaterialCommunityIcons name="calendar-edit" size={20} color="#64748B" style={{ marginRight: 12 }} />
                        <StyledView className="flex-1">
                            <StyledText className="text-xs text-slate-400 dark:text-slate-400">Última actualización</StyledText>
                            <StyledText className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                {formatDate(user?.updatedAt)}
                            </StyledText>
                        </StyledView>
                    </StyledView>
                </StyledView>



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
