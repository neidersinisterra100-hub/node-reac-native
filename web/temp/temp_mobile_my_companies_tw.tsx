import { View, FlatList, Alert, TouchableOpacity, Text } from "react-native";
import { IconButton } from "react-native-paper";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Building2 } from "lucide-react-native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

import { 
  getMyCompanies, 
  getAllCompanies, 
  toggleCompanyActive, 
  deleteCompany, 
  Company 
} from "../services/company.service";
import { useAuth } from "../context/AuthContext";

export default function MyCompaniesScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const isOwner = user?.role === "owner" || user?.role === "admin";

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      let data: Company[] = [];
      if (isOwner) {
          data = await getMyCompanies();
      } else {
          data = await getAllCompanies();
      }
      setCompanies(data);
    } catch (error) {
      console.log("Error loading companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [user]);

  const handleToggle = async (id: string, currentStatus: boolean) => {
      try {
          await toggleCompanyActive(id, !currentStatus);
          setCompanies(prev => prev.map(c => c._id === id ? { ...c, active: !currentStatus } : c));
      } catch {
          Alert.alert("Error", "No se pudo cambiar el estado");
      }
  };

  const handleDelete = async (id: string) => {
      Alert.alert(
          "Eliminar Empresa",
          "¿Estás seguro? Se borrarán rutas y viajes asociados.",
          [
              { text: "Cancelar", style: "cancel" },
              { 
                  text: "Eliminar", 
                  style: "destructive",
                  onPress: async () => {
                      try {
                          await deleteCompany(id);
                          setCompanies(prev => prev.filter(c => c._id !== id));
                      } catch {
                          Alert.alert("Error", "No se pudo eliminar");
                      }
                  }
              }
          ]
      );
  };

  const renderItem = ({ item }: { item: Company }) => (
    <TouchableOpacity 
        className={`bg-white rounded-2xl p-4 border mb-4 shadow-sm ${(!item.active && isOwner) ? 'border-gray-300 opacity-70' : 'border-transparent'}`}
        onPress={() => navigation.navigate("CompanyRoutes", {
            companyId: item._id,
            companyName: item.name,
        })}
    >
      <View className="flex-row items-center gap-3">
          <View className="bg-blue-50 p-3 rounded-xl">
             <Building2 size={24} color="#1a2236" /> 
          </View>
          <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
              {isOwner && <Text className="text-gray-500 text-xs">Balance: ${item.balance}</Text>}
          </View>
          
          {/* ACCIONES OWNER */}
          {isOwner && (
              <View className="flex-row">
                  <IconButton 
                      icon="power" 
                      iconColor={item.active ? "#10b981" : "#9ca3af"} 
                      size={20}
                      onPress={() => handleToggle(item._id, !!item.active)}
                  />
                  <IconButton 
                      icon="delete-outline" 
                      iconColor="#ef4444" 
                      size={20}
                      onPress={() => handleDelete(item._id)}
                  />
              </View>
          )}
      </View>
      
      {!item.active && !isOwner && (
          <Text className="text-red-500 text-xs font-bold mt-2 text-right">Inactiva</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <AppContainer>
      <AppHeader title={isOwner ? "Mis Empresas" : "Empresas Disponibles"} showBack={false} />

      <FlatList
        data={companies}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={loadCompanies}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          isOwner ? (
              <View className="mb-4">
                  <PrimaryButton
                    label="Nueva Empresa"
                    onPress={() => navigation.navigate("CreateCompany")}
                  />
              </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center justify-center py-10">
                 <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Building2 size={32} color="#9ca3af" />
                 </View>
                <Text className="text-gray-500 text-center text-base">
                    {isOwner ? "Comienza creando tu primera empresa." : "No hay empresas disponibles por el momento."}
                </Text>
            </View>
          ) : null
        }
        renderItem={renderItem}
      />
    </AppContainer>
  );
}
