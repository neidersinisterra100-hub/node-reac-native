import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { styled } from 'nativewind';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';

const StyledText = styled(Text);
const StyledView = styled(View);

export const LoginScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingresa correo y contraseña');
            return;
        }

        setLoading(true);
        try {
            const success = await login({ email, password });
            if (success) {
                // Navigation handled by AuthContext state change (AppNavigator switches stack)
            }
        } catch (error) {
            Alert.alert('Error', 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer withPadding>
            <StyledView className="flex-1 justify-center">
                <StyledView className="items-center mb-10">
                    {/* Placeholder for Logo */}
                    <StyledView className="w-24 h-24 bg-nautic-primary rounded-full mb-4 items-center justify-center shadow-lg">
                        <StyledText className="text-white text-3xl font-bold">NG</StyledText>
                    </StyledView>
                    <StyledText className="text-4xl font-bold text-nautic-primary">NauticGo</StyledText>
                    <StyledText className="text-nautic-lightText text-base mt-2 tracking-wide">Transporte fluvial seguro</StyledText>
                </StyledView>

                <StyledView className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <Input
                        label="Correo Electrónico"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Input
                        label="Contraseña"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity className="self-end mb-6">
                        <StyledText className="text-nautic-accent font-medium">¿Olvidaste tu contraseña?</StyledText>
                    </TouchableOpacity>

                    <Button
                        title="Iniciar Sesión"
                        onPress={handleLogin}
                        loading={loading}
                    />
                </StyledView>

                <StyledView className="flex-row justify-center mt-8">
                    <StyledText className="text-gray-500">¿No tienes cuenta? </StyledText>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <StyledText className="text-nautic-primary font-bold">Regístrate</StyledText>
                    </TouchableOpacity>
                </StyledView>
            </StyledView>
        </ScreenContainer>
    );
};
