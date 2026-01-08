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
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  error?: string;
};

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
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
        secureTextEntry={secureTextEntry}
        outlineColor={colors.border}
        activeOutlineColor={colors.accent} // 👈 USAR ACENTO (CIAN)
        style={styles.input}
        error={!!error}
        theme={{
            colors: {
                primary: colors.accent, // Para el cursor y label flotante
            }
        }}
      />

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#FFF",
  },
  errorText: {
    marginTop: 4,
    color: colors.error,
    fontSize: 12,
  },
});
