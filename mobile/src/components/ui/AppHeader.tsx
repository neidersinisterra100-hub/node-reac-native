import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styled } from "nativewind";

import { useAuth } from "../../context/AuthContext";

const StyledView = styled(View);
const StyledText = styled(Text);

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showGreeting?: boolean;
  rightAction?: React.ReactNode;
  showAvatar?: boolean;
  hideLogo?: boolean;
  neon?: boolean;
}

export default function AppHeader({
  title,
  subtitle,
  showBack,
  showGreeting,
  rightAction,
  showAvatar = true,
  hideLogo = false,
  neon,
}: Props) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleOpenMenu = () => {
    navigation.navigate("Menu");
  };

  return (
    <StyledView
      className="
        px-5 pt-12 pb-6 mb-3
        rounded-b-[30px]
        shadow-md
        bg-nautic-primary
        dark:bg-dark-surface
      "
    >
      {/* ===== TOP ROW ===== */}
      <StyledView className="flex-row justify-between items-center mb-4 min-h-[40px]">
        {showAvatar && !hideLogo ? (
          <TouchableOpacity
            onPress={handleOpenMenu}
            className="
              w-10 h-10 rounded-full
              bg-white/20 dark:bg-dark-bg
              border border-white/30 dark:border-dark-border
              items-center justify-center
            "
          >
            <StyledText className="text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </StyledText>
          </TouchableOpacity>
        ) : (
          <StyledView className="w-10" />
        )}

        <StyledView className="flex-row items-center gap-3">
          {rightAction}
        </StyledView>
      </StyledView>

      {/* ===== TITLE / GREETING ===== */}
      <StyledView className="flex-row items-center gap-3">
        {showBack && (
          <TouchableOpacity
            onPress={handleGoBack}
            className="
              w-10 h-10 rounded-xl
              bg-white/20 dark:bg-dark-bg
              border border-white/30 dark:border-dark-border
              items-center justify-center
            "
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="white"
            />
          </TouchableOpacity>
        )}

        <StyledView>
          {showGreeting ? (
            <>
              <StyledText className="text-xl font-bold text-white">
                Hola, {user?.name?.split(" ")[0] || "Viajero"} 👋
              </StyledText>
              {subtitle && (
                <StyledText className="text-sm text-white/80">
                  {subtitle}
                </StyledText>
              )}
            </>
          ) : (
            <>
              {title && (
                <StyledText
                  className={`
                    text-xl font-bold text-white
                    ${neon ? "shadow-lg" : ""}
                  `}
                >
                  {title}
                </StyledText>
              )}
              {subtitle && (
                <StyledText className="text-sm text-white/80">
                  {subtitle}
                </StyledText>
              )}
            </>
          )}
        </StyledView>
      </StyledView>
    </StyledView>
  );
}
