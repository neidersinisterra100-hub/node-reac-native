import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { IconButton } from "react-native-paper";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Building2, CheckCircle2, AlertCircle, Power, Trash2 } from "lucide-react-native";
import { styled } from "nativewind";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

import {
    getMyCompanies,
    getAllCompanies,
    toggleCompanyActive,
    deleteCompany,
    Company
} from "../services/company.service";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function MyCompaniesScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const isOwner = user?.role === "owner" || user?.role === "admin";

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);
            let data: Company[] = [];

            if (isOwner) {
                data = await getMyCompanies();
            } else {
                data = await getAllCompanies();
            }
            setCompanies(data);
        } catch (error: any) {
            setErrorMsg("No se pudieron cargar las empresas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompanies();
    }, [user]);

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await toggleCompanyActive(id, !currentStatus);
            setCompanies(prev => prev.map(c => (c.id === id || c._id === id) ? { ...c, isActive: !currentStatus } : c));
        } catch {
            Alert.alert("Error", "No se pudo cambiar el estado");
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert("Eliminar Empresa", "¿Estás seguro?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteCompany(id);
                        setCompanies(prev => prev.filter(c => (c.id || c._id) !== id));
                    } catch {
                        Alert.alert("Error", "No se pudo eliminar");
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: Company }) => {
        const isActive = Boolean(item.isActive);
        return (
            <StyledTouchableOpacity
                className="bg-white dark:bg-dark-surface rounded-2xl mb-4 shadow-sm overflow-hidden"
                style={{ borderLeftWidth: 4, borderLeftColor: isActive ? "#0B4F9C" : "#94a3b8" }}
                onPress={() => navigation.navigate("CompanyRoutes", {
                    companyId: item.id || item._id || "",
                    companyName: item.name,
                })}
                activeOpacity={0.7}
            >
                <StyledView className="p-5 flex-row items-center border-0">
                    {/* Icono de Empresa */}
                    <StyledView className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/40 justify-center items-center mr-4">
                        <Building2 size={28} color="#0B4F9C" />
                    </StyledView>

                    {/* Información Principal */}
                    <StyledView className="flex-1">
                        <StyledView className="flex-row justify-between items-center mb-1">
                            <StyledText className="text-lg font-extrabold text-nautic-primary dark:text-blue-400 flex-1 leading-tight">
                                {item.name}
                            </StyledText>

                            {/* BADGE DE LEGALIDAD PROFESIONAL */}
                            <StyledView className={`px-2.5 py-1 rounded-full border ${isActive ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                                <StyledText className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-green-700' : 'text-slate-500'}`}>
                                    {isActive ? 'VERIFICADA' : 'PENDIENTE'}
                                </StyledText>
                            </StyledView>
                        </StyledView>

                        <StyledText className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-tighter">NIT: {item.nit || 'Sin registrar'}</StyledText>

                        {isOwner && (
                            <StyledView className="flex-row items-center mt-1">
                                <StyledText className="text-xs text-slate-500 font-bold">Balance:</StyledText>
                                <StyledView className="ml-2 bg-emerald-50 px-2 py-0.5 rounded">
                                    <StyledText className="text-emerald-700 font-black text-xs">${item.balance?.toLocaleString() || '0'}</StyledText>
                                </StyledView>
                            </StyledView>
                        )}
                    </StyledView>
                </StyledView>

                {/* Acciones (Solo Owner) */}
                {isOwner && (
                    <StyledView className="flex-row items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                        <StyledText className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Gestión de Empresa</StyledText>
                        <StyledView className="flex-row items-center gap-3">
                            <TouchableOpacity
                                className={`p-2 rounded-full ${isActive ? 'bg-amber-100' : 'bg-green-100'}`}
                                onPress={() => handleToggle(item.id || item._id || "", isActive)}
                            >
                                <Power size={18} color={isActive ? '#d97706' : '#15803d'} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="p-2 rounded-full bg-blue-100"
                                onPress={() => navigation.navigate("CompanyAdmins", {
                                    companyId: item.id || item._id,
                                    companyName: item.name,
                                })}
                            >
                                <IconButton
                                    icon="account-group"
                                    iconColor="#2563eb"
                                    size={18}
                                    style={{ margin: 0, padding: 0 }}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="p-2 rounded-full bg-red-100"
                                onPress={() => handleDelete(item.id || item._id || "")}
                            >
                                <Trash2 size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </StyledView>
                    </StyledView>
                )}
            </StyledTouchableOpacity>
        );
    };

    return (
        <AppContainer>
            <AppHeader
                title={isOwner ? "Mis Empresas" : "Empresas Disponibles"}
                showBack={true}
                showAvatar={false}
            />

            {errorMsg && (
                <StyledView className="bg-red-50 p-4 rounded-lg mb-4 items-center">
                    <StyledText className="text-red-600">{errorMsg}</StyledText>
                    <TouchableOpacity onPress={loadCompanies}>
                        <StyledText className="text-red-700 font-bold underline mt-1">Reintentar</StyledText>
                    </TouchableOpacity>
                </StyledView>
            )}

            {loading ? (
                <StyledView className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                </StyledView>
            ) : (
                <FlatList
                    data={isOwner ? companies : companies.filter(c => c.isActive)}
                    keyExtractor={(item) => item.id || item._id || Math.random().toString()}
                    refreshing={loading}
                    onRefresh={loadCompanies}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 10, paddingHorizontal: 16 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        isOwner ? (
                            <StyledView className="mb-5">
                                <PrimaryButton
                                    label="Registrar Nueva Empresa"
                                    onPress={() => navigation.navigate("CreateCompany")}
                                />
                            </StyledView>
                        ) : null
                    }
                    ListEmptyComponent={
                        <StyledView className="items-center mt-10">
                            <StyledText className="text-gray-500">No hay empresas registradas.</StyledText>
                        </StyledView>
                    }
                    renderItem={renderItem}
                />
            )}
        </AppContainer>
    );
}
