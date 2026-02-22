import React from 'react';
import { View, Text } from 'react-native';
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
        <StyledView className="flex-1 bg-slate-100 dark:bg-dark-bg items-center justify-center p-10">
            <StyledView className="bg-white dark:bg-dark-surface p-8 rounded-[40px] shadow-sm items-center border border-slate-200 dark:border-dark-border/50 max-w-sm">
                <StyledView className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-6">
                    <MapIcon size={48} color="#3b82f6" strokeWidth={1.5} />
                </StyledView>
                <StyledText className="text-xl font-black text-nautic-navy dark:text-white text-center mb-3">
                    Mapa en Mantenimiento (Web)
                </StyledText>
                <StyledText className="text-slate-500 dark:text-dark-text-muted text-center text-sm leading-relaxed mb-6">
                    La visualización completa de mapas está optimizada para nuestras aplicaciones nativas (Android e iOS).
                </StyledText>
                <StyledView className="bg-blue-500 px-6 py-3 rounded-2xl">
                    <StyledText className="text-white font-black text-xs uppercase tracking-widest">
                        Usar App Nativa
                    </StyledText>
                </StyledView>
            </StyledView>
        </StyledView>
    );
};

export default MapComponent;
