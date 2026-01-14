import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppContainer from "../components/ui/AppContainer";
import PrimaryButton from "../components/ui/PrimaryButton";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { login, register, loading, error } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* ================= VALIDATION ================= */
  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isFormValid = (!isRegister || name.trim().length >= 2) && isValidEmail(email) && password.length >= 6;

  /* ================= HANDLERS ================= */
  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    if (isRegister) {
      await register({ name, email, password });
    } else {
      await login({ email, password });
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <AppContainer>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.card}>
            {/* 🔵 HEADER: CIRCLE ICON */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="account" size={32} color="white" />
              </View>
              <Text style={styles.title}>{isRegister ? "Crear Cuenta" : "Bienvenido"}</Text>
              <Text style={styles.subtitle}>
                {isRegister ? "Regístrate para comenzar" : "Ingresa a tu dashboard"}
              </Text>
            </View>

            {/* 🔴 ERROR MESSAGE */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Error</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* 📝 FORM */}
            <View style={styles.form}>
              
              {isRegister && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    mode="outlined"
                    placeholder="Tu Nombre"
                    value={name}
                    onChangeText={setName}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.accent} // Cian
                    style={styles.input}
                    theme={{ colors: { primary: colors.accent } }}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  mode="outlined"
                  placeholder="ejemplo@empresa.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.accent} // Cian
                  style={styles.input}
                  theme={{ colors: { primary: colors.accent } }}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  mode="outlined"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.accent} // Cian
                  style={styles.input}
                  theme={{ colors: { primary: colors.accent } }}
                  right={
                    <TextInput.Icon 
                      icon={showPassword ? "eye-off" : "eye"} 
                      onPress={() => setShowPassword(!showPassword)}
                      color={colors.textSecondary}
                    />
                  }
                />
              </View>

              <View style={{ marginTop: 24 }}>
                <PrimaryButton
                  label={isRegister ? "Registrarse" : "Ingresar"}
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!isFormValid}
                />
              </View>

            </View>

            {/* 🔄 TOGGLE */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}
              </Text>
              <TouchableOpacity onPress={toggleMode}>
                <Text style={styles.linkText}>
                  {isRegister ? " Iniciar sesión" : " Crear cuenta"}
                </Text>
              </TouchableOpacity>
            </View>

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
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary, // Navy
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary, // Navy
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    padding: 12,
    marginBottom: 20,
    borderRadius: 4,
  },
  errorTitle: {
    color: "#991B1B",
    fontWeight: "bold",
    fontSize: 14,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
  },
  form: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "white",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    color: "#4B5563",
    fontSize: 14,
  },
  linkText: {
    color: colors.primary, // Navy
    fontWeight: "bold",
    fontSize: 14,
  },
});
