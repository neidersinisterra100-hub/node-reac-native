import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DayForecast {
    max: number;
    min: number;
    condition: string;
    icon: string;
    day: string; // "Hoy", "Mañana"
}

export interface WeatherData {
    current: {
        temp: number;
        feelsLike: number;
        humidity: number;
        uvIndex: number;
        sunrise: string;
        sunset: string;
        condition: string;
        description: string;
        icon: string;
        windSpeed: number;
        windDirection: string;
    };
    forecast: DayForecast[];
}

const CACHE_KEY = '@weather_cache';
const CACHE_TTL = 1 * 60 * 1000; // 1 minute

/**
 * Weather Service - Thin Client Version
 * No hardcoded defaults or fallbacks. All logic is in the backend.
 */
export const getCurrentWeather = async (lat?: number, lon?: number): Promise<WeatherData> => {
    try {
        const dynamicCacheKey = lat && lon ? `${CACHE_KEY}_${lat}_${lon}` : `${CACHE_KEY}_default`;

        // Check Cache first
        const cached = await AsyncStorage.getItem(dynamicCacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
                return data;
            }
        }

        // Call our backend. Backend handles defaults if lat/lon are missing.
        const url = lat && lon ? `/marine/weather?lat=${lat}&lon=${lon}` : '/marine/weather';
        const { data } = await api.get<WeatherData>(url);

        // Save to Cache
        await AsyncStorage.setItem(dynamicCacheKey, JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));

        return data;
    } catch (error) {
        console.error('[WeatherService] Error fetching from backend:', error);
        throw error; // Let the UI handle the error state
    }
};
