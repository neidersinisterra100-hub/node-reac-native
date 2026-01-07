import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

import { 
  getMyCompanies, 
  getAllCompanies, 
  createCompany, 
  toggleCompanyActive, 
  deleteCompany, 
  Company 
} from "../services/company.service";
import { useAuth } from "../context/AuthContext";

import { spacing } from "../theme/spacing";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

export default function MyCompaniesScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const isOwner = user?.role === "owner" || user?.role === "admin";

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */

  const loadCompanies = async () => {
    try {
      setLoading(true);
      let data: Company[] = [];
      
      if (isOwner) {
          data = await getMyCompanies();
      } else {
          // Si es user normal, intentamos traer publicas
          data = await getAllCompanies();
      }
      setCompanies(data);
    } catch (error: any) {
      console.log("Error loading companies:", error);
      // No mostramos alerta intrusiva si falla por 404 (endpoint no existe)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [user]);

  /* ================= ACTIONS ================= */

  const handleToggle = async (id: string, currentStatus: boolean) => {
      try {
          await toggleCompanyActive(id, !currentStatus);
          setCompanies(prev => prev.map(c => c._id === id ? { ...c, active: !currentStatus } : c));
      } catch (error) {
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
                      } catch (error) {
                          Alert.alert("Error", "No se pudo eliminar");
                      }
                  }
              }
          ]
      );
  };

  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }: { item: Company }) => (
    <TouchableOpacity 
        style={[styles.card, !item.active && isOwner && styles.cardInactive]}
        onPress={() => navigation.navigate("CompanyRoutes", {
            companyId: item._id,
            companyName: item.name,
        })}
    >
      <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
             <IconButton icon="domain" iconColor={colors.primary} size={24} />
          </View>
          <View style={{flex: 1}}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>Balance: ${item.balance}</Text>
          </View>
          
          {/* ACCIONES OWNER */}
          {isOwner && (
              <View style={styles.actions}>
                  <IconButton 
                      icon="power" 
                      iconColor={item.active ? colors.success : colors.textSecondary} 
                      size={20}
                      onPress={() => handleToggle(item._id, !!item.active)}
                  />
                  <IconButton 
                      icon="delete-outline" 
                      iconColor={colors.error} 
                      size={20}
                      onPress={() => handleDelete(item._id)}
                  />
              </View>
          )}
      </View>
      
      {!item.active && !isOwner && (
          <Text style={styles.inactiveLabel}>Inactiva</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <AppContainer>
      <AppHeader title={isOwner ? "Mis Empresas" : "Empresas Disponibles"} />

      <View style={styles.container}>
        <FlatList
          data={companies}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={loadCompanies}
          contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isOwner ? (
                <View style={{ marginBottom: spacing.md }}>
                    <PrimaryButton
                    label="Nueva Empresa"
                    onPress={() => navigation.navigate("CreateCompany")}
                    />
                </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.emptyText}>
                {isOwner ? "Comienza creando tu primera empresa." : "No hay empresas disponibles."}
              </Text>
            ) : null
          }
          renderItem={renderItem}
        />
      </View>
    </AppContainer>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardInactive: {
      opacity: 0.7,
      borderColor: colors.textSecondary,
  },
  cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
  },
  iconContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      width: 48,
      height: 48,
      justifyContent: "center",
      alignItems: "center",
  },
  cardTitle: {
      ...typography.header,
      fontSize: 18,
      color: colors.textPrimary,
  },
  cardSubtitle: {
      ...typography.body,
      color: colors.textSecondary,
      fontSize: 14,
  },
  actions: {
      flexDirection: "row",
  },
  emptyText: {
    marginTop: spacing.lg,
    color: colors.textSecondary,
    textAlign: "center",
    ...typography.body,
  },
  inactiveLabel: {
      color: colors.error,
      fontSize: 12,
      fontWeight: "bold",
      marginTop: 8,
      textAlign: "right"
  }
});
