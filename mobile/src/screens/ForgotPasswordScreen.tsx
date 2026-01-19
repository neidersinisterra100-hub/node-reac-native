import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text, TextInput } from "react-native-paper";

import AppContainer from "../components/ui/AppContainer";
import PrimaryButton from "../components/ui/PrimaryButton";
import { colors } from "../theme/colors";
import { requestPasswordReset } from "../services/auth.service";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setError("Ingresa un correo válido");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await requestPasswordReset(email);

      setSuccess(true);
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.title}>Recuperar contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo y te enviaremos instrucciones para restablecer
              tu contraseña.
            </Text>

            {success && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  Si el correo existe, te enviamos instrucciones para recuperar
                  tu contraseña.
                </Text>
              </View>
            )}

            {!success && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    mode="outlined"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    outlineColor={colors.border}
                    activeOutlineColor={colors.accent}
                    style={styles.input}
                  />
                </View>

                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}

                <PrimaryButton
                  label="Enviar instrucciones"
                  onPress={handleSubmit}
                  loading={loading}
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "white",
    fontSize: 16,
  },
  successContainer: {
    backgroundColor: "#ECFEFF",
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    padding: 12,
    borderRadius: 4,
  },
  successText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  errorText: {
    color: colors.error,
    marginBottom: 12,
    fontSize: 13,
  },
});
