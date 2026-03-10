import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

export default function TermsScreen() {
    const navigation = useNavigation();

    const renderSection = (title: string, content: string) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionText}>{content}</Text>
        </View>
    );

    const renderListItem = (text: string) => (
        <View style={styles.listItem}>
            <MaterialCommunityIcons name="circle-small" size={24} color={colors.primary} />
            <Text style={styles.listText}>{text}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Button 
                    icon="arrow-left" 
                    mode="text" 
                    textColor="white" 
                    onPress={() => navigation.goBack()}
                    style={{ alignSelf: 'flex-start', marginLeft: -10 }}
                >
                    Volver
                </Button>
                <Text style={styles.headerTitle}>Términos y Condiciones</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.disclaimerBox}>
                    <MaterialCommunityIcons name="information-outline" size={24} color="#0f172a" />
                    <Text style={styles.disclaimerText}>
                        “Esta plataforma actúa como intermediario tecnológico. El servicio de transporte es prestado directamente por las empresas transportadoras.”
                    </Text>
                </View>

                {renderSection("1. Identificación de la Plataforma", 
                    "La plataforma es una aplicación tecnológica que actúa exclusivamente como intermediaria digital entre usuarios pasajeros y empresas de transporte fluvial y/o marítimo legalmente constituidas. La plataforma NO es propietaria de embarcaciones, NO presta servicios de transporte, ni actúa como empresa transportadora."
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Naturaleza del Servicio</Text>
                    <Text style={styles.sectionText}>Ofrecemos un servicio de intermediación tecnológica, permitiendo a los usuarios:</Text>
                    {renderListItem("Consultar rutas y horarios")}
                    {renderListItem("Comprar tickets digitales")}
                    {renderListItem("Validar tickets")}
                    {renderListItem("Gestionar pasajeros")}
                    {renderListItem("Conectarse con empresas transportadoras independientes")}
                    <Text style={[styles.sectionText, { marginTop: 8, fontWeight: 'bold' }]}>
                        👉 El servicio de transporte es prestado directamente por la empresa transportadora, bajo su exclusiva responsabilidad.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Empresas Transportadoras</Text>
                    <Text style={styles.sectionText}>Las empresas que operan dentro de la plataforma son personas jurídicas independientes y deben contar con:</Text>
                    {renderListItem("Registro mercantil vigente")}
                    {renderListItem("Habilitación para operar transporte fluvial o marítimo")}
                    {renderListItem("Embarcaciones certificadas")}
                    {renderListItem("Capitanes con licencia válida")}
                    {renderListItem("Seguros exigidos por la ley colombiana")}
                    
                    <Text style={[styles.sectionText, { marginTop: 12 }]}>La plataforma no asume responsabilidad por:</Text>
                    {renderListItem("Condiciones de las embarcaciones")}
                    {renderListItem("Seguridad del viaje")}
                    {renderListItem("Cumplimiento de normas técnicas")}
                    {renderListItem("Conducta del personal de la empresa transportadora")}
                </View>

                {renderSection("4. Responsabilidad del Usuario (Pasajero)",
                    "El usuario acepta que el contrato de transporte se celebra directamente con la empresa transportadora. Debe cumplir las normas de seguridad del operador, presentarse a tiempo en el punto de embarque y portar su ticket válido. La plataforma no se hace responsable por cancelaciones por clima, retrasos, cambios de itinerario o incidentes durante el viaje."
                )}

                {renderSection("5. Tickets y Pagos",
                    "El ticket es un comprobante digital de compra. La validez del ticket está sujeta a la fecha y hora del viaje, estado del viaje y validación por la empresa. Los pagos realizados a través de la plataforma son procesados electrónicamente y pueden incluir una comisión por uso de la plataforma."
                )}

                {renderSection("6. Cancelaciones y Reembolsos",
                    "Las políticas de cancelación y reembolso son definidas por cada empresa transportadora. La plataforma puede actuar como intermediaria en la comunicación, pero no garantiza devoluciones automáticas."
                )}

                {renderSection("7. Limitación de Responsabilidad",
                    "La plataforma NO será responsable por accidentes, daños físicos, pérdida de equipaje, fallecimiento, fallas mecánicas o incumplimientos del transportador. Toda reclamación deberá dirigirse directamente contra la empresa transportadora."
                )}

                {renderSection("8. Verificación de Empresas",
                    "La plataforma podrá solicitar documentos legales, marcar empresas como “verificadas” y suspender empresas que incumplan. Sin embargo, la verificación no constituye garantía absoluta del servicio prestado."
                )}

                {renderSection("9. Uso Indebido de la Plataforma",
                    "Está prohibido usar la plataforma con fines fraudulentos, revender tickets sin autorización, manipular validaciones o registrar pasajeros falsos. El incumplimiento puede resultar en suspensión de la cuenta, cancelación de tickets o bloqueo permanente."
                )}

                {renderSection("10. Protección de Datos",
                    "La plataforma cumple con la Ley 1581 de 2012 (Colombia) sobre protección de datos personales. Los datos se usan únicamente para gestión de tickets, contacto operativo y cumplimiento legal."
                )}

                {renderSection("11. Jurisdicción y Ley Aplicable",
                    "Estos términos se rigen por las leyes de la República de Colombia. Cualquier conflicto será resuelto ante los juzgados colombianos competentes."
                )}

                <View style={[styles.section, { borderBottomWidth: 0 }]}>
                    <Text style={styles.sectionTitle}>12. Aceptación</Text>
                    <Text style={styles.sectionText}>
                        Al registrarse y usar la plataforma, el usuario declara que ha leído, comprendido y aceptado estos términos.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: colors.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 10,
        marginBottom: 10,
    },
    content: {
        padding: 20,
    },
    disclaimerBox: {
        backgroundColor: '#e2e8f0',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    disclaimerText: {
        flex: 1,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 24,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    listText: {
        fontSize: 15,
        color: '#475569',
        marginLeft: 4,
    }
});
