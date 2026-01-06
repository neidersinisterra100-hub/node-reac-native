import { View, StyleSheet } from "react-native";
import { Text, TextInput } from "react-native-paper";

import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  error?: string;
};

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  error,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        mode="outlined"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        style={styles.input}
        error={!!error}
      />

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: "#FFF",
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.error,
    fontSize: 12,
  },
});
