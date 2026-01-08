import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
}

export default function AppHeader({ title, showBack = true }: AppHeaderProps) {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-center py-4 mb-4">
      {showBack && navigation.canGoBack() && (
        <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="mr-3 p-2 bg-white rounded-full border border-gray-100 shadow-sm"
        >
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>
      )}
      <Text className="text-2xl font-bold text-gray-800 flex-1">{title}</Text>
    </View>
  );
}
