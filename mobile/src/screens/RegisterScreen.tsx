import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  TouchableOpacity
} from "react-native";
import { Text, Checkbox } from "react-native-paper"; // 👈 Import Checkbox
import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import AppContainer from "../components/ui/AppContainer";
import PrimaryButton from "../components/ui/PrimaryButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useAuth } from "../context/AuthContext";

/* ================= HELPERS ================= */
const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function RegisterScreen() {
  const { register, loading, error } = useAuth();
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false); // 👈 Nuevo estado

  const [focused, setFocused] = useState<
    "name" | "email" | "password" | null
  >(null);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });

  /* ================= ANIMATION ================= */
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* ================= VALIDATION ================= */
  const nameError =
    touched.name && name.trim().length < 2
      ? "Ingresa tu nombre"
      : "";

  const emailError =
    touched.email && !isValidEmail(email)
      ? "Ingresa un email válido"
      : "";

  const passwordError =
    touched.password && password.length < 6
      ? "La contraseña debe tener al menos 6 caracteres"
      : "";

  const isFormValid =
    name.trim().length >= 2 &&
    isValidEmail(email) &&
    password.length >= 6 &&
    termsAccepted; // 👈 Validación extra

  /* ================= ACTION ================= */
  const handleRegister = async () => {
    setTouched({ name: true, email: true, password: true });
    if (!isFormValid) return;

    await register({ name, email, password });
  };

  return (
    <AppContainer>
      <Animated.View
        style={[
          styles.container,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <Text style={[typography.title, styles.title]}>
          Crear cuenta
        </Text>

        <Text style={[typography.body, styles.subtitle]}>
          Regístrate para continuar
        </Text>

        {/* ===== NAME ===== */}
        <TextInput
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
          onFocus={() => setFocused("name")}
          onBlur={() => {
            setFocused(null);
            setTouched((p) => ({ ...p, name: true }));
          }}
          style={[
            styles.input,
            focused === "name" && styles.inputFocused,
            nameError && styles.inputError,
          ]}
        />
        {nameError && (
          <Text style={styles.fieldError}>{nameError}</Text>
        )}

        {/* ===== EMAIL ===== */}
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocused("email")}
          onBlur={() => {
            setFocused(null);
            setTouched((p) => ({ ...p, email: true }));
          }}
          style={[
            styles.input,
            focused === "email" && styles.inputFocused,
            emailError && styles.inputError,
          ]}
        />
        {emailError && (
          <Text style={styles.fieldError}>{emailError}</Text>
        )}

        {/* ===== PASSWORD ===== */}
        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocused("password")}
          onBlur={() => {
            setFocused(null);
            setTouched((p) => ({ ...p, password: true }));
          }}
          style={[
            styles.input,
            focused === "password" && styles.inputFocused,
            passwordError && styles.inputError,
          ]}
        />
        {passwordError && (
          <Text style={styles.fieldError}>
            {passwordError}
          </Text>
        )}

        {/* ===== TERMS AND CONDITIONS ===== */}
        <View style={styles.termsContainer}>
            <Checkbox.Android
                status={termsAccepted ? 'checked' : 'unchecked'}
                onPress={() => setTermsAccepted(!termsAccepted)}
                color={colors.primary}
            />
            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
                <Text style={{ color: colors.textSecondary }}>Acepto los </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Terms")}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Términos y Condiciones</Text>
                </TouchableOpacity>
            </View>
        </View>

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <PrimaryButton
          label="Crear cuenta"
          loading={loading}
          onPress={handleRegister}
          disabled={!isFormValid}
        />

        {/* ===== LOGIN LINK ===== */}
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>
            ¿Ya tienes cuenta?{" "}
            <Text style={styles.loginBold}>
              Inicia sesión
            </Text>
          </Text>
        </Pressable>
      </Animated.View>
    </AppContainer>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingTop: spacing.xl * 2,
  },

  title: {
    color: colors.textPrimary,
  },

  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    color: colors.textPrimary,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: "#FFF",
    marginTop: spacing.sm,

    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,

    ...(Platform.OS === "web"
      ? {
          outlineStyle: "none",
        }
      : {}),
  },

  inputFocused: {
    borderColor: colors.primary,
  },

  inputError: {
    borderColor: colors.error,
  },

  fieldError: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },

  error: {
    marginTop: spacing.md,
    color: colors.error,
  },

  termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 20,
  },

  loginLink: {
    marginTop: spacing.lg,
    alignItems: "center",
  },

  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  loginBold: {
    fontWeight: "700",
    color: colors.primary,
  },
});
