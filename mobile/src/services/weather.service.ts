import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DayForecast {
    maxTemp: number;
    minTemp: number;
    condition: string;
    icon: string;
    label: string; // "Hoy", "Mañana"
}

export interface WeatherData {
    current: {
        temp: number;
        condition: string;
        description: string;
        icon: string;
    };
    forecast: DayForecast[];
}

const WEATHER_DESCRIPTIONS: Record<number, { label: string; icon: string }> = {
    0: { label: 'Despejado', icon: 'sun' },
    1: { label: 'Principalmente despejado', icon: 'cloud-sun' },
    2: { label: 'Parcialmente nublado', icon: 'cloud-sun' },
    3: { label: 'Nublado', icon: 'cloud' },
    45: { label: 'Niebla', icon: 'cloud-drizzle' },
    48: { label: 'Escarcha', icon: 'cloud-drizzle' },
    51: { label: 'Llovizna ligera', icon: 'cloud-rain' },
    53: { label: 'Llovizna moderada', icon: 'cloud-rain' },
    55: { label: 'Llovizna densa', icon: 'cloud-rain' },
    61: { label: 'Lluvia ligera', icon: 'cloud-rain' },
    63: { label: 'Lluvia moderada', icon: 'cloud-rain' },
    65: { label: 'Lluvia fuerte', icon: 'cloud-rain' },
    71: { label: 'Nieve ligera', icon: 'cloud-snow' },
    73: { label: 'Nieve moderada', icon: 'cloud-snow' },
    75: { label: 'Nieve fuerte', icon: 'cloud-snow' },
    80: { label: 'Chubascos ligeros', icon: 'cloud-lightning' },
    81: { label: 'Chubascos moderados', icon: 'cloud-lightning' },
    82: { label: 'Chubascos violentos', icon: 'cloud-lightning' },
    95: { label: 'Tormenta eléctrica', icon: 'cloud-lightning' },
};

const CACHE_KEY = '@weather_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export const getCurrentWeather = async (lat?: number, lon?: number): Promise<WeatherData> => {
    try {
        const latitude = lat ?? 2.7712; // Timbiquí default
        const longitude = lon ?? -77.6631;
        const city = lat ? "Ubicación Seleccionada" : "Timbiquí";

        const dynamicCacheKey = `${CACHE_KEY}_${latitude}_${longitude}`;

        // Check Cache first
        const cached = await AsyncStorage.getItem(dynamicCacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
                console.log(`🌦️ [Weather] Using cached data for ${latitude}, ${longitude}`);
                return data;
            }
        }

        // 2. Get current weather and daily forecast
        const response = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
            { timeout: 4000 }
        );

        const { temperature_2m, weather_code } = response.data.current;
        const daily = response.data.daily;

        console.log("📅 [Weather] Today:", daily.time[0], "Tomorrow:", daily.time[1]);

        const currentInfo = WEATHER_DESCRIPTIONS[weather_code] || { label: 'Nublado', icon: 'cloud' };

        // Map today and tomorrow forecast
        const forecast: DayForecast[] = [0, 1].map((index) => {
            const code = daily.weather_code[index];
            const info = WEATHER_DESCRIPTIONS[code] || { label: 'Nublado', icon: 'cloud' };
            return {
                maxTemp: Math.round(daily.temperature_2m_max[index]),
                minTemp: Math.round(daily.temperature_2m_min[index]),
                condition: info.label,
                icon: info.icon,
                label: index === 0 ? "Hoy" : "Mañana"
            };
        });

        const weatherData: WeatherData = {
            current: {
                temp: Math.round(temperature_2m),
                condition: currentInfo.label,
                description: getAestheticDescription(weather_code, temperature_2m, city),
                icon: currentInfo.icon
            },
            forecast
        };

        // Save to Cache
        await AsyncStorage.setItem(dynamicCacheKey, JSON.stringify({
            data: weatherData,
            timestamp: Date.now()
        }));

        return weatherData;
    } catch (error) {
        console.log('[WeatherService] Network issue or timeout, using emergency fallback.');
        // Fallback data (Timbiquí)
        return {
            current: {
                temp: 26,
                condition: 'Húmedo y cálido',
                description: 'Clima tropical en Timbiquí, perfecto para navegar los esteros.',
                icon: 'cloud-sun'
            },
            forecast: [
                { maxTemp: 30, minTemp: 24, condition: 'Soleado', icon: 'sun', label: 'Hoy' },
                { maxTemp: 29, minTemp: 23, condition: 'Lluvia ligera', icon: 'cloud-rain', label: 'Mañana' }
            ]
        };
    }
};

const getAestheticDescription = (code: number, temp: number, city?: string): string => {
    const locText = city ? ` en ${city}` : '';
    if (code >= 60) return `Está lloviendo${locText}, ¡asegura bien los botes y la carga!`;
    if (temp > 28) return `Calor tropical${locText}, ¡clima ideal para navegar por el río Timbiquí!`;
    if (temp > 25) return `Día agradable${locText}, ¡mantente hidratado bajo el sol del Pacífico!`;
    if (temp < 20) return `Clima inusual${locText}, ¡parece que refrescó bastante en el litoral!`;
    return `Clima perfecto${locText} para zarpar hoy desde el muelle.`;
};
