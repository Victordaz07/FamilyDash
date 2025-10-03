import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/SimpleAppNavigator';
import { initializeNotifications } from './src/services/notificationService';
import './src/locales/i18n'; // Initialize i18n

export default function App() {
  useEffect(() => {
    // Inicializar sistema de notificaciones al cargar la app
    initializeNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
