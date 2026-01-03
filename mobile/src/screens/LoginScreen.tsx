import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Animated,
  Platform,
  Pressable,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppContainer from "../components/ui/AppContainer";
import PrimaryButton from "../components/ui/PrimaryButton";
import { spacing } from "../theme/spacing";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { useAuth } from "../context/AuthContext";

/* ================= HELPERS ================= */

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/* ================= SCREEN ================= */

export default function LoginScreen() {
  const { login, register, loading, error } = useAuth();

  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
  }, [isRegister]);

  /* ================= VALIDATION ================= */

  const nameError =
    isRegister &&
      touched.name &&
      name.trim().length < 2
      ? "Ingresa tu nombre"
      : null;

  const emailError =
    touched.email && !isValidEmail(email)
      ? "Ingresa un email válido"
      : null;

  const passwordError =
    touched.password && password.length < 6
      ? "La contraseña debe tener al menos 6 caracteres"
      : null;

  const isFormValid =
    (!isRegister || name.trim().length >= 2) &&
    isValidEmail(email) &&
    password.length >= 6;

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    setTouched({
      name: true,
      email: true,
      password: true,
    });

    if (!isFormValid) return;

    if (isRegister) {
      await register({
        name,
        email,
        password,
      });
    } else {
      await login({
        email,
        password,
      });
    }
  };

  const toggleMode = () => {
    setIsRegister((v) => !v);
    setTouched({
      name: false,
      email: false,
      password: false,
    });
  };
  /* ================= RENDER ================= */
  return (
    <AppContainer>
      <Animated.View
        style={[
          styles.container,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <Text style={[typography.title, styles.title]}>
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </Text>
        {isRegister && (
          <>
            <TextInput
              placeholder="Nombre"
              placeholderTextColor={colors.textSecondary}
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
          </>
        )}

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
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
        {/* {typeof emailError === "string" && emailError && (
            <Text style={styles.fieldError}>{emailError}</Text>
          )} */}

        
        {emailError && (
          <Text style={styles.fieldError}>{emailError}</Text>
        )}

        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={!showPassword}
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
              styles.passwordInput,
            ]}
          />
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eye}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name={
                showPassword
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={24}
              color={
                passwordError ? colors.error : colors.primary
              }
            />
          </Pressable>
        </View>

        {/* {typeof passwordError === "string" && passwordError && (
          <Text style={styles.fieldError}>{passwordError}</Text>
        )} */}

        
        {passwordError && (
          <Text style={styles.fieldError}>{passwordError}</Text>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
       

        <PrimaryButton
          label={isRegister ? "Crear cuenta" : "Iniciar sesión"}
          loading={loading}
          onPress={handleSubmit}
          disabled={!isFormValid}
        />

        <Pressable onPress={toggleMode}>
          <Text style={styles.toggleText}>
            {isRegister
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Crea una"}
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
    marginBottom: spacing.lg,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: "#FFF",
    marginTop: spacing.sm,
    fontSize: 22,
    color: colors.primary,
    // ...typography.body,
    ...(Platform.OS === "web"
      ? { outlineStyle: "none", outlineWidth: 0 }
      : {}),
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldError: {
    fontSize: 13,
    color: colors.error,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.error,
    marginTop: spacing.md,
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eye: {
    position: "absolute",
    right: spacing.md,
    height: "100%",
    justifyContent: "center",
  },
  toggleText: {
    marginTop: spacing.lg,
    textAlign: "center",
    color: colors.primary,
    ...typography.label,
  },
});
