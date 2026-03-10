import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import { validateTicketRequest } from "../services/ticket.service";
import { colors } from "../theme/colors";

/* =========================================================
   VALIDATE TICKET SCREEN
   ========================================================= */

export default function ValidateTicketScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  /* ================= CAMERA ================= */

  const [permission, requestPermission] =
    useCameraPermissions();

  const [showCamera, setShowCamera] =
    useState(false);

  const [scanned, setScanned] =
    useState(false);

  /* =========================================================
     VALIDACIÓN MANUAL / AUTOMÁTICA
     ========================================================= */

  const handleValidate = async (
    inputCode: string = code
  ) => {
    const codeToValidate = inputCode.trim();

    if (!codeToValidate) {
      Alert.alert(
        "Error",
        "Ingresa el código del ticket"
      );
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data =
        await validateTicketRequest(codeToValidate);

      setResult({
        success: true,
        ...data,
      });
    } catch (error: any) {
      setResult({
        success: false,
        message:
          error?.response?.data?.message ||
          "Ticket inválido",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     ESCANEO QR
     ========================================================= */

  const handleBarCodeScanned = (
    result: BarcodeScanningResult
  ) => {
    if (scanned) return;

    setScanned(true);
    setShowCamera(false);

    const scannedCode = result.data;
    setCode(scannedCode);

    Alert.alert(
      "Código detectado",
      scannedCode,
      [
        {
          text: "Validar",
          onPress: () =>
            handleValidate(scannedCode),
        },
      ]
    );
  };

  /* =========================================================
     ABRIR CÁMARA (CON PERMISOS BIEN HECHOS)
     ========================================================= */

  const openCamera = async () => {
    // Pedir permiso si no existe o no está concedido
    if (!permission?.granted) {
      const response =
        await requestPermission();

      if (!response.granted) {
        Alert.alert(
          "Permiso requerido",
          "Necesitamos acceso a la cámara para escanear el QR"
        );
        return;
      }
    }

    setScanned(false);
    setShowCamera(true);
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <AppContainer>
      <AppHeader title="Validar Ticket" showBack />

      {/* ================= MODAL CÁMARA ================= */}
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() =>
          setShowCamera(false)
        }
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "black",
          }}
        >
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={
              scanned
                ? undefined
                : handleBarCodeScanned
            }
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />

          {/* Overlay visual */}
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              onPress={() =>
                setShowCamera(false)
              }
              style={styles.closeCameraButton}
            >
              <MaterialCommunityIcons
                name="close"
                size={30}
                color="white"
              />
            </TouchableOpacity>

            <View style={styles.scanArea}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>

            <Text style={styles.scanText}>
              Centra el código QR en el
              cuadro
            </Text>
          </View>
        </View>
      </Modal>

      {/* ================= CONTENIDO ================= */}
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >
          <View style={styles.card}>
            <Text style={styles.title}>
              Ingresar Código
            </Text>

            <Text style={styles.subtitle}>
              Escanea el QR o escribe el
              código manualmente
            </Text>

            <TouchableOpacity
              onPress={openCamera}
              style={styles.scanButton}
            >
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={32}
                color="white"
              />
              <Text
                style={styles.scanButtonText}
              >
                Escanear QR
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Ej: A1B2C3"
              placeholderTextColor="#9ca3af"
              value={code}
              onChangeText={(text) =>
                setCode(text.toUpperCase())
              }
              autoCapitalize="characters"
            />

            <PrimaryButton
              label="Validar manualmente"
              onPress={() =>
                handleValidate()
              }
              loading={loading}
            />
          </View>

          {result && (
            <View
              style={[
                styles.resultCard,
                result.success
                  ? styles.successCard
                  : styles.errorCard,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  result.success
                    ? "check-circle"
                    : "alert-circle"
                }
                size={48}
                color={
                  result.success
                    ? "#166534"
                    : "#991b1b"
                }
              />
              <Text
                style={[
                  styles.resultTitle,
                  {
                    color: result.success
                      ? "#166534"
                      : "#991b1b",
                  },
                ]}
              >
                {result.success
                  ? "¡Ticket válido!"
                  : "Ticket inválido"}
              </Text>

              <Text
                style={styles.resultMessage}
              >
                {result.message}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppContainer>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const styles = StyleSheet.create({
  content: { padding: 20 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 24,
  },
  scanButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  scanButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 16,
    fontSize: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  resultCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  successCard: {
    backgroundColor: "#dcfce7",
  },
  errorCard: {
    backgroundColor: "#fee2e2",
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 12,
  },
  resultMessage: {
    marginTop: 8,
    textAlign: "center",
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeCameraButton: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  scanArea: {
    width: 250,
    height: 250,
  },
  scanText: {
    color: "white",
    marginTop: 24,
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#00bcd4",
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#00bcd4",
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#00bcd4",
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#00bcd4",
  },
});
