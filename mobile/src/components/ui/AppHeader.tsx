import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient'; // 👈 Importante

import { useAuth } from "../../context/AuthContext";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { Image } from "react-native";

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showGreeting?: boolean;
  rightAction?: React.ReactNode;
  showAvatar?: boolean;
  neon?: boolean;
  hideLogo?: boolean;
}

export default function AppHeader({
  title,
  subtitle,
  showBack,
  showGreeting,
  rightAction,
  showAvatar = true,
  neon,
}: Props) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleOpenMenu = () => {
    navigation.navigate("Menu");
  };

  return (
    <LinearGradient
      // Mismos colores que DashboardScreen
      colors={['#1e3a8a', '#3b82f6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* ===== TOP ROW (Avatar + Actions) ===== */}
      <View style={styles.topRow}>
        {/* <View style={styles.avatarPlaceholder}>
          <Image
            source={require("../../assets/logo-transmilenio.svg")} // ajusta el nombre si es distinto
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View> */}

        {/* {showAvatar ? (
          <TouchableOpacity onPress={handleOpenMenu} style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
                </Text>
            </View>
          </TouchableOpacity>
        ) : (
          showBack ? (
            // Si no hay avatar pero sí Back, mostramos Back arriba a la izquierda si se prefiere,
            // pero el diseño original lo tenía abajo junto al título.
            // Mantendremos el espacio o nada.
            <View style={{ width: 40 }} />
          ) : <View style={{ width: 40 }} />
        )} */}

        <View style={styles.actionsContainer}>
          {rightAction}
        </View>
      </View>

      {/* ===== TITLE / GREETING ===== */}
      <View style={styles.titleContainer}>
        {showBack && (
          <TouchableOpacity onPress={handleGoBack} style={styles.backButtonContainer}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="white" // Icono blanco
            />
          </TouchableOpacity>
        )}

        <View>
          {showGreeting ? (
            <>
              <Text style={styles.greeting}>Hola, {user?.name?.split(" ")[0] || "Viajero"} 👋</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </>
          ) : (
            <>
              {title && <Text style={[styles.title, neon && styles.neonTitle]}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: 20, // 👈 Reducido de spacing.xl (aprox 60+) a 45 para reducir margen
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 30, // 👈 Bordes redondeados como Dashboard
    borderBottomRightRadius: 30,
    elevation: 6,
    marginBottom: 10, // Un poco de margen inferior para separar del contenido
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    minHeight: 40,
  },
  avatarContainer: {
    //
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', // Semitransparente
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: 'white',
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)', // Semitransparente
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  greeting: {
    ...typography.h2,
    color: 'white', // Texto blanco
  },
  title: {
    ...typography.h2,
    color: 'white', // Texto blanco
  },
  neonTitle: {
    color: 'white',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)', // Blanco semitransparente
    marginTop: 2,
  },
  avatarImage: {
    width: 36,
    height: 36,
  },

});
