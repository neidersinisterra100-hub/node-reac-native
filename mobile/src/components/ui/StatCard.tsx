import { Text, StyleSheet } from "react-native";
import Card from "./Card";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type Props = {
  label: string;
  value: string;
  hint?: string;
};

export default function StatCard({ label, value, hint }: Props) {
  return (
    <Card>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  value: {
    ...typography.value,
    marginTop: spacing.sm,
    color: colors.textPrimary,
  },
  hint: {
    marginTop: spacing.xs,
    color: colors.success,
    fontSize: 12,
    fontWeight: "600",
  }, 
});
