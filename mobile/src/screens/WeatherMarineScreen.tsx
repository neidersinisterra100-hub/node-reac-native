import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { styled } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { getNews, NewsItem } from '../services/news.service';
import { Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { getCurrentWeather, WeatherData } from '../services/weather.service';
import { getTideInfo, TideData } from '../services/tide.service';
import { useLocation } from '../context/LocationContext';
import { Cloud, Waves, Wind, Thermometer, ArrowUp, ArrowDown, Moon, Info, Calendar, Sunrise, Sunset, Sun, Droplets } from 'lucide-react-native';
import { WeatherMarineSkeleton } from '../components/ui/Skeletons';

const StyledImage = styled(Image);
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
    const [news, setNews] = useState<NewsItem[]>([]);

    const uvValue = weather?.current.uvIndex ?? 0;
    const uvLabel = uvValue > 7 ? 'Muy Alto' : uvValue > 5 ? 'Alto' : 'Moderado';
    const uvColor = uvValue > 7 ? 'text-rose-500' : uvValue > 5 ? 'text-amber-500' : 'text-emerald-500';

    const loadData = async () => {
        try {
            setLoading(true);
            const lat = selectedCity?.latitude || selectedMunicipio?.latitude;
            const lon = selectedCity?.longitude || selectedMunicipio?.longitude;
            const [weatherData, tideData, newsData] = await Promise.all([
                getCurrentWeather(lat, lon),
                getTideInfo(lat, lon),
                getNews()
            ]);
            setWeather(weatherData);
            setTide(tideData);
            setNews(newsData);
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
        return <WeatherMarineSkeleton />;
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

                        <StyledView className="flex-row justify-between mb-6">
                            <StyledView className="items-center flex-1 border-r border-slate-100 dark:border-dark-border/20">
                                <StyledText className="text-slate-400 font-bold text-[9px] uppercase mb-1">Altura actual</StyledText>
                                <StyledText className="text-emerald-500 text-xl font-black">{tide?.seaLevel} m</StyledText>
                            </StyledView>
                            <StyledView className="items-center flex-1 border-r border-slate-100 dark:border-dark-border/20">
                                <StyledText className="text-slate-400 font-bold text-[9px] uppercase mb-1">Tendencia</StyledText>
                                <StyledView className="flex-row items-center">
                                    {tide?.trend === 'Subiendo' ? <ArrowUp size={16} color="#10b981" /> : tide?.trend === 'Bajando' ? <ArrowDown size={16} color="#f43f5e" /> : <Info size={16} color="#3b82f6" />}
                                    <StyledText className={`font-black ml-1 ${tide?.trend === 'Subiendo' ? 'text-emerald-500' : tide?.trend === 'Bajando' ? 'text-rose-500' : 'text-blue-500'}`}>
                                        {tide?.trend || 'Estable'}
                                    </StyledText>
                                </StyledView>
                            </StyledView>
                            <StyledView className="items-center flex-1">
                                <StyledText className="text-slate-400 font-bold text-[9px] uppercase mb-1">Luna</StyledText>
                                <StyledText className="text-nautic-navy dark:text-white font-black text-xs text-center">{tide?.moonPhase}</StyledText>
                            </StyledView>
                        </StyledView>

                        {/* High/Low Tides Detail */}
                        <StyledView className="flex-row gap-3">
                            <StyledView className="flex-1 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-2xl flex-row items-center">
                                <ArrowUp size={14} color="#3b82f6" />
                                <StyledView className="ml-2">
                                    <StyledText className="text-[8px] font-bold text-slate-400 uppercase">Marea Alta</StyledText>
                                    <StyledText className="text-[11px] font-black text-blue-600 dark:text-blue-400">{tide?.highTides?.join(' | ') || '--:--'}</StyledText>
                                </StyledView>
                            </StyledView>
                            <StyledView className="flex-1 bg-rose-50/50 dark:bg-rose-900/10 p-3 rounded-2xl flex-row items-center">
                                <ArrowDown size={14} color="#f43f5e" />
                                <StyledView className="ml-2">
                                    <StyledText className="text-[8px] font-bold text-slate-400 uppercase">Marea Baja</StyledText>
                                    <StyledText className="text-[11px] font-black text-rose-600 dark:text-rose-400">{tide?.lowTides?.join(' | ') || '--:--'}</StyledText>
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    </StyledView>

                    {/* Bento Grid: Weather Stats */}
                    <StyledView className="bg-white dark:bg-dark-surface rounded-[32px] p-4 shadow-sm border border-slate-100 dark:border-dark-border/50 mb-6">
                        <StyledView className="flex-row flex-wrap">
                            {/* Temp / Feels Like */}
                            <StyledView className="w-1/2 p-2 border-r border-b border-slate-50 dark:border-dark-border/10">
                                <StyledView className="flex-row justify-between items-center mb-1">
                                    <Thermometer size={16} color="#10b981" />
                                    <StyledText className="text-[8px] font-black text-slate-300 uppercase">Temp</StyledText>
                                </StyledView>
                                <StyledView className="flex-row items-baseline">
                                    <StyledText className="text-xl font-black text-nautic-navy dark:text-white">{weather?.current.temp}°</StyledText>
                                    <StyledText className="text-[10px] text-slate-400 font-bold ml-1">/{weather?.current.feelsLike}°</StyledText>
                                </StyledView>
                                <StyledText className="text-[8px] text-emerald-500 font-bold uppercase">{weather?.current.condition}</StyledText>
                            </StyledView>

                            {/* Wind */}
                            <StyledView className="w-1/2 p-2 border-b border-slate-50 dark:border-dark-border/10">
                                <StyledView className="flex-row justify-between items-center mb-1">
                                    <Wind size={16} color="#3b82f6" />
                                    <StyledText className="text-[8px] font-black text-slate-300 uppercase">Viento</StyledText>
                                </StyledView>
                                <StyledText className="text-xl font-black text-nautic-navy dark:text-white">{weather?.current.windSpeed} <StyledText className="text-[10px]">km/h</StyledText></StyledText>
                                <StyledText className="text-[8px] text-blue-500 font-bold uppercase truncate">{weather?.current.windDirection}</StyledText>
                            </StyledView>

                            {/* UV Index */}
                            <StyledView className="w-1/2 p-2 border-r border-slate-50 dark:border-dark-border/10">
                                <StyledView className="flex-row justify-between items-center mb-1">
                                    <Sun size={16} color="#f59e0b" />
                                    <StyledText className="text-[8px] font-black text-slate-300 uppercase">Índice UV</StyledText>
                                </StyledView>
                                <StyledText className="text-xl font-black text-nautic-navy dark:text-white">{weather?.current.uvIndex ?? '--'}</StyledText>
                                <StyledText className={`text-[8px] font-bold uppercase ${uvColor}`}>{uvLabel}</StyledText>
                            </StyledView>

                            {/* Humidity */}
                            <StyledView className="w-1/2 p-2">
                                <StyledView className="flex-row justify-between items-center mb-1">
                                    <Droplets size={16} color="#06b6d4" />
                                    <StyledText className="text-[8px] font-black text-slate-300 uppercase">Humedad</StyledText>
                                </StyledView>
                                <StyledText className="text-xl font-black text-nautic-navy dark:text-white">{weather?.current.humidity}%</StyledText>
                                <StyledText className="text-[8px] text-cyan-500 font-bold uppercase">Relativa</StyledText>
                            </StyledView>
                        </StyledView>

                        {/* Astronomy Divider */}
                        <StyledView className="h-[1px] bg-slate-50 dark:bg-dark-border/10 my-3" />

                        {/* Astronomy Row */}
                        <StyledView className="flex-row justify-around items-center py-1">
                            <StyledView className="flex-row items-center">
                                <Sunrise size={18} color="#f59e0b" />
                                <StyledView className="ml-2">
                                    <StyledText className="text-[7px] font-black text-slate-400 uppercase">Amanecer</StyledText>
                                    <StyledText className="text-xs font-black text-nautic-navy dark:text-white">{weather?.current.sunrise}</StyledText>
                                </StyledView>
                            </StyledView>
                            <StyledView className="w-[1px] h-6 bg-slate-100 dark:bg-dark-border/20" />
                            <StyledView className="flex-row items-center">
                                <Sunset size={18} color="#ea580c" />
                                <StyledView className="ml-2">
                                    <StyledText className="text-[7px] font-black text-slate-400 uppercase">Atardecer</StyledText>
                                    <StyledText className="text-xs font-black text-nautic-navy dark:text-white">{weather?.current.sunset}</StyledText>
                                </StyledView>
                            </StyledView>
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

                        {weather?.forecast.map((day: any, idx: number) => (
                            <StyledView key={idx} className={`flex-row items-center py-3 ${idx !== weather.forecast.length - 1 ? 'border-b border-slate-50 dark:border-dark-border/20' : ''}`}>
                                <StyledText className="w-16 font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase">{day.day}</StyledText>
                                <StyledView className="flex-row items-center flex-1 px-4">
                                    <StyledView className="bg-emerald-50 dark:bg-emerald-900/20 p-1.5 rounded-lg mr-3">
                                        <MaterialCommunityIcons
                                            name={day.icon === 'sun' ? 'weather-sunny' : 'weather-cloudy'}
                                            size={16}
                                            color="#10b981"
                                        />
                                    </StyledView>
                                    <StyledView>
                                        <StyledText className="text-xs font-bold text-nautic-navy dark:text-white">{day.condition}</StyledText>
                                        <StyledText className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">
                                            🌧️ {day.rainProbability ?? 0}% LLUVIA
                                        </StyledText>
                                    </StyledView>
                                </StyledView>
                                <StyledView className="flex-row items-center">
                                    <StyledText className="font-black text-nautic-navy dark:text-white mr-2 text-xs">
                                        {day.max ?? '--'}°
                                    </StyledText>
                                    <StyledText className="text-slate-400 font-bold text-[10px]">
                                        {day.min ?? '--'}°
                                    </StyledText>
                                </StyledView>
                            </StyledView>
                        ))}
                    </StyledView>

                    {/* News Section */}
                    {news.length > 0 && (
                        <StyledView className="mt-2 mb-8 px-2">
                            <StyledView className="flex-row justify-between items-center mb-4">
                                <StyledText className="text-2xl font-black text-nautic-navy dark:text-white tracking-tight">Noticias Locales</StyledText>
                                <StyledView className="h-1 w-12 bg-emerald-500 rounded-full" />
                            </StyledView>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-2">
                                {news.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        activeOpacity={0.9}
                                        className="mx-2 bg-white dark:bg-dark-surface rounded-[40px] overflow-hidden shadow-sm border border-slate-100 dark:border-dark-border/50"
                                        style={{ width: width * 0.75 }}
                                    >
                                        <StyledImage
                                            source={{ uri: item.image }}
                                            className="w-full h-44"
                                            resizeMode="cover"
                                        />
                                        <StyledView className="p-5">
                                            <StyledView className="flex-row justify-between items-center mb-3">
                                                <StyledView className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                                                    <StyledText className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                                        {item.category}
                                                    </StyledText>
                                                </StyledView>
                                                <StyledText className="text-[10px] text-slate-400 font-bold">{item.date}</StyledText>
                                            </StyledView>
                                            <StyledText className="text-lg font-black text-nautic-navy dark:text-white mb-2 leading-tight" numberOfLines={2}>
                                                {item.title}
                                            </StyledText>
                                            <StyledText className="text-xs text-slate-500 dark:text-dark-text-muted leading-relaxed" numberOfLines={3}>
                                                {item.description}
                                            </StyledText>
                                        </StyledView>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </StyledView>
                    )}
                </ScrollView>
            </StyledView>
        </ScreenContainer>
    );
};

const LoadingIndicator = ({ size, color }: any) => (
    <View style={{ transform: [{ scale: size === 'large' ? 1.5 : 1 }] }}>
        <MaterialCommunityIcons name="loading" size={24} color={color} className="animate-spin" />
    </View>
);
