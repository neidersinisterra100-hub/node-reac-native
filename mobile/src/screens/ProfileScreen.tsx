import React from "react";
import { View, ScrollView } from "react-native";
import { Text, Avatar, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styled } from "nativewind";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

const StyledView = styled(View);
const StyledText = styled(Text);

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    return (
        <AppContainer>
            <AppHeader title="Mi Perfil" />

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <StyledView className="items-center mb-8">
                    <Avatar.Text
                        size={80}
                        label={user?.name?.substring(0, 2).toUpperCase() || "US"}
                        style={{ backgroundColor: colors.primary }}
                        color="white"
                    />
                    <StyledText className="text-2xl font-bold text-nautic-primary mt-4">{user?.name}</StyledText>
                    <StyledText className="text-base text-gray-500 mt-1">{user?.role === 'owner' ? 'Propietario' : 'Usuario'}</StyledText>
                </StyledView>

                <StyledView className="bg-white rounded-2xl p-5 shadow-sm elevation-2 mb-6">
                    <StyledText className="text-lg font-semibold text-nautic-primary mb-4">Información Personal</StyledText>

                    <StyledView className="flex-row items-center mb-4">
                        <MaterialCommunityIcons name="email-outline" size={24} color={colors.textSecondary} style={{ marginRight: 16 }} />
                        <StyledView className="flex-1">
                            <StyledText className="text-xs text-gray-500">Email</StyledText>
                            <StyledText className="text-base text-gray-900 font-medium">{user?.email}</StyledText>
                        </StyledView>
                    </StyledView>

                    <Divider style={{ marginVertical: 12 }} />

                    <StyledView className="flex-row items-center">
                        <MaterialCommunityIcons name="shield-account-outline" size={24} color={colors.textSecondary} style={{ marginRight: 16 }} />
                        <StyledView className="flex-1">
                            <StyledText className="text-xs text-gray-500">Rol</StyledText>
                            <StyledText className="text-base text-gray-900 font-medium capitalize">{user?.role}</StyledText>
                        </StyledView>
                    </StyledView>
                </StyledView>

                <StyledView className="mt-8">
                    <PrimaryButton
                        label="Cerrar Sesión"
                        onPress={logout}
                        variant="danger"
                    />
                </StyledView>
            </ScrollView>
        </AppContainer>
    );
}
