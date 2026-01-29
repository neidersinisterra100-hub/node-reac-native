import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Image } from 'react-native';
import { styled } from 'nativewind';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { CreditCard, Lock } from 'lucide-react-native';

const StyledText = styled(Text);
const StyledView = styled(View);

type PaymentRouteProp = RouteProp<RootStackParamList, 'Payment'>;

export const PaymentScreen = () => {
    const route = useRoute<PaymentRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { tripId, seatNumber } = route.params;

    const [loading, setLoading] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    const handlePayment = () => {
        if (!cardNumber || !expiry || !cvc) {
            Alert.alert('Error', 'Por favor completa los datos de la tarjeta');
            return;
        }

        setLoading(true);

        // Mock payment delay
        setTimeout(() => {
            setLoading(false);
            Alert.alert('¡Pago Exitoso!', 'Tu reserva ha sido confirmada.', [
                {
                    text: 'Ver Ticket',
                    onPress: () => {
                        navigation.reset({
                            index: 0,
                            routes: [
                                { name: 'Tabs' }, // Back to home stack base
                                {
                                    name: 'Ticket',
                                    params: {
                                        tripId,
                                        seatNumber,
                                        transactionId: Math.random().toString(36).substring(7).toUpperCase()
                                    }
                                }
                            ]
                        });
                    }
                }
            ]);
        }, 2000);
    };

    return (
        <ScreenContainer withPadding>
            <StyledView className="flex-1">
                <StyledView className="flex-row items-center mb-6 mt-2">
                    <Button
                        title="Cancelar"
                        onPress={() => navigation.goBack()}
                        variant="ghost"
                        className="p-0 mr-4"
                    />
                    <StyledText className="text-xl font-bold text-nautic-primary">Pago Seguro</StyledText>
                </StyledView>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Summary Card */}
                    <Card className="bg-nautic-secondary border-nautic-accent/30">
                        <StyledText className="text-gray-500 font-bold text-xs uppercase mb-2">Resumen de Compra</StyledText>
                        <StyledView className="flex-row justify-between mb-1">
                            <StyledText className="text-nautic-primary font-medium">Asiento #{seatNumber}</StyledText>
                            <StyledText className="text-nautic-primary font-bold">$120.000</StyledText>
                        </StyledView>
                        <StyledView className="flex-row justify-between mb-1">
                            <StyledText className="text-gray-500">Tasa por servicio</StyledText>
                            <StyledText className="text-gray-500">$5.000</StyledText>
                        </StyledView>
                        <StyledView className="h-[1px] bg-gray-300 my-2" />
                        <StyledView className="flex-row justify-between">
                            <StyledText className="text-nautic-primary font-bold text-lg">Total</StyledText>
                            <StyledText className="text-nautic-primary font-bold text-lg">$125.000</StyledText>
                        </StyledView>
                    </Card>

                    {/* Payment Form */}
                    <Card>
                        <StyledView className="flex-row items-center mb-4">
                            <CreditCard size={24} color="#0B4F9C" />
                            <StyledText className="text-lg font-bold text-nautic-primary ml-2">Tarjeta de Crédito/Débito</StyledText>
                        </StyledView>

                        <Input
                            label="Número de Tarjeta"
                            placeholder="0000 0000 0000 0000"
                            keyboardType="numeric"
                            value={cardNumber}
                            onChangeText={setCardNumber}
                            maxLength={16}
                        />

                        <StyledView className="flex-row justify-between space-x-4">
                            <StyledView className="flex-1 mr-2">
                                <Input
                                    label="Expiración"
                                    placeholder="MM/YY"
                                    value={expiry}
                                    onChangeText={setExpiry}
                                    maxLength={5}
                                />
                            </StyledView>
                            <StyledView className="flex-1 ml-2">
                                <Input
                                    label="CVC"
                                    placeholder="123"
                                    keyboardType="numeric"
                                    maxLength={3}
                                    value={cvc}
                                    onChangeText={setCvc}
                                    secureTextEntry
                                />
                            </StyledView>
                        </StyledView>

                        <Input
                            label="Nombre en la tarjeta"
                            placeholder="Como aparece en el plástico"
                        />
                    </Card>

                    <StyledView className="flex-row items-center justify-center mt-4 mb-20">
                        <Lock size={16} color="#64748B" />
                        <StyledText className="text-gray-500 text-xs ml-2">Tus datos están encriptados y seguros.</StyledText>
                    </StyledView>
                </ScrollView>

                <StyledView className="absolute bottom-4 left-4 right-4 bg-white/90 p-4 border-t border-gray-100">
                    <Button
                        title="Pagar $125.000"
                        onPress={handlePayment}
                        loading={loading}
                    />
                </StyledView>
            </StyledView>
        </ScreenContainer>
    );
};
