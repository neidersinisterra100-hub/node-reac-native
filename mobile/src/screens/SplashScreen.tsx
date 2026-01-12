import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions, Text } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import StaticLogo from "../components/ui/StaticLogo";

const { width } = Dimensions.get("window");

type Props = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: Props) {
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current; // Opacidad Logo
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Escala Logo
  const progressAnim = useRef(new Animated.Value(0)).current; // Línea de carga
  const textOpacity = useRef(new Animated.Value(0)).current; // Texto eslogan

  useEffect(() => {
    // 1. Animación de Entrada del Logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Animación de Texto (Eslogan) con retraso
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 800,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // 3. Barra de Carga Sutil
    Animated.timing(progressAnim, {
      toValue: 1, // 100% width
      duration: 2500, // Duración total del splash
      useNativeDriver: false, // width no soporta native driver
    }).start(({ finished }) => {
      if (finished) {
        // Animación de Salida
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => onFinish());
      }
    });

  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      {/* Fondo Degradado Sutil */}
      <LinearGradient
        colors={['#f8fafc', '#e0f2fe']} // Blanco a Azul Muy Claro
        style={StyleSheet.absoluteFill}
      />

      {/* Contenido Central */}
      <View style={styles.content}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
           <StaticLogo size={1.5} />
        </Animated.View>

        <Animated.View style={{ opacity: textOpacity, marginTop: 20 }}>
            <Text style={styles.slogan}>Tu viaje, nuestra prioridad</Text>
        </Animated.View>
      </View>

      {/* Línea de Carga Sutil al fondo */}
      <View style={styles.footer}>
          <View style={styles.progressBarBackground}>
            <Animated.View 
                style={[
                    styles.progressBarFill, 
                    { width: progressWidth }
                ]} 
            />
          </View>
          <Text style={styles.version}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  slogan: {
      fontSize: 14,
      color: '#64748b',
      letterSpacing: 1,
      fontStyle: 'italic',
      fontWeight: '500',
  },
  footer: {
      position: 'absolute',
      bottom: 50,
      width: '60%',
      alignItems: 'center',
  },
  progressBarBackground: {
      height: 3,
      width: '100%',
      backgroundColor: '#e2e8f0',
      borderRadius: 1.5,
      overflow: 'hidden',
      marginBottom: 10,
  },
  progressBarFill: {
      height: '100%',
      backgroundColor: '#2563eb', // Azul brillante
      borderRadius: 1.5,
  },
  version: {
      fontSize: 10,
      color: '#94a3b8',
  }
});
