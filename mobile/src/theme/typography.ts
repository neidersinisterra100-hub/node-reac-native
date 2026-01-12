import { Platform, TextStyle } from "react-native";

/**
 * Tipografía global de la app
 * - Android: Ubuntu (si está disponible)
 * - iOS / Web: system-ui (fallback limpio)
 */

const fontFamily =
  Platform.OS === "android"
    ? "Ubuntu"
    : "system-ui";

export const typography = {
  title: {
    fontSize: 25,
    fontWeight: "700" as TextStyle["fontWeight"],
    fontFamily,
  },
  h2: {
    fontSize: 23,
    fontWeight: "600" as TextStyle["fontWeight"],
    fontFamily,
  },

  value: {
    fontSize: 28,
    fontWeight: "700" as TextStyle["fontWeight"],
    fontFamily,
  },

  label: {
    fontSize: 16,
    fontWeight: "500" as TextStyle["fontWeight"],
    fontFamily,
  },

  body: {
    fontSize: 17,
    fontWeight: "400" as TextStyle["fontWeight"],
    fontFamily,
  },
};

// import { TextStyle } from "react-native";

// export const typography = {
//   title: {
//     fontSize: 22,
//     fontWeight: "700" as TextStyle["fontWeight"],
//   },
//   value: {
//     fontSize: 28,
//     fontWeight: "700" as TextStyle["fontWeight"],
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: "500" as TextStyle["fontWeight"],
//   },
//   body: {
//     fontSize: 14,
//     fontWeight: "400" as TextStyle["fontWeight"],
//   },
// };
