// import { useEffect, useRef } from "react";
// import { Animated, View, StyleSheet } from "react-native";
// import Svg, { Path, G } from "react-native-svg";
// import { colors } from "../../theme/colors";

// const AnimatedG = Animated.createAnimatedComponent(G);

// type Props = {
//   animate?: boolean;
// };

// export default function AnimatedWavesLogo({
//   animate = false,
// }: Props) {
//   const translateX = useRef(new Animated.Value(0)).current;
//   const animationRef = useRef<Animated.CompositeAnimation | null>(null);

//   useEffect(() => {
//     if (animate) {
//       animationRef.current = Animated.loop(
//         Animated.timing(translateX, {
//           toValue: -40,
//           duration: 6000, // ⏱ velocidad suave
//           useNativeDriver: true,
//         })
//       );

//       animationRef.current.start();
//     } else {
//       animationRef.current?.stop();
//       translateX.setValue(0);
//     }

//     return () => {
//       animationRef.current?.stop();
//     };
//   }, [animate]);

//   return (
//     <View style={styles.container}>
//       <Svg
//         width={180}
//         height={48}
//         viewBox="0 0 180 48"
//         fill="none"
//       >
//         <AnimatedG
//           style={{
//             transform: [{ translateX }],
//           }}
//         >
//           <Path
//             d="M0 24 Q 20 14 40 24 T 80 24 T 120 24 T 160 24 T 200 24"
//             stroke={colors.primary}
//             strokeWidth={3.5}
//             fill="none"
//             strokeLinecap="round"
//           />
//         </AnimatedG>
//       </Svg>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
// });


import { useEffect, useRef } from "react";
import { Platform, Animated, View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../../theme/colors";

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
  animate?: boolean;
};

// export default function AnimatedWavesLogo() {
//   return (
//     <View style={styles.container}>
//       <Svg width={160} height={50} viewBox="0 0 120 40">
//         <Path
//           d="M0 20 Q 15 10 30 20 T 60 20 T 90 20 T 120 20"
//           stroke={colors.primary}
//           strokeWidth={3}
//           fill="none"
//           strokeLinecap="round"
//         />
//       </Svg>
//     </View>
//   );
// }

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