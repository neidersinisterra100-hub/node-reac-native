export const lightTheme = {
  dark: false,
  colors: {
    background: "#F8F9FA",
    surface: "#FFFFFF",
    primary: "#00bcd4",
    primaryDark: "#0097a7",
    textPrimary: "#1C1C1C",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    success: "#22C55E",
    error: "#EF4444",
    card: "#FFFFFF",
    textInverse: "#FFFFFF",
  }
};

export const darkTheme = {
  dark: true,
  colors: {
    background: "#121212",
    surface: "#1E1E1E",
    primary: "#00bcd4",
    primaryDark: "#008ba3",
    textPrimary: "#E0E0E0",
    textSecondary: "#A0A0A0",
    border: "#333333",
    success: "#22C55E",
    error: "#EF4444",
    card: "#1E1E1E",
    textInverse: "#121212",
  }
};

export type Theme = typeof lightTheme;
