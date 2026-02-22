import React from 'react';
import { View, Text, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Share2, Download, ArrowLeft, MapPin, Ship, Loader2 } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { getTicketById } from '../../services/ticket.service';
import { Ticket as UITicket } from '../../types/ticket';
import { formatTimeAmPm } from '../../utils/time';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const StyledText = styled(Text);
const StyledView = styled(View);

type TicketRouteProp = RouteProp<RootStackParamList, 'Ticket'>;

export const TicketScreen = () => {
    const route = useRoute<TicketRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { ticketId, transactionId, seatNumber: seatParam } = route.params;

    const [ticket, setTicket] = React.useState<UITicket | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadTicket();
    }, [ticketId]);

    const loadTicket = async () => {
        try {
            setLoading(true);
            const data = await getTicketById(ticketId);
            setTicket(data);
        } catch (error) {
            console.error("Error loading ticket:", error);
        } finally {
            setLoading(false);
        }
    };

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=NAUTICGO-${transactionId || ticket?.code}-${seatParam || ticket?.seatNumber}`;

    // Descomponer ruta (Origen → Destino)
    const routeNames = ticket?.routeName?.split(' → ') || ['Origen', 'Destino'];
    const originName = routeNames[0];
    const destinationName = routeNames[1] || 'Destino';

    const handleShare = async () => {
        try {
            if (!ticket) return;

            const htmlContent = `
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                    <style>
                        body { font-family: 'Helvetica'; padding: 40px; color: #1a1a1b; }
                        .ticket { border: 2px solid #0B4F9C; border-radius: 20px; overflow: hidden; }
                        .header { background: #f0f7ff; padding: 20px; text-align: center; border-bottom: 2px dashed #cbd5e1; }
                        .content { padding: 30px; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 20px; }
                        .label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }
                        .value { font-size: 18px; font-weight: bold; margin-top: 4px; }
                        .route { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; }
                        .qr { text-align: center; margin-top: 20px; }
                        .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 40px; }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <div class="header">
                            <h1 style="color: #0B4F9C; margin: 0; letter-spacing: 4px;">NAUTICGO</h1>
                            <p style="margin: 5px 0 0; font-size: 10px; color: #64748b;">PASE DE ABORDAJE OFICIAL</p>
                        </div>
                        <div class="content">
                            <div class="row">
                                <div>
                                    <div class="label">Pasajero</div>
                                    <div class="value">${ticket?.user?.name || 'Pasajero'}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div class="label">Asiento</div>
                                    <div class="value" style="color: #0B4F9C; font-size: 24px;">${ticket.seatNumber || 'G'}</div>
                                </div>
                            </div>
                            <div class="row">
                                <div>
                                    <div class="label">Fecha</div>
                                    <div class="value">${ticket.date ? format(new Date(ticket.date), 'dd MMM yyyy', { locale: es }) : '-'}</div>
                                </div>
                                <div>
                                    <div class="label">Hora</div>
                                    <div class="value">${formatTimeAmPm(ticket.departureAt)}</div>
                                </div>
                            </div>
                            <div class="route">
                                <div style="flex: 1;">
                                    <div class="label">Origen</div>
                                    <div class="value">${originName}</div>
                                </div>
                                <div style="padding: 0 20px; color: #0B4F9C; font-size: 24px;">⛴</div>
                                <div style="flex: 1; text-align: right;">
                                    <div class="label">Destino</div>
                                    <div class="value">${destinationName}</div>
                                </div>
                            </div>
                            <div class="qr">
                                <img src="${qrUrl}" width="150" height="150" style="border: 2px solid #0B4F9C; padding: 5px; border-radius: 10px;" />
                                <div style="margin-top: 10px; font-size: 12px; color: #64748b;">${ticket.code || transactionId}</div>
                            </div>
                        </div>
                    </div>
                    <div class="footer">
                        Este es un documento oficial de NauticGo. Por favor preséntelo al abordar.
                    </div>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Compartir mi Ticket',
                    UTI: 'com.adobe.pdf',
                });
            } else {
                Alert.alert('Éxito', 'Ticket generado correctamente como PDF.');
            }
        } catch (error) {
            console.error("Error al compartir:", error);
            Alert.alert("Error", "No se pudo generar el ticket para compartir.");
        }
    };

    return (
        <ScreenContainer>
            <StyledView className="flex-1 bg-nautic-primary">
                <StyledView className="flex-row justify-between items-center p-4 mt-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                    <StyledText className="text-white text-lg font-bold">Tu Ticket</StyledText>
                    <TouchableOpacity onPress={handleShare}>
                        <Share2 size={24} color="#FFF" />
                    </TouchableOpacity>
                </StyledView>

                {loading ? (
                    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                        <Card className="rounded-3xl overflow-hidden p-0">
                            {/* Skeleton Header */}
                            <StyledView className="bg-nautic-secondary p-8 items-center border-b-2 border-nautic-accent/30 border-dashed relative">
                                <StyledView className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-nautic-primary" />
                                <StyledView className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-nautic-primary" />
                                <StyledView className="w-48 h-48 bg-white/10 rounded-2xl animate-pulse" />
                                <StyledView className="mt-3 w-40 h-4 bg-white/20 rounded animate-pulse" />
                            </StyledView>

                            {/* Skeleton Route */}
                            <StyledView className="p-6">
                                <StyledView className="flex-row items-center justify-between mb-6">
                                    <StyledView className="items-center flex-1">
                                        <StyledView className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                                        <StyledView className="mt-2 w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </StyledView>
                                    <StyledView className="flex-1 items-center">
                                        <StyledView className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <StyledView className="mt-1 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                                    </StyledView>
                                    <StyledView className="items-center flex-1">
                                        <StyledView className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                                        <StyledView className="mt-2 w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </StyledView>
                                </StyledView>

                                {/* Skeleton Details */}
                                <StyledView className="border-t border-dashed border-gray-200 pt-4 space-y-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <StyledView key={i} className="flex-row justify-between items-center py-2">
                                            <StyledView className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                            <StyledView className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        </StyledView>
                                    ))}
                                </StyledView>
                            </StyledView>
                        </Card>

                        <StyledText className="text-white/50 text-center text-sm mt-4 animate-pulse">
                            Generando tu ticket...
                        </StyledText>
                    </ScrollView>
                ) : (
                    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                        <Card className="rounded-3xl overflow-hidden p-0">
                            {/* Header al estilo Boarding Pass */}
                            <StyledView className="bg-nautic-secondary p-8 items-center border-b-2 border-nautic-accent/30 border-dashed relative">
                                {/* Círculos decorativos para el efecto de "recorte" */}
                                <StyledView className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-nautic-primary" />
                                <StyledView className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-nautic-primary" />

                                <StyledText className="text-nautic-primary font-black text-2xl tracking-[4px]">NAUTICGO</StyledText>
                                <StyledText className="text-nautic-primary/60 text-[10px] font-bold uppercase tracking-[2px] mt-2">Pase de abordaje oficial</StyledText>
                            </StyledView>

                            {/* Content */}
                            <StyledView className="p-6">
                                <StyledView className="flex-row justify-between items-center mb-6">
                                    <StyledView>
                                        <StyledText className="text-gray-400 text-xs font-bold uppercase mb-1">Pasajero</StyledText>
                                        <StyledText className="text-nautic-text font-bold text-lg">{ticket?.user?.name || 'Pasajero'}</StyledText>
                                    </StyledView>
                                    <StyledView className="items-end">
                                        <StyledText className="text-gray-400 text-xs font-bold uppercase mb-1">Asiento</StyledText>
                                        <StyledText className="text-nautic-primary font-bold text-2xl">{ticket?.seatNumber || 'G'}</StyledText>
                                    </StyledView>
                                </StyledView>

                                <StyledView className="flex-row justify-between items-center mb-6">
                                    <StyledView>
                                        <StyledText className="text-gray-400 text-xs font-bold uppercase mb-1">Fecha</StyledText>
                                        <StyledText className="text-nautic-text font-bold">
                                            {ticket?.date ? format(new Date(ticket.date), 'dd MMM yyyy', { locale: es }) : '-'}
                                        </StyledText>
                                    </StyledView>
                                    <StyledView>
                                        <StyledText className="text-gray-400 text-xs font-bold uppercase mb-1">Hora</StyledText>
                                        <StyledText className="text-nautic-text font-bold">
                                            {formatTimeAmPm(ticket?.departureAt)}
                                        </StyledText>
                                    </StyledView>
                                    <StyledView>
                                        <StyledText className="text-gray-400 text-xs font-bold uppercase mb-1">Transporte</StyledText>
                                        <StyledText className="text-nautic-text font-bold capitalize">{ticket?.transport || 'Lancha'}</StyledText>
                                    </StyledView>
                                </StyledView>

                                <StyledView className="flex-row items-center justify-between mb-8 px-2">
                                    {/* Origen */}
                                    <StyledView className="flex-1">
                                        <StyledText className="text-gray-400 text-[10px] font-bold uppercase mb-1">Origen</StyledText>
                                        <TouchableOpacity onPress={() => Alert.alert('Origen', originName)}>
                                            <StyledText
                                                className="text-lg font-black text-nautic-primary"
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                {originName}
                                            </StyledText>
                                        </TouchableOpacity>
                                    </StyledView>

                                    {/* Conector */}
                                    <StyledView className="px-4 items-center">
                                        <Ship size={24} color="#0B4F9C" />
                                        <StyledView className="w-10 h-[1px] bg-gray-200 mt-2" />
                                    </StyledView>

                                    {/* Destino */}
                                    <StyledView className="flex-1 items-end">
                                        <StyledText className="text-gray-400 text-[10px] font-bold uppercase mb-1">Destino</StyledText>
                                        <TouchableOpacity onPress={() => Alert.alert('Destino', destinationName)}>
                                            <StyledText
                                                className="text-lg font-black text-gray-800 text-right"
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                {destinationName}
                                            </StyledText>
                                        </TouchableOpacity>
                                    </StyledView>
                                </StyledView>

                                <StyledView className="items-center">
                                    <StyledView className="border-2 border-nautic-primary p-2 rounded-xl">
                                        <Image
                                            source={{ uri: qrUrl }}
                                            style={{ width: 150, height: 150 }}
                                        />
                                    </StyledView>
                                    <StyledText className="text-xs text-gray-400 mt-2">{ticket?.code || transactionId}</StyledText>
                                </StyledView>
                            </StyledView>
                        </Card>

                        <Button
                            title="Descargar o Compartir"
                            onPress={handleShare}
                            variant="primary"
                            icon={<Download size={20} color="#FFF" />}
                            className="mt-6 shadow-lg shadow-nautic-primary/30"
                        />
                    </ScrollView>
                )}
            </StyledView>
        </ScreenContainer>
    );
};
