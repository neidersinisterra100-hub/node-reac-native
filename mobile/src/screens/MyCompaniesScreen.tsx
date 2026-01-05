import { View, StyleSheet, FlatList, Alert } from "react-native";
import { Text } from "react-native-paper";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import ListItem from "../components/ui/ListItem";

import { getMyCompanies, Company } from "../services/company.service";
import { useAuth } from "../context/AuthContext";

import { spacing } from "../theme/spacing";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

export default function MyCompaniesScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getMyCompanies();
      setCompanies(data);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "No se pudieron cargar las empresas"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  /* ================= GUARD ================= */

  if (!user || user.role !== "owner") {
    return (
      <AppContainer>
        <AppHeader title="Mis empresas" />
        <View style={styles.center}>
          <Text style={typography.body}>
            No tienes permisos para ver esta sección
          </Text>
        </View>
      </AppContainer>
    );
  }

  /* ================= RENDER ================= */

  return (
    <AppContainer>
      <AppHeader title="Mis empresas" />

      <View style={styles.container}>
        <PrimaryButton
          label="Crear empresa"
          onPress={() => navigation.navigate("CreateCompany")}
        />

        <FlatList
          data={companies}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={loadCompanies}
          contentContainerStyle={{ marginTop: spacing.lg }}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.emptyText}>
                Aún no tienes empresas creadas
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <ListItem
                title={item.name}
                subtitle={`Balance: $${item.balance}`}
              />

              <PrimaryButton
                label="Gestionar rutas"
                onPress={() =>
                  navigation.navigate("CompanyRoutes", {
                    companyId: item._id,
                    companyName: item.name,
                  })
                }
              />
            </View>
          )}
        />
      </View>
    </AppContainer>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  emptyText: {
    marginTop: spacing.lg,
    color: colors.textSecondary,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
});
