import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import ConditionalNavigator from './src/navigation/ConditionalNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { useFamilyDashStore } from './src/state/store';

function AppContent() {
  const { initializeApp } = useFamilyDashStore();

  useEffect(() => {
    // Initialize the main store when the app starts
    initializeApp();
  }, [initializeApp]);

  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <ConditionalNavigator />
      </SafeAreaProvider>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
