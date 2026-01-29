import React from "react";
import { View, TouchableOpacity, ViewStyle } from "react-native";
import { styled } from "nativewind";
import { useTheme } from "../../context/ThemeContext";

const StyledView = styled(View);
const StyledTouchable = styled(TouchableOpacity);

/* =========================================================
   PROPS BASE
   ========================================================= */

interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

/* =========================================================
   CARD (NO PRESIONABLE)
   ========================================================= */

export function Card({
  children,
  className = "",
  style,
}: BaseCardProps) {
  const { isDark } = useTheme();

  return (
    <StyledView
      className={`
        rounded-2xl
        border
        p-4
        shadow-sm
        mb-4

        ${isDark ? "bg-dark-surface border-dark-border" : "bg-white border-slate-200"}
        ${className}
      `}
      style={[{ elevation: 2 }, style]}
    >
      {children}
    </StyledView>
  );
}

/* =========================================================
   PRESSABLE CARD
   ========================================================= */

interface PressableCardProps extends BaseCardProps {
  onPress: () => void;
}

export function PressableCard({
  children,
  className = "",
  style,
  onPress,
}: PressableCardProps) {
  const { isDark } = useTheme();

  return (
    <StyledTouchable
      onPress={onPress}
      activeOpacity={0.9}
      className={`
        rounded-2xl
        border
        p-4
        shadow-sm
        mb-4

        ${isDark ? "bg-dark-surface border-dark-border" : "bg-white border-slate-200"}
        ${className}
      `}
      style={[{ elevation: 2 }, style]}
    >
      {children}
    </StyledTouchable>
  );
}

