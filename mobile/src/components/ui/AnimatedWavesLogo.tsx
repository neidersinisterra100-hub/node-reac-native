import { useEffect, useRef } from "react";
import { Platform, Animated, View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../../theme/colors";

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
  animate?: boolean;
};

export default function AnimatedWavesLogo({
  animate = false,
}: Props) {
  const dashOffset = useRef(
    new Animated.Value(0)
  ).current;

  const animationRef =
    useRef<Animated.CompositeAnimation | null>(
      null
    );

  useEffect(() => {
    if (animate) {
      animationRef.current = Animated.loop(
        Animated.timing(dashOffset, {
          toValue: -200,
          duration: 4000,
          useNativeDriver: false, // SVG
        })
      );

      animationRef.current.start();
    } else {
      animationRef.current?.stop();
      dashOffset.setValue(0);
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [animate]);

  return (
    <View
      style={styles.container}
      /* 🔥 FIX PARA RN WEB */
      collapsable={
        Platform.OS === "web"
          ? undefined
          : false
      }
    >
      <Svg
        width={140}
        height={44}
        viewBox="0 0 120 40"
        fill="none"
      >
        <AnimatedPath
          d="M0 20 Q 15 10 30 20 T 60 20 T 90 20 T 120 20"
          stroke={colors.primary}
          strokeWidth={3}
          fill="none"
          strokeDasharray="12 8"
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
});