import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { lightTheme, darkTheme, Theme } from "../theme/theme";

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const defaultContext: ThemeContextType = {
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => console.warn("ThemeProvider not found"),
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme, setColorScheme } = useColorScheme();

  const [isDark, setIsDark] = useState(colorScheme === "dark");

  /* =========================
     LOAD SAVED THEME
     ========================= */
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("theme_preference");

      if (stored === "dark" || stored === "light") {
        setIsDark(stored === "dark");
        setColorScheme(stored); // 🔥 AVISA A NATIVEWIND
      }
    })();
  }, []);

  /* =========================
     TOGGLE THEME
     ========================= */
  const toggleTheme = async () => {
    const nextIsDark = !isDark;
    const nextTheme = nextIsDark ? "dark" : "light";

    setIsDark(nextIsDark);
    setColorScheme(nextTheme); // 🔥 ESTO ES LO QUE FALTABA

    await AsyncStorage.setItem("theme_preference", nextTheme);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);



// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useColorScheme } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { lightTheme, darkTheme, Theme } from '../theme/theme';

// type ThemeContextType = {
//   theme: Theme;
//   isDark: boolean;
//   toggleTheme: () => void;
// };

// // Valor por defecto seguro para evitar crash si se usa fuera del provider (aunque no debería)
// const defaultContext: ThemeContextType = {
//   theme: lightTheme,
//   isDark: false,
//   toggleTheme: () => console.warn("ThemeProvider not found"),
// };

// const ThemeContext = createContext<ThemeContextType>(defaultContext);

// export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
//   const systemScheme = useColorScheme();
//   const [isDark, setIsDark] = useState(systemScheme === 'dark');

//   useEffect(() => {
//     loadTheme();
//   }, []);

//   const loadTheme = async () => {
//     try {
//       const stored = await AsyncStorage.getItem('theme_preference');
//       if (stored) {
//         setIsDark(stored === 'dark');
//       }
//     } catch (e) {
//       console.log('Error loading theme', e);
//     }
//   };

//   const toggleTheme = async () => {
//     console.log("Toggling theme...");
//     const newMode = !isDark;
//     setIsDark(newMode);
//     try {
//       await AsyncStorage.setItem('theme_preference', newMode ? 'dark' : 'light');
//     } catch (e) {
//       console.log('Error saving theme', e);
//     }
//   };

//   const theme = isDark ? darkTheme : lightTheme;

//   return (
//     <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => useContext(ThemeContext);
