import React, { useState } from "react";
import { View, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import { validateTicketRequest } from "../services/ticket.service";
import { colors } from "../theme/colors";

export default function ValidateTicketScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleValidate = async () => {
    if (!code.trim()) {
        Alert.alert("Error", "Ingresa el código del ticket");
        return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await validateTicketRequest(code.trim());
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

  return (
    <AppContainer>
      <AppHeader title="Validar Ticket" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
            
            <View style={styles.card}>
                <Text style={styles.title}>Ingresar Código</Text>
                <Text style={styles.subtitle}>Escribe el código que aparece en el ticket del pasajero.</Text>

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
                    label="Validar Ticket" 
                    onPress={handleValidate} 
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
  }
});
