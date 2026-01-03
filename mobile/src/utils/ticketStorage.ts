import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ticket } from "../types/ticket";

const LAST_TICKET_KEY = "LAST_TICKET";

export async function saveLastTicket(
  ticket: Ticket
) {
  await AsyncStorage.setItem(
    LAST_TICKET_KEY,
    JSON.stringify(ticket)
  );
}

export async function loadTicketFallback(): Promise<
  Ticket[]
> {
  const last = await AsyncStorage.getItem(
    LAST_TICKET_KEY
  );

  return last ? [JSON.parse(last)] : [];
}

export async function loadLastTicket(): Promise<
  Ticket | null
> {
  const data = await AsyncStorage.getItem(
    LAST_TICKET_KEY
  );
  return data ? JSON.parse(data) : null;
}

export async function clearLastTicket() {
  await AsyncStorage.removeItem(LAST_TICKET_KEY);
}
