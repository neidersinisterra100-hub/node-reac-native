import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';

interface AppContainerProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export default function AppContainer({ children, noPadding = false }: AppContainerProps) {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={theme.colors.background} 
      />
      <View style={[
        styles.container, 
        noPadding ? null : styles.padding,
        { backgroundColor: theme.colors.background } // Asegurar fondo correcto
      ]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  padding: {
    // padding: 1,
  }
});
