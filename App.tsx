/**
 * 🚀 FAMILYDASH APP - ROBUST ARCHITECTURE
 * Centralized configuration with error boundaries and lazy loading
 */

import React, { useEffect, Suspense } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';

// Centralized imports using absolute paths
import ErrorBoundary from '@/components/ErrorBoundary';
import ConditionalNavigator from '@/navigation/ConditionalNavigator';
import { preloadCriticalComponents } from '@/utils/lazyLoading';
import { startTasksSync } from '@/services/tasksSync';
import { analytics } from '@/analytics/events';

// Initialize Firebase configuration (centralized)
import '@/services/firebase';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Loading component for Suspense
const AppLoading = () => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  }}>
    <ActivityIndicator size="large" color="#3B82F6" />
  </View>
);

export default function App() {
  useEffect(() => {
    // Preload critical components on app start
    preloadCriticalComponents().catch(console.warn);
    
    // Start Firestore sync for tasks
    const stopSync = startTasksSync();
    
    // Emit login_day event for streak tracking
    analytics.loginDay();
    
    return () => { if (stopSync) stopSync(); };
  }, []);

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <SafeAreaProvider>
          <Suspense fallback={<AppLoading />}>
            <StatusBar style="light" />
            <ConditionalNavigator />
          </Suspense>
        </SafeAreaProvider>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
