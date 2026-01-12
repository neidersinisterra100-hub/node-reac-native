import { View, FlatList, Alert, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Building2, CheckCircle2, AlertCircle } from "lucide-react-native";

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
import { colors } from "../theme/colors";

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
        activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
          {/* Icono de Empresa */}
          <View style={styles.iconBox}>
             <Building2 size={24} color={colors.primary} />
          </View>

          {/* Información Principal */}
          <View style={{flex: 1}}>
              <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  
                  {/* BADGE DE LEGALIDAD PROFESIONAL */}
                  <View style={[
                      styles.statusBadge, 
                      { backgroundColor: item.active ? '#dcfce7' : '#fee2e2' }
                  ]}>
                      {item.active ? (
                          <CheckCircle2 size={12} color="#166534" />
                      ) : (
                          <AlertCircle size={12} color="#991b1b" />
                      )}
                      <Text style={[
                          styles.statusText, 
                          { color: item.active ? '#166534' : '#991b1b' }
                      ]}>
                          {item.active ? 'Verificada' : 'Pendiente'}
                      </Text>
                  </View>
              </View>

              <Text style={styles.nitText}>NIT: {item.nit || 'Sin registrar'}</Text>
              
              {isOwner && (
                  <Text style={styles.balanceText}>
                      Balance: <Text style={{fontWeight: 'bold'}}>${item.balance?.toLocaleString() || '0'}</Text>
                  </Text>
              )}
          </View>
      </View>

      {/* Acciones (Solo Owner) */}
      {isOwner && (
          <View style={styles.actionsFooter}>
              <Text style={styles.actionLabel}>Acciones:</Text>
              <View style={styles.actionButtons}>
                  <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: item.active ? '#fef2f2' : '#f0fdf4' }]}
                      onPress={() => handleToggle(item._id, !!item.active)}
                  >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: item.active ? '#ef4444' : '#16a34a' }}>
                          {item.active ? 'Desactivar' : 'Activar'}
                      </Text>
                  </TouchableOpacity>

                  <IconButton
                      icon="delete-outline"
                      iconColor="#ef4444"
                      size={20}
                      style={{ margin: 0 }}
                      onPress={() => handleDelete(item._id)}
                  />
              </View>
          </View>
      )}
    </TouchableOpacity>
  );

  return (
    <AppContainer>
      <AppHeader
        title={isOwner ? "Mis Empresas" : "Empresas Disponibles"} // Cambiado "Navieras" a "Empresas"
        showBack={true}
        showAvatar={false}
      />

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
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      ) : (
        <FlatList
            data={isOwner ? companies : companies.filter(c => c.active)}
            keyExtractor={(item) => item._id}
            refreshing={loading}
            onRefresh={loadCompanies}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10, paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
            isOwner ? (
                <View style={{ marginBottom: 20 }}>
                    <PrimaryButton
                        label="Registrar Nueva Empresa" // Cambiado "Naviera" a "Empresa"
                        onPress={() => navigation.navigate("CreateCompany")}
                    />
                </View>
            ) : null
            }
            ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 40}}>
                <Text style={{color: '#6b7280'}}>No hay empresas registradas.</Text>       
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
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    cardInactive: {
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
    },
    cardContent: {
        padding: 16,
        flexDirection: 'row',
        gap: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#e0f2fe',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    nitText: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    balanceText: {
        fontSize: 13,
        color: '#0f172a',
    },
    actionsFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#f8fafc',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    actionLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    errorBox: {
        backgroundColor: '#fef2f2',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center'
    }
});
