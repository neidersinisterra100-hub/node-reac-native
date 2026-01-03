import { View, StyleSheet } from "react-native";
import AppContainer from "../../components/ui/AppContainer";
import AppHeader from "../../components/ui/AppHeader";
import Avatar from "../../components/ui/Avatar";
import ProfileItem from "../../components/ui/ProfileItem";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useAuth } from "../../context/AuthContext";
import { spacing } from "../../theme/spacing";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <AppContainer>
      <AppHeader title="Perfil" />

      <View style={styles.content}>
        {/* Avatar + nombre */}
        <View style={styles.header}>
          <Avatar name={user.name} />
        </View>

        {/* Info */}
        <ProfileItem label="Nombre" value={user.name} />
        <ProfileItem label="Email" value={user.email} />
        <ProfileItem label="Rol" value={user.role} />

        {/* Logout */}
        <PrimaryButton
          label="Cerrar sesión"
          onPress={logout}
        />
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
});

