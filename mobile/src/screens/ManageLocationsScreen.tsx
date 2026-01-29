import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { MapPin, Plus, Search, Globe, X } from 'lucide-react-native';
import { getAllMunicipios, createMunicipio, Municipio, toggleMunicipioActive } from '../services/municipio.service';
import { getAllCities, createCity, City } from '../services/city.service';
import { departmentService } from '../services/department.service';
import { Department } from '../types/department';
import { colors } from '../theme/colors';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const StyledText = styled(Text);
const StyledView = styled(View);

export default function ManageLocationsScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'departments' | 'municipios' | 'cities'>('departments');

    // Data
    const [departments, setDepartments] = useState<Department[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);

    // Modals
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [showMuniModal, setShowMuniModal] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);

    // Form Data
    const [newDeptName, setNewDeptName] = useState('');
    const [newMuniName, setNewMuniName] = useState('');
    const [newCityName, setNewCityName] = useState('');

    // Selection
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [selectedMuniId, setSelectedMuniId] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [deptData, muniData, cityData] = await Promise.all([
                departmentService.getAll(false),
                getAllMunicipios(),
                getAllCities()
            ]);
            setDepartments(deptData);
            setMunicipios(muniData);
            setCities(cityData);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudieron cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDepartment = async () => {
        if (!newDeptName.trim()) return Alert.alert("Error", "Ingrese nombre");
        try {
            await departmentService.create({ name: newDeptName.trim() });
            Alert.alert("Éxito", "Departamento creado");
            setShowDeptModal(false);
            setNewDeptName('');
            loadData();
        } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.message || "Error al crear");
        }
    };

    const handleCreateMunicipio = async () => {
        if (!newMuniName.trim() || !selectedDeptId) return Alert.alert("Error", "Complete campos");
        try {
            const dept = departments.find(d => d._id === selectedDeptId);
            await createMunicipio(newMuniName.trim(), dept?.name || 'General', selectedDeptId);
            Alert.alert("Éxito", "Municipio creado");
            setShowMuniModal(false);
            setNewMuniName('');
            setSelectedDeptId('');
            loadData();
        } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.message || "Error al crear");
        }
    };

    const handleCreateCity = async () => {
        if (!newCityName.trim() || !selectedMuniId) return Alert.alert("Error", "Complete campos");
        try {
            const muni = municipios.find(m => m._id === selectedMuniId);
            if (!muni) return;
            const deptId = (muni as any).departmentId || ''; // Type check might fail if interface not updated
            const deptName = muni.department;

            await createCity(newCityName.trim(), deptName, deptId, selectedMuniId);
            Alert.alert("Éxito", "Ciudad creada");
            setShowCityModal(false);
            setNewCityName('');
            setSelectedMuniId('');
            loadData();
        } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.message || "Error al crear");
        }
    };

    const handleToggleDept = async (id: string, currentStatus: boolean) => {
        try {
            await departmentService.toggleActive(id, !currentStatus);
            loadData();
        } catch (error) { Alert.alert("Error", "No se pudo cambiar estado"); }
    };

    const isOwner = user?.role === 'owner' || user?.role === 'super_owner';

    return (
        <ScreenContainer withPadding={false}>
            {/* Header */}
            <StyledView className="bg-white p-4 pt-12 border-b border-gray-100 flex-row items-center justify-between">
                <StyledView className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-50 p-2 rounded-full">
                        <ArrowLeft size={24} color="#0B4F9C" />
                    </TouchableOpacity>
                    <StyledText className="text-xl font-bold text-nautic-primary">Gestión de Lugares</StyledText>
                </StyledView>
                <TouchableOpacity onPress={loadData}>
                    <Search size={20} color="#0B4F9C" />
                </TouchableOpacity>
            </StyledView>

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-16">
                <StyledView className="flex-row p-4 gap-4">
                    <TouchableOpacity onPress={() => setActiveTab('departments')} className={`px-4 py-2 rounded-xl border ${activeTab === 'departments' ? 'bg-nautic-primary border-nautic-primary' : 'bg-white border-gray-200'}`}>
                        <StyledText className={`font-bold ${activeTab === 'departments' ? 'text-white' : 'text-gray-500'}`}>Departamentos</StyledText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('municipios')} className={`px-4 py-2 rounded-xl border ${activeTab === 'municipios' ? 'bg-nautic-primary border-nautic-primary' : 'bg-white border-gray-200'}`}>
                        <StyledText className={`font-bold ${activeTab === 'municipios' ? 'text-white' : 'text-gray-500'}`}>Municipios</StyledText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('cities')} className={`px-4 py-2 rounded-xl border ${activeTab === 'cities' ? 'bg-nautic-primary border-nautic-primary' : 'bg-white border-gray-200'}`}>
                        <StyledText className={`font-bold ${activeTab === 'cities' ? 'text-white' : 'text-gray-500'}`}>Ciudades</StyledText>
                    </TouchableOpacity>
                </StyledView>
            </ScrollView>

            <ScrollView className="flex-1 px-4 mb-4">
                {activeTab === 'departments' && (
                    <>
                        {isOwner && <Button title="Nuevo Departamento" onPress={() => setShowDeptModal(true)} icon={<Plus color="white" />} />}
                        <StyledView className="mt-4 gap-3 pb-20">
                            {departments.map(d => (
                                <Card key={d._id} className="p-4 flex-row justify-between items-center">
                                    <StyledView>
                                        <StyledText className="font-bold text-lg text-gray-800">{d.name}</StyledText>
                                        <StyledText className="text-gray-500 text-xs">ID: {d._id.substring(0, 8)}...</StyledText>
                                    </StyledView>
                                    <TouchableOpacity onPress={() => handleToggleDept(d._id, d.isActive)} className={`px-2 py-1 rounded-full ${d.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <StyledText className={`text-xs ${d.isActive ? 'text-green-700' : 'text-red-700'}`}>{d.isActive ? 'Activo' : 'Inactivo'}</StyledText>
                                    </TouchableOpacity>
                                </Card>
                            ))}
                        </StyledView>
                    </>
                )}

                {activeTab === 'municipios' && (
                    <>
                        {isOwner && <Button title="Nuevo Municipio" onPress={() => setShowMuniModal(true)} icon={<Plus color="white" />} />}
                        <StyledView className="mt-4 gap-3 pb-20">
                            {municipios.map(m => {
                                const dept = departments.find(d => d._id === (m as any).departmentId);
                                return (
                                    <Card key={m._id} className="p-4 flex-row justify-between items-center">
                                        <StyledView>
                                            <StyledText className="font-bold text-lg text-gray-800">{m.name}</StyledText>
                                            <StyledText className="text-gray-500">{dept?.name || m.department}</StyledText>
                                        </StyledView>
                                        <StyledView className={`px-2 py-1 rounded-full ${m.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <StyledText className={`text-xs ${m.isActive ? 'text-green-700' : 'text-red-700'}`}>{m.isActive ? 'Activo' : 'Inactivo'}</StyledText>
                                        </StyledView>
                                    </Card>
                                );
                            })}
                        </StyledView>
                    </>
                )}

                {activeTab === 'cities' && (
                    <>
                        {isOwner && <Button title="Nueva Ciudad" onPress={() => setShowCityModal(true)} icon={<Plus color="white" />} />}
                        <StyledView className="mt-4 gap-3 pb-20">
                            {cities.map(c => {
                                const parentMuni = municipios.find(m => m._id === (c as any).municipioId); // Handle ID naming mismatch if any
                                return (
                                    <Card key={c._id} className="p-4 flex-row justify-between items-center">
                                        <StyledView>
                                            <StyledText className="font-bold text-lg text-gray-800">{c.name}</StyledText>
                                            <StyledText className="text-gray-500">{parentMuni?.name || '...'}</StyledText>
                                        </StyledView>
                                        <MapPin size={20} color={colors.primary} />
                                    </Card>
                                );
                            })}
                        </StyledView>
                    </>
                )}
            </ScrollView>

            {/* Modal Department */}
            <Modal visible={showDeptModal} animationType="fade" transparent>
                <StyledView className="flex-1 bg-black/50 justify-center p-4">
                    <StyledView className="bg-white rounded-2xl p-6">
                        <StyledText className="text-xl font-bold mb-4 text-center">Nuevo Departamento</StyledText>
                        <TextInput value={newDeptName} onChangeText={setNewDeptName} className="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-200" placeholder="Ej. Chocó" />
                        <Button title="Guardar" onPress={handleCreateDepartment} />
                        <TouchableOpacity onPress={() => setShowDeptModal(false)} className="mt-4 items-center"><StyledText className="text-nautic-primary">Cancelar</StyledText></TouchableOpacity>
                    </StyledView>
                </StyledView>
            </Modal>

            {/* Modal Municipio */}
            <Modal visible={showMuniModal} animationType="fade" transparent>
                <StyledView className="flex-1 bg-black/50 justify-center p-4">
                    <StyledView className="bg-white rounded-2xl p-6 h-3/4">
                        <StyledText className="text-xl font-bold mb-4 text-center">Nuevo Municipio</StyledText>
                        <TextInput value={newMuniName} onChangeText={setNewMuniName} className="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-200" placeholder="Nombre Municipio" />
                        <StyledText className="text-gray-500 mb-2">Seleccione Departamento</StyledText>
                        <ScrollView className="mb-4 bg-gray-50 rounded-xl border border-gray-200 max-h-40">
                            {departments.filter(d => d.isActive).map(d => (
                                <TouchableOpacity key={d._id} onPress={() => setSelectedDeptId(d._id)} className={`p-3 border-b border-gray-100 ${selectedDeptId === d._id ? 'bg-blue-100' : ''}`}>
                                    <StyledText>{d.name}</StyledText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <Button title="Guardar" onPress={handleCreateMunicipio} />
                        <TouchableOpacity onPress={() => setShowMuniModal(false)} className="mt-4 items-center"><StyledText className="text-nautic-primary">Cancelar</StyledText></TouchableOpacity>
                    </StyledView>
                </StyledView>
            </Modal>

            {/* Modal City */}
            <Modal visible={showCityModal} animationType="fade" transparent>
                <StyledView className="flex-1 bg-black/50 justify-center p-4">
                    <StyledView className="bg-white rounded-2xl p-6 h-3/4">
                        <StyledText className="text-xl font-bold mb-4 text-center">Nueva Ciudad</StyledText>
                        <TextInput value={newCityName} onChangeText={setNewCityName} className="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-200" placeholder="Nombre Ciudad" />

                        <StyledText className="text-gray-500 mb-2">Seleccione Departamento</StyledText>
                        <ScrollView className="mb-4 bg-gray-50 rounded-xl border border-gray-200 max-h-40">
                            {departments.filter(d => d.isActive).map(d => (
                                <TouchableOpacity key={d._id} onPress={() => { setSelectedDeptId(d._id); setSelectedMuniId(''); }} className={`p-3 border-b border-gray-100 ${selectedDeptId === d._id ? 'bg-blue-100' : ''}`}>
                                    <StyledText>{d.name}</StyledText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <StyledText className="text-gray-500 mb-2">Seleccione Municipio</StyledText>
                        <ScrollView className="mb-4 bg-gray-50 rounded-xl border border-gray-200 max-h-40">
                            {municipios
                                .filter(m => m.isActive && (selectedDeptId ? (m as any).departmentId === selectedDeptId : true))
                                .map(m => (
                                    <TouchableOpacity key={m._id} onPress={() => setSelectedMuniId(m._id)} className={`p-3 border-b border-gray-100 ${selectedMuniId === m._id ? 'bg-blue-100' : ''}`}>
                                        <StyledText>{m.name}</StyledText>
                                    </TouchableOpacity>
                                ))}
                        </ScrollView>
                        <Button title="Guardar" onPress={handleCreateCity} />
                        <TouchableOpacity onPress={() => setShowCityModal(false)} className="mt-4 items-center"><StyledText className="text-nautic-primary">Cancelar</StyledText></TouchableOpacity>
                    </StyledView>
                </StyledView>
            </Modal>
        </ScreenContainer>
    );
}
