import * as Linking from "expo-linking";
import { Alert } from "react-native";
import { buyTicket } from "../ticket.service";

export async function startWompiPayment({
  tripId,
  seatNumber,
  passengerName,
}: {
  tripId: string;
  seatNumber: number;
  passengerName: string;
}) {
  const response = await buyTicket({
    tripId,
    passengerName,
    passengerId: "000000", // TODO: pedir documento
    seatNumber: String(seatNumber), // ✅ FIX
  });

  const { paymentData } = response;

  const checkoutUrl =
    `https://checkout.wompi.co/p/?` +
    `public-key=${paymentData.publicKey}` +
    `&currency=${paymentData.currency}` +
    `&amount-in-cents=${paymentData.amountInCents}` +
    `&reference=${paymentData.reference}` +
    `&signature:integrity=${paymentData.signature}` +
    `&customer-email=${paymentData.customerEmail}` +
    `&redirect-url=${paymentData.redirectUrl}`;

  const supported = await Linking.canOpenURL(checkoutUrl);

  if (!supported) {
    Alert.alert("Error", "No se puede abrir la pasarela de pagos.");
    return;
  }

  await Linking.openURL(checkoutUrl);
}
