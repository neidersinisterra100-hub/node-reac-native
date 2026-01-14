import { View, Alert, TextInput as RNTextInput } from "react-native";
import { Text } from "react-native-paper";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

import AppContainer from "../components/ui/AppContainer";
import AppHeader from "../components/ui/AppHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

import { createCompany } from "../services/company.service";
import { useAuth } from "../context/AuthContext";

export default function CreateCompanyScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Nombre requerido", "Ingresa el nombre de la empresa");
      return;
    }

    if (!user || user.role.toLowerCase() !== "owner") {
      Alert.alert("Acceso restringido", "Solo los owners pueden crear empresas");
      return;
    }

    setLoading(true);

    try {
      await createCompany(name.trim());
      Alert.alert("Éxito", "Empresa creada correctamente");
      navigation.goBack();
    } catch (error: any) {
      console.log("Error create:", error);
      Alert.alert("Error", error?.message || "No se pudo crear la empresa");
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
      try {
          // Intenta conectar a la raíz (si backend tiene GET /) o health
          const res = await fetch('http://192.168.1.40:3000'); 
          Alert.alert("Conexión OK", `Status: ${res.status}`);
      } catch (err: any) {
          Alert.alert("Error Conexión", err.message);
      }
  };

  return (
    <AppContainer>
      <AppHeader title="Crear Empresa" />

      <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <Text className="text-gray-500 mb-2 font-medium">Nombre de la empresa</Text>

        <RNTextInput
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-gray-800 text-base"
            placeholder="Ej: Transportes Pacífico"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
        />

        <PrimaryButton
          label={loading ? "Creando..." : "Crear empresa"}
          onPress={handleCreate}
          disabled={loading}
        />

        <View className="mt-8 pt-4 border-t border-gray-100">
            <Text className="text-xs text-gray-400 text-center mb-2">Debug Tools</Text>
            <PrimaryButton
                label="Probar Conexión (192.168.1.40)"
                onPress={testConnection}
                variant="secondary"
            />
        </View>
      </View>
    </AppContainer>
  );
}
