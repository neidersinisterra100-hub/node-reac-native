import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import { Map as MapIcon } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

/**
 * Fallback Map Component for Web
 * react-native-maps does not support web out of the box in this version/config.
 * This prevents bundling errors while allowing the rest of the app to function.
 */
export const MapComponent = (props: any) => {
    return (
        <ImageBackground
            source={require('../../assets/map_mock_navigation.png')}
            style={styles.container}
            resizeMode="cover"
        >
            <StyledView className="flex-1 bg-black/40 items-center justify-center p-10">
                <StyledView className="bg-white/10 p-8 rounded-[40px] items-center border border-white/20 max-w-sm" style={{ backdropFilter: 'blur(10px)' }}>
                    <StyledView className="bg-emerald-500/20 p-5 rounded-full mb-6">
                        <MapIcon size={40} color="#10b981" strokeWidth={2} />
                    </StyledView>
                    <StyledText className="text-xl font-black text-white text-center mb-3">
                        Mapa en Mantenimiento (Web)
                    </StyledText>
                    <StyledText className="text-white/80 text-center text-sm leading-relaxed mb-6 font-medium">
                        La visualización de mapas en tiempo real está optimizada exclusivamente para nuestra App Nativa (Android & iOS).
                    </StyledText>
                    <StyledView className="bg-emerald-500 px-6 py-3 rounded-2xl">
                        <StyledText className="text-white font-black text-xs uppercase tracking-widest">
                            Descargar App Nativa
                        </StyledText>
                    </StyledView>
                </StyledView>
            </StyledView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    }
});

export default MapComponent;
