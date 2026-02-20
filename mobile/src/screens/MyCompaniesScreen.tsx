import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { IconButton } from "react-native-paper";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Building2, CheckCircle2, AlertCircle } from "lucide-react-native";
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

    const renderItem = ({ item }: { item: Company }) => (
        <StyledTouchableOpacity
            className={`bg-white rounded-2xl mb-4 border border-gray-200 shadow-sm elevation-1 overflow-hidden ${!item.isActive && isOwner ? 'bg-gray-50' : ''}`}
            onPress={() => navigation.navigate("CompanyRoutes", {
                companyId: item.id || item._id || "",
                companyName: item.name,
            })}
            activeOpacity={0.7}
        >
            <StyledView className="p-4 flex-row gap-3">
                {/* Icono de Empresa */}
                <StyledView className="w-12 h-12 rounded-xl bg-blue-50 justify-center items-center">
                    <Building2 size={24} color={colors.primary} />
                </StyledView>

                {/* Información Principal */}
                <StyledView className="flex-1">
                    <StyledView className="flex-row justify-between items-center mb-1">
                        <StyledText className="text-base font-bold text-slate-800 flex-1 mr-2">{item.name}</StyledText>

                        {/* BADGE DE LEGALIDAD PROFESIONAL */}
                        <StyledView className={`flex-row items-center px-2 py-1 rounded-xl gap-1 ${item.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                            {item.active ? (
                                <CheckCircle2 size={12} color="#166534" />
                            ) : (
                                <AlertCircle size={12} color="#991b1b" />
                            )}
                            <StyledText className={`text-[10px] font-bold uppercase ${item.isActive ? 'text-green-800' : 'text-red-800'}`}>
                                {item.isActive ? 'Verificada' : 'Pendiente'}
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    <StyledText className="text-xs text-slate-500 mb-1">NIT: {item.nit || 'Sin registrar'}</StyledText>

                    {isOwner && (
                        <StyledText className="text-xs text-slate-900">
                            Balance: <StyledText className="font-bold">${item.balance?.toLocaleString() || '0'}</StyledText>
                        </StyledText>
                    )}
                </StyledView>
            </StyledView>

            {/* Acciones (Solo Owner) */}
            {isOwner && (
                <StyledView className="flex-row items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100">
                    <StyledText className="text-xs text-slate-400 font-medium">Acciones:</StyledText>
                    <StyledView className="flex-row items-center gap-2">
                        <TouchableOpacity
                            className={`px-3 py-1.5 rounded-lg ${item.isActive ? 'bg-red-50' : 'bg-green-50'}`}
                            onPress={() => handleToggle(item.id || item._id || "", !!item.isActive)}
                        >
                            <StyledText className={`text-xs font-semibold ${item.isActive ? 'text-red-600' : 'text-green-600'}`}>
                                {item.isActive ? 'Desactivar' : 'Activar'}
                            </StyledText>
                        </TouchableOpacity>

                        <IconButton
                            icon="account-group"
                            iconColor="#3b82f6"
                            size={20}
                            style={{ margin: 0 }}
                            onPress={() => navigation.navigate("CompanyAdmins", {
                                companyId: item.id || item._id,
                                companyName: item.name,
                            })}
                        />

                        <IconButton
                            icon="delete-outline"
                            iconColor="#ef4444"
                            size={20}
                            style={{ margin: 0 }}
                            onPress={() => handleDelete(item.id || item._id || "")}
                        />
                    </StyledView>
                </StyledView>
            )}
        </StyledTouchableOpacity>
    );

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
