import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = {
  title: string;
  value: string;
  subtitle?: string;
};

export default function DashboardCard({ title, value, subtitle }: Props) {
  return (
    <View style={styles.wrapper}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.value}>{value}</Text>

          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,                 // 🔑 para que funcione en rows
    margin: spacing.sm,
  },
  card: {
    borderRadius: 16,
  },
  title: {
    ...typography.label,
    color: colors.textSecondary,
  },
  value: {
    ...typography.value,
    marginTop: spacing.sm,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 12,
    fontWeight: "600",
    color: colors.success,
  },
});
