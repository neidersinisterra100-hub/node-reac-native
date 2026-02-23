import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

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
    forecast: Array<{
        day: string;
        max: number;
        min: number;
        condition: string;
        icon: string;
    }>;
}

export interface TideData {
    seaLevel: number;
    trend: 'Subiendo' | 'Bajando' | 'Estable';
    cycle: {
        name: 'Puja' | 'Quiebra';
        day: number;
        description: string;
    };
    highTides: string[];
    lowTides: string[];
    moonPhase: string;
    timestamp: number;
}

// Timbiquí defaults
const DEFAULT_LAT = 2.7712;
const DEFAULT_LON = -77.6631;

const REF_NEW_MOON = new Date('2026-02-17T06:13:00Z').getTime();
const SYNODIC_MONTH = 29.53059 * 24 * 60 * 60 * 1000;

export class MarineService {
    static async getCurrentWeather(lat: number = DEFAULT_LAT, lon: number = DEFAULT_LON): Promise<WeatherData> {
        try {
            const response = await axios.get(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`,
                { timeout: 5000 }
            );

            const {
                temperature_2m,
                apparent_temperature,
                relative_humidity_2m,
                weather_code,
                wind_speed_10m,
                wind_direction_10m
            } = response.data.current;
            const daily = response.data.daily;

            const currentInfo = this.getWeatherInfo(weather_code);
            const windDir = this.getWindDirectionLabel(wind_direction_10m);

            const forecast = daily.time.map((time: string, index: number) => {
                const code = daily.weather_code[index];
                const info = this.getWeatherInfo(code);
                const date = dayjs(time);

                let dayLabel = date.format('ddd'); // default to day name
                if (index === 0) dayLabel = 'Hoy';
                else if (index === 1) dayLabel = 'Mañana';

                return {
                    day: dayLabel,
                    max: Math.round(daily.temperature_2m_max[index]),
                    min: Math.round(daily.temperature_2m_min[index]),
                    condition: info.label,
                    icon: info.icon
                };
            });

            return {
                current: {
                    temp: Math.round(temperature_2m),
                    feelsLike: Math.round(apparent_temperature),
                    humidity: relative_humidity_2m,
                    uvIndex: daily.uv_index_max[0] || 0,
                    sunrise: dayjs(daily.sunrise[0]).format('HH:mm'),
                    sunset: dayjs(daily.sunset[0]).format('HH:mm'),
                    condition: currentInfo.label,
                    description: this.getAestheticDescription(weather_code, temperature_2m),
                    icon: currentInfo.icon,
                    windSpeed: Math.round(wind_speed_10m),
                    windDirection: windDir
                },
                forecast
            };
        } catch (error) {
            console.error('[MarineService] Weather Error:', error);
            // Emergency fallback handled by the server
            return this.getEmergencyWeather();
        }
    }

    static async getTideInfo(lat: number = DEFAULT_LAT, lon: number = DEFAULT_LON): Promise<TideData> {
        try {
            let response;
            try {
                response = await axios.get(
                    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=sea_level_height`,
                    { timeout: 5000 }
                );
            } catch (error: any) {
                // Coastal Fallback: If 400 (inland), shift West 0.15 degrees
                if (error.response?.status === 400) {
                    response = await axios.get(
                        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon - 0.15}&hourly=sea_level_height`,
                        { timeout: 5000 }
                    );
                } else {
                    throw error;
                }
            }

            const hourly = response.data.hourly;
            const now = new Date();
            const currentHourIndex = hourly.time.findIndex((t: string) => dayjs(t).hour() === dayjs(now).hour());

            const currentHeight = hourly.sea_level_height[currentHourIndex] || 0;
            const prevHeight = hourly.sea_level_height[currentHourIndex - 1] || currentHeight;

            let trend: 'Subiendo' | 'Bajando' | 'Estable' = 'Estable';
            if (currentHeight > prevHeight + 0.05) trend = 'Subiendo';
            else if (currentHeight < prevHeight - 0.05) trend = 'Bajando';

            // Peak detection for High/Low tides
            const highTides: string[] = [];
            const lowTides: string[] = [];

            for (let i = 1; i < 24; i++) {
                const prev = hourly.sea_level_height[i - 1];
                const curr = hourly.sea_level_height[i];
                const next = hourly.sea_level_height[i + 1];

                if (curr > prev && curr > next) {
                    highTides.push(dayjs(hourly.time[i]).format('HH:mm'));
                } else if (curr < prev && curr < next) {
                    lowTides.push(dayjs(hourly.time[i]).format('HH:mm'));
                }
            }

            const { cycleName, cycleDay, moonLabel, description } = this.calculateLunarCycle();

            return {
                seaLevel: Number(currentHeight.toFixed(2)),
                trend,
                cycle: {
                    name: cycleName,
                    day: cycleDay,
                    description
                },
                highTides,
                lowTides,
                moonPhase: moonLabel,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('[MarineService] Tide Error:', error);
            return this.getEmergencyTides();
        }
    }

    private static calculateLunarCycle() {
        // Traditional Lag: In the Pacific, Puja starts ~2.5 days after New/Full Moon.
        const TIDAL_LAG_DAYS = 2.5;
        const msSinceRef = Date.now() - REF_NEW_MOON;
        const phaseDays = ((msSinceRef % SYNODIC_MONTH) / (24 * 60 * 60 * 1000) - TIDAL_LAG_DAYS + 29.53) % 29.53;

        let cycleName: 'Puja' | 'Quiebra' = 'Puja';
        let cycleDay = 1;
        let moonLabel = 'Luna Nueva';

        if (phaseDays < 7.38) {
            cycleName = 'Puja';
            cycleDay = Math.floor(phaseDays) + 1;
            moonLabel = 'Luna Nueva / Creciente';
        } else if (phaseDays < 14.76) {
            cycleName = 'Quiebra';
            cycleDay = Math.floor(phaseDays - 7.38) + 1;
            moonLabel = 'Cuarto Creciente';
        } else if (phaseDays < 22.14) {
            cycleName = 'Puja';
            cycleDay = Math.floor(phaseDays - 14.76) + 1;
            moonLabel = 'Luna Llena / Menguante';
        } else {
            cycleName = 'Quiebra';
            cycleDay = Math.floor(phaseDays - 22.14) + 1;
            moonLabel = 'Cuarto Menguante';
        }

        const description = cycleName === 'Puja'
            ? 'Mareas grandes de aguaje (Puja). Máxima fuerza y amplitud en esteros.'
            : 'Mareas débiles, el mar sube poco y con poca fuerza. Precaución en esteros bajos.';

        return { cycleName, cycleDay, moonLabel, description };
    }

    private static getWeatherInfo(code: number) {
        if (code === 0) return { label: 'Despejado', icon: 'sun' };
        if (code <= 3) return { label: 'Parcialmente Nublado', icon: 'cloud-sun' };
        if (code <= 48) return { label: 'Niebla', icon: 'cloud' };
        if (code <= 55) return { label: 'Llovizna', icon: 'cloud-drizzle' };
        if (code <= 65) return { label: 'Lluvia', icon: 'cloud-rain' };
        if (code <= 75) return { label: 'Nieve', icon: 'cloud-snow' };
        if (code <= 82) return { label: 'Aguaceros', icon: 'cloud-lightning' };
        return { label: 'Tormenta', icon: 'zap' };
    }

    private static getWindDirectionLabel(degree: number): string {
        const directions = [
            'Norte', 'Noreste', 'Este', 'Sureste',
            'Sur', 'Suroeste', 'Oeste', 'Noroeste'
        ];
        const index = Math.round(degree / 45) % 8;
        return directions[index];
    }

    private static getAestheticDescription(code: number, temp: number): string {
        let text = "";
        if (code === 0) text = "Cielo despejado, ideal para navegar.";
        else if (code <= 3) text = "Cielo algo nublado, clima agradable.";
        else if (code <= 65) text = "Se esperan lluvias, toma precauciones.";
        else text = "Clima inestable, consulta reportes locales.";

        if (temp > 28) text += " Hace bastante calor.";
        return text;
    }

    private static getEmergencyWeather(): WeatherData {
        return {
            current: {
                temp: 26,
                condition: 'Húmedo',
                description: 'Datos estimados para la zona Pacífico.',
                icon: 'cloud',
                windSpeed: 5,
                windDirection: 'Oeste',
                feelsLike: 28,
                humidity: 80,
                uvIndex: 8,
                sunrise: '06:15',
                sunset: '18:20'
            },
            forecast: [
                { day: 'Hoy', max: 30, min: 24, condition: 'Variable', icon: 'cloud-sun' },
                { day: 'Mañana', max: 29, min: 23, condition: 'Lluvias', icon: 'cloud-rain' }
            ]
        };
    }

    private static getEmergencyTides(): TideData {
        const { cycleName, cycleDay, moonLabel, description } = this.calculateLunarCycle();

        return {
            seaLevel: 1.5,
            trend: 'Estable',
            cycle: {
                name: cycleName,
                day: cycleDay,
                description
            },
            highTides: ['08:30', '20:45'],
            lowTides: ['02:15', '14:30'],
            moonPhase: moonLabel,
            timestamp: Date.now()
        };
    }
}
