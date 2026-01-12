import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

export default function StaticLogo({ size = 1 }: { size?: number }) {
  const iconSize = 40 * size;
  const fontSize = 32 * size;

  return (
    <View style={styles.container}>
      {/* Icono Marítimo con fondo degradado Océano */}
      <LinearGradient
        colors={['#0ea5e9', '#0284c7']}
        style={[styles.iconContainer, { width: iconSize * 1.5, height: iconSize * 1.5, borderRadius: iconSize * 0.5 }]}
      >
        <MaterialCommunityIcons name="sail-boat" size={iconSize} color="white" />
      </LinearGradient>

      {/* Texto Elegante NauticGo */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { fontSize }]}>
          Nautic<Text style={styles.highlight}>Go</Text>
        </Text>
        <Text style={[styles.subtitle, { fontSize: fontSize * 0.35 }]}>
          MARITIME
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 12,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    marginBottom: 8,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontWeight: "800",
    color: "#0c4a6e", // Azul océano profundo
    letterSpacing: -0.5,
  },
  highlight: {
    color: "#0ea5e9", // Azul cielo brillante
  },
  subtitle: {
    color: "#64748b",
    letterSpacing: 6,
    fontWeight: "600",
    marginTop: -4,
  }
});
