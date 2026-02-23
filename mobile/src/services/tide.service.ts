import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const CACHE_KEY = '@tide_cache';
const CACHE_TTL = 1 * 60 * 1000; // 1 minute

/**
 * Tide Service - Thin Client Version
 * No hardcoded defaults or fallbacks. All logic is in the backend.
 */
export const getTideInfo = async (lat?: number, lon?: number): Promise<TideData> => {
    try {
        const dynamicCacheKey = lat && lon ? `${CACHE_KEY}_${lat}_${lon}` : `${CACHE_KEY}_default`;

        const cached = await AsyncStorage.getItem(dynamicCacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
                return data;
            }
        }

        // Call backend API. Backend handles defaults if lat/lon are missing.
        const url = lat && lon ? `/marine/tides?lat=${lat}&lon=${lon}` : '/marine/tides';
        const { data } = await api.get<TideData>(url);

        await AsyncStorage.setItem(dynamicCacheKey, JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));

        return data;
    } catch (error) {
        console.error('[TideService] Error fetching from backend:', error);
        throw error;
    }
};
