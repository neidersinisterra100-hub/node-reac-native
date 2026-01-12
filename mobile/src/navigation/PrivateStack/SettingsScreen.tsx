import {
  View,
  StyleSheet,
  BackHandler,
  Switch
} from "react-native";
import { Text, Appbar, List } from "react-native-paper";
import {
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { useCallback } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppContainer from "../../components/ui/AppContainer";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext"; // 👈 Import ThemeContext
import { isAdminOrOwner } from "../../utils/roles";

import { webTextFix } from "../../theme/webTextFix";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function SettingsScreen() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme(); // 👈 Use Theme
  const navigation = useNavigation<any>();

  const handleClose = () => {
    navigation.goBack();
  };

  const handleCreateCompany = () => {
    navigation.navigate("CreateCompany");
  };

  const handleMyCompanies = () => {
    navigation.navigate("MyCompanies");
  };

  const handleReports = () => {
      navigation.navigate("Reports");
  };

  /* ================= ANDROID BACK HANDLER ================= */
  useFocusEffect(
    useCallback(() => {
      const subscription =
        BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            handleClose();
            return true;
          }
        );

      return () => subscription.remove();
    }, [])
  );

  /* ================= ACCESS CONTROL ================= */

  if (!isAdminOrOwner(user)) {
    return (
      <AppContainer>
        <Appbar.Header style={styles.header}>
          <Appbar.Content
            title="Configuración"
            titleStyle={styles.headerTitle}
          />
          <Appbar.Action
            icon="close"
            onPress={handleClose}
            color={colors.textPrimary}
          />
        </Appbar.Header>

        <View style={styles.center}>
          <Text style={[typography.body, styles.bodyText]}>
            No tienes permisos para acceder a esta sección.
          </Text>
        </View>
      </AppContainer>
    );
  }

  /* ================= RENDER ================= */

  return (
    <AppContainer>
      <Appbar.Header style={styles.header}>
        <Appbar.Content
          title="Configuración"
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action
          icon="close"
          onPress={handleClose}
          color={colors.textPrimary}
        />
      </Appbar.Header>

      <View style={styles.container}>
        <Text style={[typography.title, styles.sectionTitle]}>
          General
        </Text>

        {/* ===== APARIENCIA ===== */}
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={styles.rowLeft}>
                    <MaterialCommunityIcons name="theme-light-dark" size={24} color={colors.primary} />
                    <Text style={[styles.itemText, { marginLeft: 12 }]}>Modo Oscuro</Text>
                </View>
                <Switch 
                    value={isDark} 
                    onValueChange={toggleTheme} 
                    trackColor={{ false: "#767577", true: colors.primary }}
                    thumbColor={isDark ? "#fff" : "#f4f3f4"}
                />
            </View>
        </View>

        {/* ===== REPORTES ===== */}
        <View style={styles.card}>
            <Text style={[typography.body, styles.bodyText, { marginBottom: 12 }]}>
                Reportes y Métricas
            </Text>
            <PrimaryButton
                label="Ver Reportes"
                onPress={handleReports}
            />
        </View>

        {/* ===== GESTIÓN DE EMPRESAS ===== */}
        <View style={styles.card}>
          <Text style={[typography.body, styles.bodyText]}>
            Gestión
          </Text>

          <PrimaryButton
            label="Crear empresa"
            onPress={handleCreateCompany}
          />

          <PrimaryButton
            label="Mis empresas"
            // variant="secondary"
            onPress={handleMyCompanies}
          />
        </View>

        {/* ===== INFO ===== */}
        <View style={styles.card}>
          <Text style={[typography.body, styles.bodyText]}>
            Aquí podrás configurar:
          </Text>

          <Text style={styles.item}>• Empresas</Text>
          <Text style={styles.item}>• Rutas</Text>
          <Text style={styles.item}>• Vehículos</Text>
          <Text style={styles.item}>• Usuarios</Text>
        </View>
      </View>
    </AppContainer>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  container: {
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    ...webTextFix,
  },
  bodyText: {
    color: colors.textPrimary,
    ...webTextFix,
  },
  card: {
    marginTop: spacing.md,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  item: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontWeight: "500",
    ...webTextFix,
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  itemText: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: "500",
      ...webTextFix,
  }
});
