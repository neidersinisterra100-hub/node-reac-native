import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudSun, Wind, Thermometer, MapPin } from 'lucide-react-native';
import { getCurrentWeather, WeatherData } from '../../services/weather.service';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';
import { useNavigation } from '@react-navigation/native';

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
    const navigation = useNavigation<any>();
    const { isDark } = useTheme();
    const { selectedMunicipio, selectedCity } = useLocation();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const data = await getCurrentWeather(selectedMunicipio?.latitude, selectedMunicipio?.longitude);
                setWeather(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [selectedMunicipio]);

    if (loading) {
        return (
            <StyledView className="mx-1 mb-8 bg-white/5 rounded-[30px] p-6 h-32 items-center justify-center border border-white/10">
                <ActivityIndicator color="#10b981" />
            </StyledView>
        );
    }

    if (!weather) return null;

    const WeatherIcon = IconMap[weather.current.icon] || Cloud;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('WeatherMarine')}
            className="bg-white dark:bg-dark-surface p-4 rounded-[24px] mb-6 shadow-sm border border-slate-100 dark:border-dark-border/50"
        >
            <StyledView className="flex-row items-center justify-between mb-2 px-1">
                <StyledView className="flex-row items-center">
                    <MapPin size={12} color="#94a3b8" />
                    <StyledText className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[2px] ml-1">
                        {selectedCity?.name || selectedMunicipio?.name || "Ubicación"}
                    </StyledText>
                </StyledView>
            </StyledView>

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
                            {selectedMunicipio?.name || "Timbiquí"} Hoy
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-row items-baseline">
                        <StyledText className="text-3xl font-black text-nautic-navy dark:text-white">
                            {weather.current.temp}°
                        </StyledText>
                        <StyledText className="text-xl font-bold text-slate-400 dark:text-dark-text-muted ml-2">
                            {weather.current.condition}
                        </StyledText>
                    </StyledView>

                    <StyledText className="text-[10px] text-slate-500 dark:text-dark-text-muted font-medium mt-0.5 leading-tight pr-4">
                        {weather.current.description}
                    </StyledText>
                </StyledView>

                <StyledView className="bg-emerald-50 dark:bg-emerald-900/20 w-12 h-12 rounded-xl items-center justify-center border border-emerald-100 dark:border-emerald-800/30">
                    <WeatherIcon size={24} color="#10b981" strokeWidth={2.5} />
                </StyledView>
            </StyledView>

            {/* Forecast Section: Limited to 2 days for Dashboard */}
            <StyledView className="flex-row items-center mt-2.5 pt-2.5 border-t border-slate-50 dark:border-dark-border/30 justify-between">
                {weather.forecast.slice(0, 2).map((day, idx) => (
                    <StyledView key={idx} className="flex-row items-center flex-1">
                        <StyledView className="bg-slate-50 dark:bg-white/5 p-1.5 rounded-lg mr-2">
                            {IconMap[day.icon] ? React.createElement(IconMap[day.icon], { size: 16, color: "#10b981" }) : <Cloud size={16} color="#10b981" />}
                        </StyledView>
                        <StyledView>
                            <StyledText className="text-[8px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-wider">{day.day}</StyledText>
                            <StyledView className="flex-row items-center">
                                <StyledText className="text-xs font-bold text-nautic-navy dark:text-white">{day.max}°</StyledText>
                                <StyledText className="text-[9px] text-slate-400 ml-1">/ {day.min}°</StyledText>
                            </StyledView>
                            <StyledText className="text-[9px] font-medium text-slate-400 dark:text-dark-text-muted mt-0.5" numberOfLines={1}>
                                {day.condition}
                            </StyledText>
                        </StyledView>
                    </StyledView>
                ))}
            </StyledView>
        </TouchableOpacity>
    );
};
