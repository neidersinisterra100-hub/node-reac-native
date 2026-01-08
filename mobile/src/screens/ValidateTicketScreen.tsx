import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView, Modal, TouchableOpacity } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from 'expo-camera';

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import { validateTicketRequest } from "../services/ticket.service";
import { colors } from "../theme/colors";

export default function ValidateTicketScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Cámara
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleValidate = async (inputCode: string = code) => {
    const codeToValidate = inputCode.trim();
    
    if (!codeToValidate) {
        Alert.alert("Error", "Ingresa el código del ticket");
        return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await validateTicketRequest(codeToValidate);
      setResult({ success: true, ...data });
    } catch (error: any) {
      setResult({ 
          success: false, 
          message: error?.response?.data?.message || "Ticket Inválido o Error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = ({ data }: any) => {
      setScanned(true);
      setShowCamera(false);
      setCode(data);
      Alert.alert("Código Escaneado", data);
      handleValidate(data);
  };

  const openCamera = async () => {
      if (!permission) {
          await requestPermission();
      }
      if (!permission?.granted) {
          const { status } = await requestPermission();
          if (status !== 'granted') {
              Alert.alert("Permiso denegado", "Se necesita acceso a la cámara");
              return;
          }
      }
      setScanned(false);
      setShowCamera(true);
  };

  return (
    <AppContainer>
      <AppHeader title="Validar Ticket" />

      {/* MODAL CÁMARA */}
      <Modal visible={showCamera} animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'black' }}>
              <CameraView
                  style={StyleSheet.absoluteFillObject}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                      barcodeTypes: ["qr"],
                  }}
              />
              <View style={styles.cameraOverlay}>
                  <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.closeCameraButton}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Cerrar Cámara</Text>
                  </TouchableOpacity>
                  <View style={styles.scanFrame} />
                  <Text style={styles.scanText}>Apunta al código QR del ticket</Text>
              </View>
          </View>
      </Modal>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
            
            <View style={styles.card}>
                <Text style={styles.title}>Ingresar Código</Text>
                <Text style={styles.subtitle}>Escanea el QR o escribe el código manualmente.</Text>

                {/* BOTÓN ESCANEAR */}
                <TouchableOpacity onPress={openCamera} style={styles.scanButton}>
                    <MaterialCommunityIcons name="qrcode-scan" size={32} color="white" />
                    <Text style={styles.scanButtonText}>Escanear QR</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>O</Text>
                    <View style={styles.line} />
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Ej: A1B2C3"
                    placeholderTextColor="#9ca3af"
                    value={code}
                    onChangeText={text => setCode(text.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={10}
                />

                <PrimaryButton 
                    label="Validar Manualmente" 
                    onPress={() => handleValidate()} 
                    loading={loading}
                />
            </View>

            {/* RESULTADO */}
            {result && (
                <View style={[styles.resultCard, result.success ? styles.successCard : styles.errorCard]}>
                    <MaterialCommunityIcons 
                        name={result.success ? "check-circle" : "alert-circle"} 
                        size={48} 
                        color={result.success ? "#166534" : "#991b1b"} 
                    />
                    <Text style={[styles.resultTitle, { color: result.success ? "#166534" : "#991b1b" }]}>
                        {result.success ? "¡Ticket Válido!" : "Ticket Inválido"}
                    </Text>
                    
                    <Text style={styles.resultMessage}>{result.message}</Text>

                    {result.success && (
                        <View style={styles.details}>
                            <Text style={styles.detailText}>Pasajero: {result.passenger}</Text>
                            <Text style={styles.detailText}>Ruta: {result.routeName}</Text>
                        </View>
                    )}
                </View>
            )}

        </ScrollView>
      </KeyboardAvoidingView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  card: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
  },
  title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 8,
      textAlign: "center",
  },
  subtitle: {
      fontSize: 14,
      color: "#6b7280",
      textAlign: "center",
      marginBottom: 24,
  },
  scanButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      gap: 12,
      marginBottom: 20,
  },
  scanButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
  },
  divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
  },
  line: {
      flex: 1,
      height: 1,
      backgroundColor: '#e5e7eb',
  },
  orText: {
      marginHorizontal: 12,
      color: '#9ca3af',
      fontWeight: 'bold',
  },
  input: {
      backgroundColor: "#f3f4f6",
      borderRadius: 12,
      padding: 16,
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      letterSpacing: 4,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      color: "#1f2937",
  },
  resultCard: {
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
  },
  successCard: {
      backgroundColor: "#dcfce7",
      borderColor: "#86efac",
  },
  errorCard: {
      backgroundColor: "#fee2e2",
      borderColor: "#fca5a5",
  },
  resultTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginTop: 12,
      marginBottom: 8,
  },
  resultMessage: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 16,
      color: "#374151",
  },
  details: {
      width: "100%",
      backgroundColor: "rgba(255,255,255,0.5)",
      padding: 12,
      borderRadius: 8,
  },
  detailText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1f2937",
      textAlign: "center",
      marginBottom: 4,
  },
  cameraOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  closeCameraButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      padding: 10,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 8,
  },
  scanFrame: {
      width: 250,
      height: 250,
      borderWidth: 2,
      borderColor: '#00bcd4', // Cian para el marco
      backgroundColor: 'transparent',
  },
  scanText: {
      color: 'white',
      marginTop: 20,
      fontSize: 16,
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: 8,
      borderRadius: 8,
  }
});
