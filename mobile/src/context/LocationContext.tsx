import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Municipio } from '../services/municipio.service';
import { City } from '../services/city.service';

interface LocationContextType {
    selectedMunicipio: Municipio | null;
    selectedCity: City | null;
    selectMunicipio: (municipio: Municipio | null) => Promise<void>;
    selectCity: (city: City | null) => Promise<void>;
    loading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEYS = {
    MUNICIPIO: '@selected_municipio',
    CITY: '@selected_city'
};

// Default fallback (Timbiquí)
const DEFAULT_MUNICIPIO: Partial<Municipio> = {
    _id: 'default_timbiqui',
    name: 'Timbiquí',
    department: 'Cauca',
    isActive: true,
    latitude: 2.7712,
    longitude: -77.6631
};

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const [selectedMunicipio, setSelectedMunicipio] = useState<Municipio | null>(null);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSavedLocation();
    }, []);

    const loadSavedLocation = async () => {
        try {
            const [savedMun, savedCity] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.MUNICIPIO),
                AsyncStorage.getItem(STORAGE_KEYS.CITY)
            ]);

            if (savedMun) {
                setSelectedMunicipio(JSON.parse(savedMun));
            } else {
                // Set default if none saved
                setSelectedMunicipio(DEFAULT_MUNICIPIO as Municipio);
            }

            if (savedCity) {
                setSelectedCity(JSON.parse(savedCity));
            }
        } catch (error) {
            console.error('Error loading saved location:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectMunicipio = async (municipio: Municipio | null) => {
        setSelectedMunicipio(municipio);
        setSelectedCity(null); // Reset city when municipio changes
        if (municipio) {
            await AsyncStorage.setItem(STORAGE_KEYS.MUNICIPIO, JSON.stringify(municipio));
            await AsyncStorage.removeItem(STORAGE_KEYS.CITY);
        } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.MUNICIPIO);
            await AsyncStorage.removeItem(STORAGE_KEYS.CITY);
        }
    };

    const selectCity = async (city: City | null) => {
        setSelectedCity(city);
        if (city) {
            await AsyncStorage.setItem(STORAGE_KEYS.CITY, JSON.stringify(city));
        } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.CITY);
        }
    };

    return (
        <LocationContext.Provider value={{
            selectedMunicipio,
            selectedCity,
            selectMunicipio,
            selectCity,
            loading
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
