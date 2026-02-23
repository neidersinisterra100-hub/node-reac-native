import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TideData {
    seaLevel: number;
    trend: 'Subiendo' | 'Bajando' | 'Estable';
    cycle: {
        name: 'Puja' | 'Quiebra';
        day: number;
        description: string;
    };
    moonPhase: string;
    timestamp: number;
}

const CACHE_KEY = '@tide_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Reference New Moon: Feb 17, 2026, 06:13 UTC
const REF_NEW_MOON = new Date('2026-02-17T06:13:00Z').getTime();
const SYNODIC_MONTH = 29.53059 * 24 * 60 * 60 * 1000;

export const getTideInfo = async (lat?: number, lon?: number): Promise<TideData> => {
    try {
        const latitude = lat ?? 2.7712; // Timbiquí default
        const longitude = lon ?? -77.6631;

        const dynamicCacheKey = `${CACHE_KEY}_${latitude}_${longitude}`;

        const cached = await AsyncStorage.getItem(dynamicCacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
                return data;
            }
        }

        // 1. Get Sea Level Height (Tides)
        let response;
        try {
            response = await axios.get(
                `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&hourly=sea_level_height`,
                { timeout: 5000 }
            );
        } catch (e: any) {
            if (e.response?.status === 400) {
                console.log(`[TideService] Point ${latitude},${longitude} is inland. Shifting West for Marine data...`);
                // Shift West to find the ocean
                response = await axios.get(
                    `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude - 0.15}&hourly=sea_level_height`,
                    { timeout: 5000 }
                );
            } else {
                throw e;
            }
        }

        const hourly = response.data.hourly;
        const now = new Date();
        const currentHourIndex = hourly.time.findIndex((t: string) => new Date(t).getHours() === now.getHours());

        const currentHeight = hourly.sea_level_height[currentHourIndex] || 0;
        const prevHeight = hourly.sea_level_height[currentHourIndex - 1] || currentHeight;

        let trend: 'Subiendo' | 'Bajando' | 'Estable' = 'Estable';
        if (currentHeight > prevHeight + 0.05) trend = 'Subiendo';
        else if (currentHeight < prevHeight - 0.05) trend = 'Bajando';

        // 2. Calculate Moon Phase & Puja/Quiebra logic
        const msSinceRef = Date.now() - REF_NEW_MOON;
        const phaseDays = (msSinceRef % SYNODIC_MONTH) / (24 * 60 * 60 * 1000);

        let cycleName: 'Puja' | 'Quiebra' = 'Puja';
        let cycleDay = 1;
        let moonLabel = 'Luna Nueva';

        // Simplified Lunar mapping for Puja/Quiebra
        // 0-7.4: Puja (peak at 0)
        // 7.4-14.8: Quiebra (minimum at 7.4)
        // 14.8-22.1: Puja (peak at 14.8)
        // 22.1-29.5: Quiebra (minimum at 22.1)

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
            ? 'Mareas fuertes, el mar sube con mucha fuerza. Ideal para barcos grandes.'
            : 'Mareas débiles, el mar sube poco y con poca fuerza. Precaución en esteros bajos.';

        const tideData: TideData = {
            seaLevel: Number(currentHeight.toFixed(2)),
            trend,
            cycle: {
                name: cycleName,
                day: cycleDay,
                description
            },
            moonPhase: moonLabel,
            timestamp: Date.now()
        };

        await AsyncStorage.setItem(dynamicCacheKey, JSON.stringify({
            data: tideData,
            timestamp: Date.now()
        }));

        return tideData;
    } catch (error: any) {
        if (error.response?.data) {
            console.log('[TideService] API Error Detail:', JSON.stringify(error.response.data));
        }
        console.log('[TideService] Critical error fetching marine data:', error.message);
        // Fallback
        return {
            seaLevel: 1.2,
            trend: 'Subiendo',
            cycle: { name: 'Puja', day: 1, description: 'Datos estimados para Timbiquí.' },
            moonPhase: 'Luna Nueva',
            timestamp: Date.now()
        };
    }
};
