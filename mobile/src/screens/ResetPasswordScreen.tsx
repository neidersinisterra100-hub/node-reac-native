import React, { useEffect, useState } from "react";
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
import { resetPassword } from "../services/auth.service";

type Props = {
  route?: {
    params?: {
      token?: string;
    };
  };
};

export default function ResetPasswordScreen({ route }: Props) {
  const token = route?.params?.token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError(
        "El enlace de recuperación es inválido o ha expirado."
      );
    }
  }, [token]);

  const isValid =
    password.length >= 6 && password === confirmPassword;

  const handleSubmit = async () => {
    if (!isValid || !token) return;

    try {
      setLoading(true);
      setError(null);

      await resetPassword(token, password);

      setSuccess(true);
    } catch (err: any) {
      const message =
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : "No se pudo actualizar la contraseña";

      setError(message);
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
            <Text style={styles.title}>Nueva contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa tu nueva contraseña para acceder a NauticGo.
            </Text>

            {success && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  Contraseña actualizada correctamente. Ya puedes
                  iniciar sesión.
                </Text>
              </View>
            )}

            {!success && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nueva contraseña</Text>
                  <TextInput
                    mode="outlined"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    outlineColor={colors.border}
                    activeOutlineColor={colors.accent}
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Confirmar contraseña
                  </Text>
                  <TextInput
                    mode="outlined"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    outlineColor={colors.border}
                    activeOutlineColor={colors.accent}
                    style={styles.input}
                  />
                </View>

                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}

                <PrimaryButton
                  label="Actualizar contraseña"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!isValid}
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
