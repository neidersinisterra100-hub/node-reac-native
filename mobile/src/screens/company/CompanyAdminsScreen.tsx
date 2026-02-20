import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { getCompanyAdmins, addAdmin, removeAdmin, inviteAdmin, CompanyAdmin } from '../../services/company.service';
import { styled } from 'nativewind';
import { Trash2, UserPlus, Mail, Shield, User } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

type ScreenRouteProp = RouteProp<RootStackParamList, 'CompanyAdmins'>;

export const CompanyAdminsScreen = () => {
    const route = useRoute<ScreenRouteProp>();
    const navigation = useNavigation();
    const { companyId, companyName } = route.params;

    const [admins, setAdmins] = useState<CompanyAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [addUserId, setAddUserId] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await getCompanyAdmins(companyId);
            setAdmins(data);
        } catch (error) {
            console.error("Error fetching admins:", error);
            Alert.alert("Error", "No se pudieron cargar los administradores.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail) return;
        try {
            await inviteAdmin(companyId, inviteEmail);
            Alert.alert("Éxito", "Invitación enviada correctamente.");
            setInviteEmail('');
            fetchAdmins();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Error al invitar.");
        }
    };

    const handleAddById = async () => {
        if (!addUserId) return;
        try {
            await addAdmin(companyId, addUserId);
            Alert.alert("Éxito", "Administrador agregado.");
            setAddUserId('');
            fetchAdmins();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Error al agregar.");
        }
    };

    const handleRemove = (adminId: string) => {
        Alert.alert("Eliminar Administrador", "¿Estás seguro?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar",
                style: "destructive",
                onPress: async () => {
                    try {
                        await removeAdmin(companyId, adminId);
                        setAdmins(prev => prev.filter(a => (a._id || a.id) !== adminId));
                    } catch (error: any) {
                        Alert.alert("Error", "No se pudo eliminar.");
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: CompanyAdmin }) => (
        <StyledView className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100">
            <StyledView className="flex-row items-center gap-3">
                <StyledView className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                    <User size={20} color="#0B4F9C" />
                </StyledView>
                <StyledView>
                    <StyledText className="font-bold text-gray-800">{item.name}</StyledText>
                    <StyledText className="text-xs text-gray-500">{item.email}</StyledText>
                </StyledView>
            </StyledView>
            <StyledTouchableOpacity onPress={() => handleRemove(item._id || item.id)} className="p-2 bg-red-50 rounded-lg">
                <Trash2 size={20} color="#ef4444" />
            </StyledTouchableOpacity>
        </StyledView>
    );

    return (
        <StyledView className="flex-1 bg-gray-50">
            {/* Header */}
            <StyledView className="bg-nautic-primary pt-12 pb-6 px-6 rounded-b-[32px] shadow-sm mb-4">
                <StyledView className="flex-row items-center mb-2">
                    <StyledTouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                        <StyledText className="text-white text-2xl">←</StyledText>
                    </StyledTouchableOpacity>
                    <StyledText className="text-white text-xl font-bold flex-1">Gestión de Equipo</StyledText>
                </StyledView>
                <StyledText className="text-white/80 text-sm ml-8">{companyName}</StyledText>
            </StyledView>

            <FlatList
                data={admins}
                keyExtractor={(item) => item._id || item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); fetchAdmins(); }}
                ListHeaderComponent={
                    <StyledView className="mb-6 space-y-6">
                        {/* Invite Section */}
                        <StyledView className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                            <StyledView className="flex-row items-center gap-2 mb-3">
                                <Mail size={20} color="#0B4F9C" />
                                <StyledText className="font-bold text-gray-800">Invitar por Email</StyledText>
                            </StyledView>
                            <StyledTextInput
                                className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 text-gray-800"
                                placeholder="ejemplo@email.com"
                                value={inviteEmail}
                                onChangeText={setInviteEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <StyledTouchableOpacity onPress={handleInvite} className="bg-blue-600 p-3 rounded-lg items-center">
                                <StyledText className="text-white font-bold">Enviar Invitación</StyledText>
                            </StyledTouchableOpacity>
                        </StyledView>

                        {/* Add ID Section */}
                        <StyledView className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <StyledView className="flex-row items-center gap-2 mb-3">
                                <UserPlus size={20} color="#0B4F9C" />
                                <StyledText className="font-bold text-gray-800">Agregar por ID</StyledText>
                            </StyledView>
                            <StyledTextInput
                                className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 text-gray-800"
                                placeholder="ID de usuario..."
                                value={addUserId}
                                onChangeText={setAddUserId}
                                autoCapitalize="none"
                            />
                            <StyledTouchableOpacity onPress={handleAddById} className="bg-gray-600 p-3 rounded-lg items-center">
                                <StyledText className="text-white font-bold">Agregar Directamente</StyledText>
                            </StyledTouchableOpacity>
                        </StyledView>

                        <StyledText className="text-lg font-bold text-gray-800 mt-4 mb-2">Administradores</StyledText>
                    </StyledView>
                }
                ListEmptyComponent={
                    !loading ? (
                        <StyledText className="text-center text-gray-500 mt-4">No hay administradores adicionales.</StyledText>
                    ) : null
                }
            />

            {loading && (
                <StyledView className="absolute inset-0 justify-center items-center bg-black/10">
                    <ActivityIndicator size="large" color="#0B4F9C" />
                </StyledView>
            )}
        </StyledView>
    );
};
