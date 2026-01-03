import { View, Text, StyleSheet } from "react-native";
import Card from "./Card";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type Props = {
  title: string;
  subtitle?: string;
  rightValue?: string;
};

export default function ItemCard({ title, subtitle, rightValue }: Props) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {rightValue && <Text style={styles.value}>{rightValue}</Text>}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 12,
  },
  value: {
    fontWeight: "600",
    color: colors.primary,
  },
});
