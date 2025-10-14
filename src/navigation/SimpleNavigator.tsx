/**
 * Simple Navigator - Bypasses authentication for testing
 * Use this when Firebase auth is causing issues
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { createStackNavigator } from '@react-navigation/stack';
import SimpleAppNavigator from './SimpleAppNavigator';
import { theme } from '@/styles/simpleTheme';

const Stack = createStackNavigator();

const SimpleNavigator: React.FC = () => {
    // For now, always show the main app to bypass auth issues
    return <SimpleAppNavigator />;
};

export default SimpleNavigator;
