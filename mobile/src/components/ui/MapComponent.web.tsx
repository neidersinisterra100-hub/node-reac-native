import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
// CSS is injected dynamically on Mount to avoid Metro bundler relative URL crash
// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create a custom modern vehicle icon
const carIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png', // Modern minimal car
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
});

// Component to dynamically recenter map
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.flyTo(center, map.getZoom(), { animate: true, duration: 1.5 });
        }
    }, [center, map]);
    return null;
}

export const MapComponent = React.forwardRef((props: any, ref: any) => {
    const {
        location,
        initialRegion,
        isDark,
        routeCoordinates = [] // E.g., [[lat, lon], [lat, lon]]
    } = props;

    // Use location or fallback to initialRegion or a default
    const lat = location?.coords?.latitude || initialRegion?.latitude || 2.77194;
    const lon = location?.coords?.longitude || initialRegion?.longitude || -77.665;
    const center: [number, number] = [lat, lon];

    // Expose animateToRegion to parent via ref to match react-native-maps API
    React.useImperativeHandle(ref, () => ({
        animateToRegion: (region: any) => {
            console.log("Web Map: animateToRegion called", region);
        }
    }));

    useEffect(() => {
        // Inject Leaflet CSS dynamically to bypass Metro Bundler "local resources in CSS" crash
        if (Platform.OS === 'web') {
            const styleId = 'leaflet-css-dynamic';
            if (!document.getElementById(styleId)) {
                const link = document.createElement('link');
                link.id = styleId;
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }
        }
    }, []);

    if (Platform.OS !== 'web') {
        return null; // Should never hit outside of web
    }

    // Map themes
    const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' // Dark mode (CartoDB)
        : 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // Light mode (Google Maps standard)

    // Google subdomains
    const subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];

    return (
        <View style={StyleSheet.absoluteFillObject}>
            <MapContainer
                center={center}
                zoom={14}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url={tileUrl}
                    subdomains={isDark ? 'abc' : subdomains}
                    attribution={isDark ? '&copy; <a href="https://carto.com/">CARTO</a>' : ''}
                />

                {/* Dynamically re-center based on user location */}
                <MapUpdater center={center} />

                {/* Current Location Marker */}
                {location && (
                    <Marker position={center} icon={carIcon} />
                )}

                {/* Simulated Route Polyline */}
                {routeCoordinates.length > 0 && (
                    <Polyline
                        positions={routeCoordinates}
                        pathOptions={{
                            color: isDark ? '#10b981' : '#3b82f6', // Emerald in dark, Blue in light
                            weight: 5,
                            opacity: 0.8
                        }}
                    />
                )}
            </MapContainer>
        </View>
    );
});

export default MapComponent;
