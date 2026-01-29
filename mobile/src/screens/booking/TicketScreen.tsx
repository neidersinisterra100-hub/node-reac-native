import React, { useRef } from 'react';
import { View, Text, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Share2, Download, Home, MapPin, Ship } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const StyledText = styled(Text);
const StyledView = styled(View);

type TicketRouteProp = RouteProp<RootStackParamList, 'Ticket'>;

export const TicketScreen = () => {
    const route = useRoute<TicketRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { ticketId, seatNumber, transactionId } = route.params;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=NAUTICGO-${transactionId}-${seatNumber}`;

    const handleShare = async () => {
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert(`Uh oh`, `Sharing isn't available on your platform`);
            return;
        }
        // Mock sharing text or file
        Alert.alert('Compartir', 'Función de compartir ticket (Simulada).');
    };

    return (
        <ScreenContainer>
            <StyledView className="flex-1 bg-nautic-primary">
                <StyledView className="flex-row justify-between items-center p-4 mt-2">
                    <TouchableOpacity onPress={() => navigation.navigate('Tabs')}>
                        <Home size={24} color="#FFF" />
                    </TouchableOpacity>
                    <StyledText className="text-white text-lg font-bold">Tu Ticket</StyledText>
                    <TouchableOpacity onPress={handleShare}>
                        <Share2 size={24} color="#FFF" />
                    </TouchableOpacity>
                </StyledView>

                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                    <Card className="rounded-3xl overflow-hidden p-0">
                        {/* Header */}
                        <StyledView className="bg-nautic-secondary p-6 items-center border-b border-nautic-accent/20 dashed">
                            <StyledText className="text-nautic-primary font-bold text-xl tracking-widest">NAUTICGO</StyledText>
                            <StyledText className="text-gray-500 text-xs uppercase tracking-widest mt-1">Boarding Pass</StyledText>
                        </StyledView>

                        {/* Content */}
                        <StyledView className="p-6">
                            <StyledView className="flex-row justify-between items-center mb-6">
                                <StyledView>
                                    <StyledText className="text-gray-400 text-xs font-bold uppercase mb-1">Pasajero</StyledText>
                                    <StyledText className="text-nautic-text font-bold text-lg">Neider S.</StyledText>
                                </StyledView>
                                <StyledView className="items-end">
                                    <StyledText className="text-gray-400 text-xs font-bold uppercase mb-1">Asiento</StyledText>
                                    <StyledText className="text-nautic-primary font-bold text-2xl">{seatNumber}</StyledText>
                                </StyledView>
                            </StyledView>

                            <StyledView className="flex-row justify-between items-center mb-6">
                                <StyledView>
                                    <StyledText className="text-gray-400 text-xs font-bold uppercase mb-1">Fecha</StyledText>
                                    <StyledText className="text-nautic-text font-bold">20 Oct 2026</StyledText>
                                </StyledView>
                                <StyledView>
                                    <StyledText className="text-gray-400 text-xs font-bold uppercase mb-1">Hora</StyledText>
                                    <StyledText className="text-nautic-text font-bold">08:00 AM</StyledText>
                                </StyledView>
                                <StyledView>
                                    <StyledText className="text-gray-400 text-xs font-bold uppercase mb-1">Clase</StyledText>
                                    <StyledText className="text-nautic-text font-bold">Standard</StyledText>
                                </StyledView>
                            </StyledView>

                            <StyledView className="flex-row items-center justify-between mb-8 bg-gray-50 p-4 rounded-xl">
                                <StyledView className="items-center">
                                    <StyledText className="text-2xl font-bold text-nautic-text">BUN</StyledText>
                                    <StyledText className="text-xs text-gray-400">Buenaventura</StyledText>
                                </StyledView>

                                <Ship size={24} color="#0B4F9C" />

                                <StyledView className="items-center">
                                    <StyledText className="text-2xl font-bold text-nautic-text">TIM</StyledText>
                                    <StyledText className="text-xs text-gray-400">Timbiquí</StyledText>
                                </StyledView>
                            </StyledView>

                            <StyledView className="items-center">
                                <StyledView className="border-2 border-nautic-primary p-2 rounded-xl">
                                    <Image
                                        source={{ uri: qrUrl }}
                                        style={{ width: 150, height: 150 }}
                                    />
                                </StyledView>
                                <StyledText className="text-xs text-gray-400 mt-2">{transactionId}</StyledText>
                            </StyledView>
                        </StyledView>
                    </Card>

                    <Button
                        title="Descargar Ticket"
                        onPress={() => Alert.alert('Descarga', 'Ticket guardado en galería.')}
                        variant="secondary"
                        icon={<Download size={20} color="#FFF" />}
                        className="mt-4"
                    />
                </ScrollView>
            </StyledView>
        </ScreenContainer>
    );
};
