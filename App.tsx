import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import ConditionalNavigator from './src/navigation/ConditionalNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { initializeNotifications } from './src/services/notificationService';
import './src/locales/i18n'; // Initialize i18n

export default function App() {
  useEffect(() => {
    // Inicializar sistema de notificaciones al cargar la app
    initializeNotifications();
  }, []);

  return (
    <NavigationContainer>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <ConditionalNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
