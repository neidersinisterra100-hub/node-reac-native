export const lightTheme = {
  dark: false,
  colors: {
    background: "#F1F5F9", // Matching nautic-bg
    surface: "#FFFFFF",
    primary: "#0B4F9C", // Matching nautic-primary
    primaryDark: "#083d7a",
    textPrimary: "#1E293B",
    textSecondary: "#64748B",
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
    background: "#0f172a",   // slate-900 (softer than pure black)
    surface: "#1e293b",      // slate-800 (card backgrounds)
    primary: "#00B4D8",      // nautic-accent (brighter for dark mode)
    primaryDark: "#0097a7",
    textPrimary: "#f1f5f9",  // slate-100 (light text)
    textSecondary: "#94a3b8", // slate-400 (muted text)
    border: "#334155",       // slate-700 (subtle borders)
    success: "#22C55E",
    error: "#EF4444",
    card: "#1e293b",         // slate-800
    textInverse: "#0f172a",  // dark background for inverse
  }
};

export type Theme = typeof lightTheme;
