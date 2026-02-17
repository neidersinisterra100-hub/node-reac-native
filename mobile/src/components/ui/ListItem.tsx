import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Card } from "./Card";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type Props = {
  title: string;
  subtitle?: string;
  trailing?: string;
};

export default function ListItem({ title, subtitle, trailing }: Props) {
  return (
    <Card>
      <View style={styles.container}>
        <View style={styles.left}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {trailing && (
          <Text style={styles.trailing}>{trailing}</Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: {
    flex: 1,
    paddingRight: spacing.sm,
  },

  title: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  subtitle: {
    ...typography.body,
    fontSize: 12,
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },

  trailing: {
    ...typography.body,
    fontWeight: "600",
    color: colors.primary,
  },
});
