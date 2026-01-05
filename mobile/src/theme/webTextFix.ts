import { Platform } from "react-native";

export const webTextFix =
  Platform.OS === "web"
    ? {
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
      }
    : {};
