import axios from 'axios';

export interface WeatherData {
    temp: number;
    condition: string;
    description: string;
    icon: string;
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

export const getCurrentWeather = async (): Promise<WeatherData> => {
    try {
        // 1. Get location by IP (Real-world approximate location)
        const locResponse = await axios.get('https://ipapi.co/json/');
        const { latitude, longitude, city } = locResponse.data;

        // 2. Get weather for these coordinates
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const { temperature, weathercode } = response.data.current_weather;

        const info = WEATHER_DESCRIPTIONS[weathercode] || { label: 'Nublado', icon: 'cloud' };

        return {
            temp: Math.round(temperature),
            condition: info.label,
            description: getAestheticDescription(weathercode, temperature, city),
            icon: info.icon
        };
    } catch (error) {
        console.error('[WeatherService] Error fetching weather:', error);
        // Fallback data (Bogotá)
        return {
            temp: 18,
            condition: 'Parcialmente nublado',
            description: 'Un clima fresco en Bogotá, ideal para zarpar.',
            icon: 'cloud-sun'
        };
    }
};

const getAestheticDescription = (code: number, temp: number, city?: string): string => {
    const locText = city ? ` en ${city}` : '';
    if (code >= 60) return `Está lloviendo${locText}, ¡asegura bien la carga!`;
    if (temp > 25) return `Día caluroso${locText}, ¡mantente hidratado en el agua!`;
    if (temp < 15) return `Clima fresco${locText}, ¡abrigo recomendado para el viento!`;
    return `Clima perfecto${locText} para navegar hoy.`;
};
