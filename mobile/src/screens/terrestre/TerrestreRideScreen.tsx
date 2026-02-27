import React, { useState, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Text,
    StatusBar,
    Platform,
} from "react-native";
import MapComponent from "../../components/ui/MapComponent";
import * as Location from "expo-location";
import { styled } from "nativewind";
import {
    ChevronLeft,
    Navigation,
    MapPin,
    Search,
    Car,
    Clock,
    ShieldCheck
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useTheme } from "../../context/ThemeContext";

const { width, height } = Dimensions.get("window");

const StyledView = styled(View);
const StyledText = styled(Text);

export default function TerrestreRideScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { isDark } = useTheme();

    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Ride Flow States
    const [rideStatus, setRideStatus] = useState<'IDLE' | 'SEARCHING' | 'ACCEPTED'>('IDLE');
    const [simulatedRoute, setSimulatedRoute] = useState<[number, number][]>([]);
    const [destination, setDestination] = useState<any>(null);

    const mapRef = useRef<any>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permiso de ubicación denegado");
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);

            // Center map on startup
            if (mapRef.current && mapRef.current.animateToRegion) {
                mapRef.current.animateToRegion({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.0121,
                });
            }
        })();
    }, []);

    const handleGoBack = () => navigation.goBack();

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? "light-content" : "dark-content"} />

            {/* ================= MAP COMPONENT ================= */}
            <MapComponent
                ref={mapRef}
                style={styles.map}
                isDark={isDark}
                location={location}
                routeCoordinates={simulatedRoute}
                customMapStyle={isDark ? darkMapStyle : []}
                initialRegion={{
                    latitude: 2.77194, // Timbiquí
                    longitude: -77.665,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            />

            {/* ================= TOP CONTROLS ================= */}
            <StyledView className="absolute top-12 left-5 right-5 flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={handleGoBack}
                    className="w-12 h-12 bg-white dark:bg-dark-surface rounded-2xl items-center justify-center shadow-lg border border-slate-100 dark:border-dark-border/50"
                >
                    <ChevronLeft size={24} color={isDark ? "white" : "#0f172a"} />
                </TouchableOpacity>

                <StyledView className="bg-white dark:bg-dark-surface px-4 py-2 rounded-2xl shadow-lg border border-slate-100 dark:border-dark-border/50 flex-row items-center">
                    <ShieldCheck size={16} color="#10b981" />
                    <StyledText className="ml-2 text-[10px] font-black text-nautic-navy dark:text-white uppercase tracking-widest">
                        Viaje Seguro
                    </StyledText>
                </StyledView>
            </StyledView>

            {/* ================= BOTTOM SHEET (SIMULATED) ================= */}
            <StyledView
                className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-surface rounded-t-[40px] shadow-2xl p-6 border-t border-slate-100 dark:border-dark-border/50"
                style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 25 }}
            >
                {/* Handle */}
                <StyledView className="w-10 h-1.5 bg-slate-200 dark:bg-dark-bg rounded-full self-center mb-6" />

                {rideStatus === 'IDLE' && (
                    <>
                        <StyledText className="text-2xl font-black text-nautic-navy dark:text-white mb-6">
                            ¿A dónde vamos?
                        </StyledText>

                        {/* Search Bar */}
                        <TouchableOpacity
                            onPress={() => setRideStatus('SEARCHING')}
                            className="flex-row items-center bg-slate-50 dark:bg-dark-bg p-4 rounded-3xl mb-8 border border-slate-100 dark:border-dark-border/50"
                        >
                            <Search size={20} color="#94a3b8" style={{ marginRight: 12 }} />
                            <StyledText className="text-slate-400 font-bold flex-1">Toca para probar (Buscar destino)...</StyledText>
                        </TouchableOpacity>

                        {/* Vehicle Selection (Miniature) */}
                        <StyledView className="flex-row justify-between mb-4">
                            <TouchableOpacity
                                onPress={() => setRideStatus('SEARCHING')}
                                className="p-4 bg-blue-500 rounded-[32px] items-center flex-1 mr-2"
                            >
                                <Car size={32} color="white" />
                                <StyledText className="text-white font-black mt-2">NauticGo</StyledText>
                                <StyledText className="text-white/70 text-[10px] uppercase font-bold">$12.500</StyledText>
                            </TouchableOpacity>
                            <StyledView className="p-4 bg-slate-50 dark:bg-dark-bg rounded-[32px] items-center flex-1 ml-2 border border-slate-100 dark:border-dark-border/50 opacity-50">
                                <Car size={32} color="#94a3b8" />
                                <StyledText className="text-slate-400 font-black mt-2">NauticXL</StyledText>
                                <StyledText className="text-slate-400/70 text-[10px] uppercase font-bold">$18.900</StyledText>
                            </StyledView>
                        </StyledView>
                    </>
                )}

                {rideStatus === 'SEARCHING' && (
                    <StyledView className="items-center py-6">
                        <StyledView className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full items-center justify-center mb-4 border border-blue-100 dark:border-blue-900/50">
                            <Search size={28} color="#3b82f6" className="animate-pulse" />
                        </StyledView>
                        <StyledText className="text-xl font-black text-nautic-navy dark:text-white mb-2">
                            Buscando conductor...
                        </StyledText>
                        <StyledText className="text-slate-400 text-sm font-medium text-center px-4 mb-6">
                            Conectando con el compañero náutico más cercano a tu ubicación.
                        </StyledText>

                        <TouchableOpacity
                            onPress={() => {
                                setRideStatus('ACCEPTED');
                                // Generate a dummy route slightly offset from current location
                                if (location) {
                                    const lat = location.coords.latitude;
                                    const lon = location.coords.longitude;
                                    setSimulatedRoute([
                                        [lat - 0.002, lon - 0.002],
                                        [lat - 0.001, lon - 0.001],
                                        [lat, lon]
                                    ]);
                                }
                            }}
                            className="bg-emerald-500 w-full py-4 rounded-2xl items-center shadow-lg shadow-emerald-500/30"
                        >
                            <StyledText className="text-white font-black uppercase tracking-widest text-xs">Simular Aceptación</StyledText>
                        </TouchableOpacity>
                    </StyledView>
                )}

                {rideStatus === 'ACCEPTED' && (
                    <StyledView className="py-2">
                        <StyledView className="flex-row items-center mb-6">
                            <StyledView className="w-16 h-16 bg-slate-100 dark:bg-dark-bg rounded-2xl mr-4" />
                            <StyledView className="flex-1">
                                <StyledView className="flex-row justify-between items-center mb-1">
                                    <StyledText className="text-xl font-black text-nautic-navy dark:text-white">Carlos M.</StyledText>
                                    <StyledView className="bg-emerald-500/10 px-2 py-1 rounded-lg">
                                        <StyledText className="text-emerald-500 font-bold text-[10px]">4.9 ★</StyledText>
                                    </StyledView>
                                </StyledView>
                                <StyledText className="text-slate-400 font-bold mb-1">Toyota Hilux Blanca</StyledText>
                                <StyledText className="text-blue-500 font-black text-xs">Llega en 3 min</StyledText>
                            </StyledView>
                        </StyledView>

                        <StyledView className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => { setRideStatus('IDLE'); setSimulatedRoute([]); }}
                                className="flex-1 bg-rose-50 dark:bg-rose-900/10 py-4 rounded-2xl items-center border border-rose-100 dark:border-rose-900/30"
                            >
                                <StyledText className="text-rose-500 font-black uppercase tracking-widest text-[10px]">Cancelar</StyledText>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-blue-500 py-4 rounded-2xl items-center shadow-lg shadow-blue-500/30">
                                <StyledText className="text-white font-black uppercase tracking-widest text-[10px]">Contactar</StyledText>
                            </TouchableOpacity>
                        </StyledView>
                    </StyledView>
                )}
            </StyledView>

            {/* RE-CENTER BUTTON */}
            <TouchableOpacity
                onPress={() => {
                    if (location && mapRef.current && mapRef.current.animateToRegion) {
                        mapRef.current.animateToRegion({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.0122,
                            longitudeDelta: 0.0121,
                        });
                    }
                }}
                className="absolute bottom-[380px] right-5 w-12 h-12 bg-white dark:bg-dark-surface rounded-2xl items-center justify-center shadow-lg border border-slate-100 dark:border-dark-border/50"
            >
                <Navigation size={22} color="#3b82f6" fill={isDark ? "white" : "transparent"} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: width,
        height: height,
    },
});

const darkMapStyle = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#1e293b" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#94a3b8" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#1e293b" }]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{ "color": "#334155" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#334155" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#0f172a" }]
    }
];
