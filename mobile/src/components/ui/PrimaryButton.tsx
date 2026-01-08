import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

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
  
  const baseStyle = "h-12 rounded-xl flex-row justify-center items-center shadow-sm active:opacity-80";
  
  let bgStyle = "bg-dashboard-orange"; // primary
  if (variant === "secondary") bgStyle = "bg-white border border-gray-200";
  if (variant === "danger") bgStyle = "bg-red-500";
  if (disabled) bgStyle = "bg-gray-300";

  const textStyle = variant === "secondary" ? "text-gray-700" : "text-white";

  return (
    <TouchableOpacity
      className={`${baseStyle} ${bgStyle}`}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? "#374151" : "#FFF"} />
      ) : (
        <Text className={`font-semibold text-base ${textStyle}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
