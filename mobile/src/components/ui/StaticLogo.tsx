import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

export default function StaticLogo() {
  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>Transmilenio</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.5,
    ...typography.title,
  },
});


// import Svg, { Path, Text as SvgText } from "react-native-svg";

// export default function StaticLogo({
//   width = 220,
//   height = 40,
// }: {
//   width?: number;
//   height?: number;
// }) {
//   return (
//     <Svg width={width} height={height} viewBox="0 0 220 40">
//       {/* Olas ESTÁTICAS */}
//       <Path
//         d="M10 26c4-6 10-6 14 0 4-6 10-6 14 0"
//         fill="none"
//         stroke="#2563EB"
//         strokeWidth={2.5}
//         strokeLinecap="round"
//       />
//       <Path
//         d="M10 30c4-6 10-6 14 0 4-6 10-6 14 0"
//         fill="none"
//         stroke="#60A5FA"
//         strokeWidth={2}
//         strokeLinecap="round"
//       />

//       {/* TEXTO CURSIVO (EL QUE QUIERES) */}
//       <SvgText
//         x="50"
//         y="28"
//         fontSize={22}
//         fontWeight="600"
//         fill="#0F172A"
//         fontFamily="cursive, 'Brush Script MT', 'Segoe Script', system-ui"
//       >
//         Transmilenio
//       </SvgText>
//     </Svg>
//   );
// }
