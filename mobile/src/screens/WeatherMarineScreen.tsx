import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { styled } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { getCurrentWeather, WeatherData } from '../services/weather.service';
import { getTideInfo, TideData } from '../services/tide.service';
import { useLocation } from '../context/LocationContext';
import { Cloud, Waves, Wind, Thermometer, ArrowUp, ArrowDown, Moon, Info, Calendar } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const { width } = Dimensions.get('window');

export const WeatherMarineScreen = () => {
    const navigation = useNavigation();
    const { selectedMunicipio, selectedCity } = useLocation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [tide, setTide] = useState<TideData | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const lat = selectedCity?.latitude || selectedMunicipio?.latitude;
            const lon = selectedCity?.longitude || selectedMunicipio?.longitude;
            const [weatherData, tideData] = await Promise.all([
                getCurrentWeather(lat, lon),
                getTideInfo(lat, lon)
            ]);
            setWeather(weatherData);
            setTide(tideData);
        } catch (error) {
            console.error('Error loading marine data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedMunicipio, selectedCity]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading && !refreshing) {
        return (
            <StyledView className="flex-1 bg-nautic-navy justify-center items-center">
                <ActivityIndicator size="large" color="#10b981" />
            </StyledView>
        );
    }

    return (
        <ScreenContainer withPadding={false}>
            <StyledView className="flex-1 bg-slate-50 dark:bg-dark-bg">
                {/* Header Premium */}
                <LinearGradient
                    colors={['#0B4F9C', '#083366']}
                    className="pt-12 pb-8 px-6 rounded-b-[40px] shadow-xl"
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="bg-white/10 w-10 h-10 rounded-full items-center justify-center mb-6"
                    >
                        <MaterialCommunityIcons name="chevron-left" size={28} color="white" />
                    </TouchableOpacity>

                    <StyledView className="flex-row justify-between items-end">
                        <StyledView>
                            <StyledText className="text-white/70 font-bold uppercase tracking-[3px] text-[10px] mb-1">
                                {selectedMunicipio?.name || "Timbiquí"}, {selectedMunicipio?.department || "Cauca"}
                            </StyledText>
                            <StyledText className="text-white text-3xl font-black">Pronóstico Marítimo</StyledText>
                        </StyledView>
                        <StyledView className="bg-emerald-500 px-3 py-1.5 rounded-full flex-row items-center border border-emerald-400/30">
                            <StyledView className="w-1.5 h-1.5 bg-white rounded-full mr-2 animate-pulse" />
                            <StyledText className="text-white font-black text-[9px] uppercase">En vivo</StyledText>
                        </StyledView>
                    </StyledView>
                </LinearGradient>

                <ScrollView
                    className="flex-1 px-4 -mt-6"
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* Tidal Cycle Card (Puja/Quiebra) */}
                    <StyledView className="bg-white dark:bg-dark-surface rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-dark-border/50 mb-6 overflow-hidden">
                        <LinearGradient
                            colors={['rgba(16, 185, 129, 0.05)', 'transparent']}
                            style={StyleSheet.absoluteFill}
                        />
                        <StyledView className="flex-row justify-between items-center mb-6">
                            <StyledView className="flex-row items-center">
                                <StyledView className="bg-emerald-500/10 p-3 rounded-2xl mr-4">
                                    <Waves size={24} color="#10b981" />
                                </StyledView>
                                <StyledView>
                                    <StyledText className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Ciclo del Mar</StyledText>
                                    <StyledText className="text-nautic-navy dark:text-white text-2xl font-black">
                                        {tide?.cycle.day} de {tide?.cycle.name}
                                    </StyledText>
                                </StyledView>
                            </StyledView>
                        </StyledView>

                        <StyledView className="bg-slate-50 dark:bg-dark-bg p-4 rounded-2xl mb-4 border border-slate-100 dark:border-dark-border/30">
                            <StyledText className="text-slate-600 dark:text-dark-text-muted text-sm leading-relaxed italic">
                                "{tide?.cycle.description}"
                            </StyledText>
                        </StyledView>

                        <StyledView className="flex-row justify-between">
                            <StyledView className="items-center flex-1 border-r border-slate-100 dark:border-dark-border/20">
                                <StyledText className="text-slate-400 font-bold text-[9px] uppercase mb-1">Altura actual</StyledText>
                                <StyledText className="text-emerald-500 text-xl font-black">{tide?.seaLevel} m</StyledText>
                            </StyledView>
                            <StyledView className="items-center flex-1 border-r border-slate-100 dark:border-dark-border/20">
                                <StyledText className="text-slate-400 font-bold text-[9px] uppercase mb-1">Tendencia</StyledText>
                                <StyledView className="flex-row items-center">
                                    {tide?.trend === 'Subiendo' ? <ArrowUp size={16} color="#10b981" /> : <ArrowDown size={16} color="#f43f5e" />}
                                    <StyledText className={`font-black ml-1 ${tide?.trend === 'Subiendo' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {tide?.trend}
                                    </StyledText>
                                </StyledView>
                            </StyledView>
                            <StyledView className="items-center flex-1">
                                <StyledText className="text-slate-400 font-bold text-[9px] uppercase mb-1">Luna</StyledText>
                                <StyledText className="text-nautic-navy dark:text-white font-black text-xs text-center">{tide?.moonPhase}</StyledText>
                            </StyledView>
                        </StyledView>
                    </StyledView>

                    {/* Weather Details Grid */}
                    <StyledView className="flex-row gap-4 mb-6">
                        <StyledView className="flex-1 bg-white dark:bg-dark-surface p-5 rounded-[28px] shadow-sm border border-slate-100 dark:border-dark-border/50">
                            <StyledView className="flex-row justify-between items-center mb-3">
                                <Thermometer size={18} color="#10b981" />
                                <StyledText className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Temp</StyledText>
                            </StyledView>
                            <StyledText className="text-2xl font-black text-nautic-navy dark:text-white">{weather?.current.temp}°C</StyledText>
                            <StyledText className="text-[10px] text-slate-500 dark:text-dark-text-muted mt-1 font-bold">{weather?.current.condition}</StyledText>
                        </StyledView>

                        <StyledView className="flex-1 bg-white dark:bg-dark-surface p-5 rounded-[28px] shadow-sm border border-slate-100 dark:border-dark-border/50">
                            <StyledView className="flex-row justify-between items-center mb-3">
                                <Wind size={18} color="#3b82f6" />
                                <StyledText className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Viento</StyledText>
                            </StyledView>
                            <StyledText className="text-2xl font-black text-nautic-navy dark:text-white">5 km/h</StyledText>
                            <StyledText className="text-[10px] text-slate-500 dark:text-dark-text-muted mt-1 font-bold">Dirección: O</StyledText>
                        </StyledView>
                    </StyledView>

                    {/* Extended Forecast */}
                    <StyledView className="bg-white dark:bg-dark-surface rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-dark-border/50 mb-10">
                        <StyledView className="flex-row items-center mb-6">
                            <StyledView className="bg-blue-500/10 p-2 rounded-xl mr-3">
                                <Calendar size={18} color="#3b82f6" />
                            </StyledView>
                            <StyledText className="text-xl font-black text-nautic-navy dark:text-white tracking-tight">Pronóstico de la Semana</StyledText>
                        </StyledView>

                        {weather?.forecast.map((day, idx) => (
                            <StyledView key={idx} className={`flex-row items-center py-4 ${idx !== weather.forecast.length - 1 ? 'border-b border-slate-50 dark:border-dark-border/20' : ''}`}>
                                <StyledText className="w-16 font-black text-slate-400 dark:text-slate-500 text-xs uppercase">{day.label}</StyledText>
                                <StyledView className="flex-row items-center flex-1 px-4">
                                    <StyledView className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-xl mr-3">
                                        <Cloud size={16} color="#10b981" />
                                    </StyledView>
                                    <StyledText className="text-sm font-bold text-nautic-navy dark:text-white">{day.condition}</StyledText>
                                </StyledView>
                                <StyledView className="flex-row items-center">
                                    <StyledText className="font-black text-nautic-navy dark:text-white mr-2">{day.maxTemp}°</StyledText>
                                    <StyledText className="text-slate-400 font-bold text-xs">{day.minTemp}°</StyledText>
                                </StyledView>
                            </StyledView>
                        ))}
                    </StyledView>
                </ScrollView>
            </StyledView>
        </ScreenContainer>
    );
};

const ActivityIndicator = ({ size, color }: any) => (
    <View style={{ transform: [{ scale: size === 'large' ? 1.5 : 1 }] }}>
        <MaterialCommunityIcons name="loading" size={24} color={color} className="animate-spin" />
    </View>
);
