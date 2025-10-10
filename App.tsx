import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import ConditionalNavigator from './src/navigation/ConditionalNavigator';
import SimpleNavigator from './src/navigation/SimpleNavigator';
import MinimalNavigator from './src/navigation/MinimalNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { FamilyProvider } from './src/contexts/FamilyContext';
import { RoleProvider } from './src/contexts/RoleContext';
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
        <RoleProvider>
          <SettingsProvider>
            <FamilyProvider>
              <AppContent />
            </FamilyProvider>
          </SettingsProvider>
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
