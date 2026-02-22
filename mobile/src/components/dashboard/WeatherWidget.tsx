import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudSun, Wind, Thermometer } from 'lucide-react-native';
import { getCurrentWeather, WeatherData } from '../../services/weather.service';

const StyledView = styled(View);
const StyledText = styled(Text);

const IconMap: Record<string, any> = {
    'sun': Sun,
    'cloud': Cloud,
    'cloud-sun': CloudSun,
    'cloud-rain': CloudRain,
    'cloud-lightning': CloudLightning,
    'cloud-snow': CloudSnow,
    'cloud-drizzle': CloudRain,
};

export const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            const data = await getCurrentWeather();
            setWeather(data);
            setLoading(false);
        };
        fetchWeather();
    }, []);

    if (loading) {
        return (
            <StyledView className="mx-1 mb-8 bg-white/5 rounded-[30px] p-6 h-32 items-center justify-center border border-white/10">
                <ActivityIndicator color="#10b981" />
            </StyledView>
        );
    }

    if (!weather) return null;

    const WeatherIcon = IconMap[weather.icon] || Cloud;

    return (
        <StyledView
            className="mx-1 mb-8 bg-white dark:bg-dark-surface rounded-[30px] p-6 shadow-sm border border-slate-100 dark:border-dark-border/50 overflow-hidden"
        >
            {/* Background Decoration */}
            <StyledView
                className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full"
            />

            <StyledView className="flex-row items-center justify-between">
                <StyledView className="flex-1">
                    <StyledView className="flex-row items-center mb-1">
                        <StyledView className="bg-emerald-500/10 p-1.5 rounded-lg mr-2">
                            <Thermometer size={14} color="#10b981" />
                        </StyledView>
                        <StyledText className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[2px]">
                            Pronóstico Actual
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-row items-baseline">
                        <StyledText className="text-4xl font-black text-nautic-navy dark:text-white">
                            {weather.temp}°
                        </StyledText>
                        <StyledText className="text-xl font-bold text-slate-400 dark:text-dark-text-muted ml-2">
                            {weather.condition}
                        </StyledText>
                    </StyledView>

                    <StyledText className="text-xs text-slate-500 dark:text-dark-text-muted font-medium mt-1 leading-relaxed">
                        {weather.description}
                    </StyledText>
                </StyledView>

                <StyledView className="bg-emerald-50 dark:bg-emerald-900/20 w-16 h-16 rounded-2xl items-center justify-center border border-emerald-100 dark:border-emerald-800/30">
                    <WeatherIcon size={32} color="#10b981" strokeWidth={2.5} />
                </StyledView>
            </StyledView>

            {/* Micro details */}
            <StyledView className="flex-row items-center mt-4 pt-4 border-t border-slate-50 dark:border-dark-border/30">
                <StyledView className="flex-row items-center mr-6">
                    <Wind size={12} color="#64748b" />
                    <StyledText className="text-[10px] font-bold text-slate-400 ml-1.5">5 km/h</StyledText>
                </StyledView>
                <StyledView className="flex-row items-center">
                    <Cloud size={12} color="#64748b" />
                    <StyledText className="text-[10px] font-bold text-slate-400 ml-1.5">Humedad: 82%</StyledText>
                </StyledView>
            </StyledView>
        </StyledView>
    );
};
