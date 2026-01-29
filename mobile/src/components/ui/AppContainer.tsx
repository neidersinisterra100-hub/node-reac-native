import React from "react";
import { SafeAreaView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import { useTheme } from "../../context/ThemeContext";

const StyledSafeArea = styled(SafeAreaView);
const StyledView = styled(View);

interface AppContainerProps {
  children: React.ReactNode;
}

export default function AppContainer({
  children,
}: AppContainerProps) {
  const { isDark } = useTheme();

  return (
    <StyledSafeArea
      className="
        flex-1
        bg-nautic-bg
        dark:bg-dark-bg
      "
    >
      {/* StatusBar sigue sincronizado con el tema */}
      <StatusBar style={isDark ? "light" : "dark"} />

      <StyledView
        className="
          flex-1
          bg-nautic-bg
          dark:bg-dark-bg
        "
      >
        {children}
      </StyledView>
    </StyledSafeArea>
  );
}
