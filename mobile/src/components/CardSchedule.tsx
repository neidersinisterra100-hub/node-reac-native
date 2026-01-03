import { View, Text, StyleSheet } from "react-native";

export default function CardSchedule({ name, origin, destination, schedule }: any) {
  return (
    <View style={styles.card}>
      <Text>{name}</Text>
      <Text>{origin} → {destination}</Text>
      <Text>{new Date(schedule).toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 10, margin: 5, borderWidth: 1, borderRadius: 5 }
});
