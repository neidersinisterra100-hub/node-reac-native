import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { colors } from "../theme/colors";

export default function VerifyEmailScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // redirige al login
      // navigation.replace("Login");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.title}>Cuenta verificada</Text>
      <Text style={styles.subtitle}>
        Ya puedes iniciar sesión en NauticGo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
