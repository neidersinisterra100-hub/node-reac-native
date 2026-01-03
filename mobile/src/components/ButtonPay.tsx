import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function ButtonPay({ title, onPress }: any) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 10, backgroundColor: "blue", borderRadius: 5 },
  text: { color: "#fff", fontWeight: "bold" }
});
