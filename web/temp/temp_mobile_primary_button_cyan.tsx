import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export default function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}: PrimaryButtonProps) {

  const getBackgroundColor = () => {
      if (disabled) return "#d1d5db"; // gray-300
      if (variant === "danger") return colors.error;
      if (variant === "secondary") return "white";
      return colors.primary; // Cian
  };

  const getTextColor = () => {
      if (variant === "secondary") return colors.textPrimary;
      return "white";
  };

  const getBorderColor = () => {
      if (variant === "secondary") return colors.border;
      return "transparent";
  };

  return (
    <TouchableOpacity
      style={[
          styles.button, 
          { backgroundColor: getBackgroundColor(), borderColor: getBorderColor() },
          variant === 'primary' && !disabled && styles.primaryShadow
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? "#374151" : "#FFF"} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    button: {
        height: 48,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    text: {
        fontWeight: '600',
        fontSize: 16,
    },
    primaryShadow: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    }
});
