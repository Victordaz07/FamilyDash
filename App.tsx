import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import SimpleAppNavigator from './src/navigation/SimpleAppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SimpleAppNavigator />
      </SafeAreaProvider>
    </NavigationContainer>
  );
}
