import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

type Props = {
  name: string;
};

export default function Avatar({ name }: Props) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    ...typography.title,
    color: "#FFF",
  },
});
