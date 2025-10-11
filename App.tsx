import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { FamilyProvider } from './src/contexts/FamilyContext';
import { RoleProvider } from './src/contexts/RoleContext';
import { AuthProvider } from './src/contexts/AuthContext';
import SimpleNavigator from './src/navigation/SimpleNavigator';
import { GlobalErrorBoundary } from './src/components/GlobalErrorBoundary';
import { initSentry } from './src/config/sentry';

// Initialize Sentry before app starts
initSentry();

export default function App() {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <FamilyProvider>
              <RoleProvider>
                <NavigationContainer>
                  <SafeAreaProvider>
                    <StatusBar style="light" />
                    <SimpleNavigator />
                  </SafeAreaProvider>
                </NavigationContainer>
              </RoleProvider>
            </FamilyProvider>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}
