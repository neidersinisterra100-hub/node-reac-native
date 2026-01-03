import { SafeAreaView, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default function AppContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
