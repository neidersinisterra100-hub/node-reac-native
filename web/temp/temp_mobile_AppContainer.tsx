import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface AppContainerProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export default function AppContainer({ children, noPadding = false }: AppContainerProps) {
  return (
    <SafeAreaView className="flex-1 bg-dashboard-bg">
      <StatusBar style="dark" backgroundColor="#f8fafc" />
      <View className={`flex-1 ${noPadding ? '' : 'p-4'}`}>
        {children}
      </View>
    </SafeAreaView>
  );
}
