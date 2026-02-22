import React, { forwardRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View } from 'react-native';

/**
 * Native Map Component using react-native-maps
 * This file is named .native.tsx so it's only picked up by mobile bundlers.
 */
export const MapComponent = forwardRef((props: any, ref: any) => {
    const { isDark, location, ...otherProps } = props;

    return (
        <MapView
            ref={ref}
            provider={PROVIDER_GOOGLE}
            showsUserLocation
            showsMyLocationButton={false}
            {...otherProps}
        >
            {location && (
                <Marker
                    coordinate={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    }}
                    title="Tu ubicación"
                >
                    <View className="bg-blue-500/20 p-4 rounded-full border border-blue-500/30">
                        <View className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
                    </View>
                </Marker>
            )}
            {props.children}
        </MapView>
    );
});

export default MapComponent;
