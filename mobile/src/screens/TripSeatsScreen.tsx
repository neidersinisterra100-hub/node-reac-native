import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { getTripSeats, Seat } from "../services/seat.service";
import AppHeader from "../components/ui/AppHeader";
import AppContainer from "../components/ui/AppContainer";
import { RootStackParamList } from "../navigation/types";

// Tipado seguro de la ruta
type TripSeatsRouteProp = RouteProp<RootStackParamList, 'TripSeats'>;

export default function TripSeatsScreen() {
    const route = useRoute<TripSeatsRouteProp>();
    const navigation = useNavigation();
    const { tripId } = route.params;

    const [seats, setSeats] = useState<Seat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSeats();
    }, []);

    const loadSeats = async () => {
        try {
            setLoading(true);
            const data = await getTripSeats(tripId);
            setSeats(data);
        } catch (error) {
            console.error("Error loading seats:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppContainer>
            <AppHeader title="Selecciona tu asiento" showBack={true} />

            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#ff6b00" style={{ marginTop: 50 }} />
                ) : (
                    <View style={styles.grid}>
                        {seats.map((seat) => (
                            <View
                                key={seat.seatNumber}
                                style={[
                                    styles.seat,
                                    !seat.available && styles.seatDisabled
                                ]}
                            >
                                <Text style={[
                                    styles.seatText,
                                    !seat.available && styles.seatTextDisabled
                                ]}>
                                    {seat.seatNumber}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </AppContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center'
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: 'center',
        gap: 10
    },
    seat: {
        width: 50,
        height: 50,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#4ade80",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    seatDisabled: {
        backgroundColor: "#e5e7eb",
        borderColor: "#d1d5db"
    },
    seatText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1f2937"
    },
    seatTextDisabled: {
        color: "#9ca3af"
    }
});
