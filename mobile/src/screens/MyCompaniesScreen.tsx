import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      let data: Company[] = [];
      
      if (isOwner) {
          data = await getMyCompanies();
      } else {
          data = await getAllCompanies();
      }
      setCompanies(data);
    } catch (error: any) {
      setErrorMsg("No se pudieron cargar las empresas.");
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
      Alert.alert("Eliminar Empresa", "¿Estás seguro?", [
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
      ]);
  };

  const renderItem = ({ item }: { item: Company }) => (
    <TouchableOpacity 
        style={[styles.card, !item.active && isOwner && styles.cardInactive]}
        onPress={() => navigation.navigate("CompanyRoutes", {
            companyId: item._id,
            companyName: item.name,
        })}
    >
      <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
             <Building2 size={24} color="#1a2236" /> 
          </View>
          <View style={{flex: 1}}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {isOwner && <Text style={styles.cardSubtitle}>Balance: ${item.balance}</Text>}
          </View>
          
          {isOwner && (
              <View style={{flexDirection: 'row'}}>
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
          <Text style={styles.inactiveText}>Inactiva</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <AppContainer>
      <AppHeader title={isOwner ? "Mis Empresas" : "Empresas Disponibles"} showBack={false} />

      {errorMsg && (
          <View style={styles.errorBox}>
              <Text style={{color: '#dc2626'}}>{errorMsg}</Text>
              <TouchableOpacity onPress={loadCompanies}>
                  <Text style={{color: '#b91c1c', fontWeight: 'bold', textDecorationLine: 'underline'}}>Reintentar</Text>
              </TouchableOpacity>
          </View>
      )}

      {loading ? (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#ff6b00" />
          </View>
      ) : (
        <FlatList
            data={companies}
            keyExtractor={(item) => item._id}
            refreshing={loading}
            onRefresh={loadCompanies}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
            isOwner ? (
                <View style={{ marginBottom: 20 }}>
                    <PrimaryButton
                        label="Nueva Empresa"
                        onPress={() => navigation.navigate("CreateCompany")}
                    />
                </View>
            ) : null
            }
            ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 40}}>
                <Text style={{color: '#6b7280'}}>No hay empresas disponibles.</Text>
            </View>
            }
            renderItem={renderItem}
        />
      )}
    </AppContainer>
  );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb', // gray-200
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardInactive: {
        opacity: 0.7,
        borderColor: '#d1d5db',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        backgroundColor: '#eff6ff', // blue-50
        padding: 12,
        borderRadius: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937', // gray-800
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#6b7280', // gray-500
    },
    inactiveText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 8,
        textAlign: 'right'
    },
    errorBox: {
        backgroundColor: '#fef2f2',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center'
    }
});
