import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { getAllRoutes, Route } from '../../services/route.service';
import { getAllCities, City } from '../../services/city.service';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { MapPin, Search, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StyledText = styled(Text);
const StyledView = styled(View);

export const LocationSelectionScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const isOwner = user?.role === 'owner' || user?.role === 'admin';
    const isFocused = useIsFocused();

    const [cities, setCities] = useState<City[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);

    const [loading, setLoading] = useState(true);

    const [origin, setOrigin] = useState<string>('');
    const [destination, setDestination] = useState<string>('');

    const [showOriginModal, setShowOriginModal] = useState(false);
    const [showDestinationModal, setShowDestinationModal] = useState(false);

    useEffect(() => {
        if (isFocused) {
            loadData();
            loadSavedOrigin();
        }
    }, [isFocused]);

    const loadSavedOrigin = async () => {
        try {
            const saved = await AsyncStorage.getItem('user_origin');
            if (saved) setOrigin(saved);
        } catch (e) {
            console.log('Error loading saved origin', e);
        }
    };

    const loadData = async () => {
        try {
            const [citiesData, routesData] = await Promise.all([
                getAllCities(),
                getAllRoutes()
            ]);
            setCities(citiesData);
            setRoutes(routesData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const originOptions = cities.map(c => c.name);

    const availableDestinations = origin
        ? Array.from(new Set(routes.filter(r => r.origin === origin).map(r => r.destination))).sort()
        : [];

    const handleSelectOrigin = async (val: string) => {
        setOrigin(val);
        setDestination('');
        await AsyncStorage.setItem('user_origin', val);
    };

    const handleSearch = () => {
        if (origin && destination) {
            navigation.navigate('AllTrips', { origin, destination });
        }
    };

    const SelectModal = ({ visible, onClose, data, onSelect, title }: any) => (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <StyledView className="flex-1 bg-black/50 justify-end">
                <StyledView className={`${isDark ? 'bg-dark-surface' : 'bg-white'} rounded-t-3xl p-6 h-2/3`}>
                    <StyledView className={`flex-row justify-between items-center mb-4 border-b ${isDark ? 'border-dark-border' : 'border-gray-100'} pb-4`}>
                        <StyledText className={`text-xl font-bold ${isDark ? 'text-dark-text' : 'text-nautic-primary'}`}>{title}</StyledText>
                        <TouchableOpacity onPress={onClose}>
                            <StyledText className={isDark ? 'text-dark-textMuted' : 'text-nautic-lightText'}>Cerrar</StyledText>
                        </TouchableOpacity>
                    </StyledView>
                    <FlatList
                        data={data}
                        keyExtractor={(item, index) => item + index}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className={`py-4 border-b ${isDark ? 'border-dark-border' : 'border-gray-50'} flex-row items-center`}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <MapPin size={20} color={isDark ? "#00B4D8" : "#0B4F9C"} style={{ marginRight: 12 }} />
                                <StyledText className={`text-lg ${isDark ? 'text-dark-text' : 'text-nautic-text'}`}>{item}</StyledText>
                            </TouchableOpacity>
                        )}
                    />
                </StyledView>
            </StyledView>
        </Modal>
    );

    return (
        <ScreenContainer withPadding={false}>
            {/* Header with back button */}
            <StyledView className={`${isDark ? 'bg-dark-surface' : 'bg-nautic-primary'} pt-12 pb-6 px-6 rounded-b-[24px] shadow-sm mb-4 flex-row items-center gap-4`}>
                <TouchableOpacity onPress={() => navigation.goBack()} className="bg-white/20 p-2 rounded-full">
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <StyledText className="text-white text-xl font-bold flex-1">Buscar Viajes</StyledText>
            </StyledView>

            <StyledView className="flex-1 px-4">
                <StyledView className="mt-6 mb-8">
                    <StyledView className="flex-row justify-between items-start">
                        <StyledView>
                            <StyledText className={`text-xl font-medium ${isDark ? 'text-dark-textMuted' : 'text-nautic-lightText'}`}>¿A dónde quieres ir?</StyledText>
                        </StyledView>
                    </StyledView>
                </StyledView>

                <Card className="p-6">
                    <StyledView className="mb-4">
                        <StyledText className={`text-sm font-medium ${isDark ? 'text-dark-textMuted' : 'text-gray-400'} mb-2`}>MUNICIPIO DE ORIGEN</StyledText>
                        <TouchableOpacity
                            onPress={() => setShowOriginModal(true)}
                            className={`${isDark ? 'bg-dark-bg' : 'bg-nautic-bg'} p-4 rounded-xl flex-row items-center`}
                        >
                            <MapPin size={24} color={origin ? (isDark ? "#00B4D8" : "#0B4F9C") : "#94A3B8"} />
                            <StyledText className={`ml-3 text-lg ${origin ? (isDark ? 'text-dark-text font-semibold' : 'text-nautic-text font-semibold') : 'text-gray-400'}`}>
                                {origin || "Selecciona municipio"}
                            </StyledText>
                        </TouchableOpacity>
                    </StyledView>

                    <StyledView className="mb-6">
                        <StyledText className={`text-sm font-medium ${isDark ? 'text-dark-textMuted' : 'text-gray-400'} mb-2`}>DESTINO</StyledText>
                        <TouchableOpacity
                            onPress={() => {
                                if (origin) setShowDestinationModal(true);
                            }}
                            className={`${isDark ? 'bg-dark-bg' : 'bg-nautic-bg'} p-4 rounded-xl flex-row items-center ${!origin ? 'opacity-50' : ''}`}
                            disabled={!origin}
                        >
                            <MapPin size={24} color={destination ? (isDark ? "#00B4D8" : "#0B4F9C") : "#94A3B8"} />
                            <StyledText className={`ml-3 text-lg ${destination ? (isDark ? 'text-dark-text font-semibold' : 'text-nautic-text font-semibold') : 'text-gray-400'}`}>
                                {destination || "Selecciona destino"}
                            </StyledText>
                        </TouchableOpacity>
                    </StyledView>

                    <Button
                        title="Buscar Viajes"
                        onPress={handleSearch}
                        disabled={!origin || !destination}
                    />
                </Card>

                <StyledText className={`text-lg font-bold ${isDark ? 'text-dark-text' : 'text-nautic-text'} mt-6 mb-4`}>Municipios Disponibles</StyledText>
                {loading ? (
                    <ActivityIndicator size="small" color={isDark ? "#00B4D8" : "#0B4F9C"} />
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
                        {cities.map((city) => (
                            <TouchableOpacity
                                key={city._id}
                                className={`${isDark ? 'bg-dark-surface' : 'bg-white'} mr-4 rounded-2xl w-40 h-48 overflow-hidden shadow-sm elevation-1 items-center justify-center`}
                                onPress={() => handleSelectOrigin(city.name)}
                            >
                                <StyledView className={`flex-1 ${isDark ? 'bg-dark-bg' : 'bg-nautic-secondary'} w-full items-center justify-center`}>
                                    <MapPin size={32} color={isDark ? "#00B4D8" : "#0B4F9C"} />
                                </StyledView>
                                <StyledView className={`p-3 w-full ${isDark ? 'bg-dark-surface' : 'bg-white'}`}>
                                    <StyledText className={`font-bold ${isDark ? 'text-dark-text' : 'text-nautic-primary'} text-center`}>{city.name}</StyledText>
                                    <StyledText className={`text-xs ${isDark ? 'text-dark-textMuted' : 'text-nautic-lightText'} text-center`}>{city.department}</StyledText>
                                </StyledView>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </StyledView>

            <SelectModal
                visible={showOriginModal}
                onClose={() => setShowOriginModal(false)}
                data={originOptions}
                onSelect={handleSelectOrigin}
                title="Selecciona Origen"
            />

            <SelectModal
                visible={showDestinationModal}
                onClose={() => setShowDestinationModal(false)}
                data={availableDestinations}
                onSelect={setDestination}
                title="Selecciona Destino"
            />
        </ScreenContainer>
    );
};
