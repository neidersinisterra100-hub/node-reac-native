import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { getMyTickets } from "../../services/ticket.service";

export default function MyTicketsScreen() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await getMyTickets();
        setTickets(data);
      } catch (err) {
        console.log("Error cargando tickets", err);
      }
    };

    loadTickets();
  }, []);

  return (
    <ScrollView>
      {tickets.map((t) => (
        <View key={t._id} style={{ padding: 16 }}>
          <Text>{t.routeName}</Text>
          <Text>${t.price}</Text>
          <Text>Código: {t.code}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
