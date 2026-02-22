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
                customMapStyle={isDark ? darkMapStyle : []}
                initialRegion={{
                    latitude: 4.6097, // Bogota Default
                    longitude: -74.0817,
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

                <StyledText className="text-2xl font-black text-nautic-navy dark:text-white mb-6">
                    ¿A dónde vamos?
                </StyledText>

                {/* Search Bar */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('LocationSelection')}
                    className="flex-row items-center bg-slate-50 dark:bg-dark-bg p-4 rounded-3xl mb-8 border border-slate-100 dark:border-dark-border/50"
                >
                    <Search size={20} color="#94a3b8" style={{ marginRight: 12 }} />
                    <StyledText className="text-slate-400 font-bold flex-1">Buscar destino...</StyledText>
                    <StyledView className="h-6 w-[1px] bg-slate-200 dark:bg-dark-border mx-3" />
                    <Clock size={20} color="#94a3b8" />
                </TouchableOpacity>

                {/* Vehicle Selection (Miniature) */}
                <StyledView className="flex-row justify-between mb-4">
                    <StyledView className="p-4 bg-blue-500 rounded-[32px] items-center flex-1 mr-2">
                        <Car size={32} color="white" />
                        <StyledText className="text-white font-black mt-2">NauticGo</StyledText>
                        <StyledText className="text-white/70 text-[10px] uppercase font-bold">$12.500</StyledText>
                    </StyledView>
                    <StyledView className="p-4 bg-slate-50 dark:bg-dark-bg rounded-[32px] items-center flex-1 ml-2 border border-slate-100 dark:border-dark-border/50">
                        <Car size={32} color="#94a3b8" />
                        <StyledText className="text-slate-400 font-black mt-2">NauticXL</StyledText>
                        <StyledText className="text-slate-400/70 text-[10px] uppercase font-bold">$18.900</StyledText>
                    </StyledView>
                </StyledView>
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
