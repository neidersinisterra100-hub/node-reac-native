import React from 'react';
import { View, StyleSheet, Text, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ProPlanModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProPlanModal({ visible, onClose }: ProPlanModalProps) {
  return (
    <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
    >
        <View style={styles.overlay}>
            <View style={styles.modalContainer}>
                
                {/* Header Gradiente */}
                <LinearGradient
                    colors={['#2563eb', '#4338ca']}
                    style={styles.header}
                >
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="lightning-bolt" size={32} color="#fde047" />
                    </View>
                    <Text style={styles.title}>Desbloquea el Plan Pro</Text>
                    <Text style={styles.subtitle}>Lleva tu empresa al siguiente nivel</Text>
                </LinearGradient>

                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Esta función es exclusiva para miembros Pro</Text>

                    <View style={styles.features}>
                        <FeatureItem text="Reportes avanzados" />
                        <FeatureItem text="Gestión ilimitada de flotas" />
                        <FeatureItem text="Soporte prioritario 24/7" />
                        <FeatureItem text="Exportación de datos" />
                    </View>

                    <TouchableOpacity 
                        style={styles.upgradeBtn}
                        onPress={() => {
                            alert("Redirigiendo a pagos...");
                            onClose();
                        }}
                    >
                        <Text style={styles.upgradeText}>Actualizar a Pro ahora</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                        <Text style={styles.cancelText}>Quizás más tarde</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    </Modal>
  );
}

const FeatureItem = ({ text }: { text: string }) => (
    <View style={styles.featureRow}>
        <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10
    },
    header: {
        padding: 24,
        alignItems: 'center'
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 14,
        color: '#e0e7ff',
        marginTop: 4,
        textAlign: 'center'
    },
    content: {
        padding: 24
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 20
    },
    features: {
        marginBottom: 24
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12
    },
    featureText: {
        fontSize: 14,
        color: '#4b5563'
    },
    upgradeBtn: {
        backgroundColor: '#2563eb',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 12,
        elevation: 4,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4
    },
    upgradeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    cancelBtn: {
        padding: 12,
        alignItems: 'center'
    },
    cancelText: {
        color: '#6b7280',
        fontWeight: '500'
    }
});
