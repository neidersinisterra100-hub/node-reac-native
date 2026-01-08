import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "../../theme/colors";

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  neon?: boolean; // Mantenemos la prop por compatibilidad, pero el estilo será sutil
  hideLogo?: boolean;
}

export default function AppHeader({ title, showBack = true, neon = false }: AppHeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {showBack && navigation.canGoBack() && (
        <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
        >
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>
      )}
      
      <Text 
        style={styles.title}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        marginBottom: 16,
    },
    backButton: {
        marginRight: 12,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: '400', // 👈 SIN NEGRITA (Normal)
        color: colors.primary, // Navy
        flex: 1,
        letterSpacing: 0.5,
    }
});
