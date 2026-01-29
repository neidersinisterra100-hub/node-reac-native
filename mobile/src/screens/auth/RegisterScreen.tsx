import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
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

export const RegisterScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            const success = await register({ name, email, password });
            if (success) {
                Alert.alert('Éxito', 'Cuenta creada. Por favor inicia sesión.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') }
                ]);
            }
        } catch (error) {
            // Error handled in context
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <StyledView className="mb-8 mt-4 px-4">
                    <StyledText className="text-3xl font-bold text-nautic-primary">Crear Cuenta</StyledText>
                    <StyledText className="text-nautic-lightText text-base mt-2">Únete a NauticGo para viajar seguro</StyledText>
                </StyledView>

                <StyledView className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 mx-4">
                    <Input
                        label="Nombre Completo"
                        placeholder="Tu nombre"
                        value={name}
                        onChangeText={setName}
                    />
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
                    <Input
                        label="Confirmar Contraseña"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <Button
                        title="Registrarse"
                        onPress={handleRegister}
                        loading={loading}
                        className="mt-4"
                    />
                </StyledView>

                <StyledView className="flex-row justify-center mb-8">
                    <StyledText className="text-gray-500">¿Ya tienes cuenta? </StyledText>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <StyledText className="text-nautic-primary font-bold">Inicia Sesión</StyledText>
                    </TouchableOpacity>
                </StyledView>
            </ScrollView>
        </ScreenContainer>
    );
};
