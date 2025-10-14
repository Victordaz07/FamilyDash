/**
 * Conditional Navigator
 * Shows Login screen when not authenticated, main app when authenticated
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { createStackNavigator } from '@react-navigation/stack';
import SimpleAppNavigator from './SimpleAppNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import { useAuth } from '@/store';
import { theme } from '@/styles/simpleTheme';

const AuthStack = createStackNavigator();

const ConditionalNavigator: React.FC = () => {
    const { user, isLoading } = useAuth();
    
    // Show loading screen while checking auth state
    if (isLoading) {
        return (
            <LinearGradient
                colors={['#FF8A00', '#FF6B35']}
                style={styles.loadingContainer}
            >
                <View style={styles.loadingContent}>
                    {/* FamilyDash Official Icon */}
                    <View style={styles.iconContainer}>
                        <Image
                            source={require('../../assets/brand/logo-256.png')}
                            style={styles.logoImage}
                            contentFit="contain"
                        />
                    </View>

                    <Text style={styles.loadingText}>FamilyDash</Text>
                    <ActivityIndicator
                        size="large"
                        color="#FFFFFF"
                        style={styles.spinner}
                    />
                    <Text style={styles.loadingSubtext}>
                        Cargando...
                    </Text>
                </View>
            </LinearGradient>
        );
    }

    // Show Auth screens (Login/Register) when not authenticated  
    if (!user) {
        return (
            <AuthStack.Navigator
                screenOptions={{ headerShown: false }}
            >
                <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
                <AuthStack.Screen name="RegisterScreen" component={RegisterScreen} />
                <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            </AuthStack.Navigator>
        );
    }

    // Show main app when authenticated
    return <SimpleAppNavigator />;
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContent: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        marginBottom: 40,
        elevation: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
    },
    logoImage: {
        width: '90%',
        height: '90%',
        borderRadius: 15,
    },
    loadingText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    spinner: {
        marginBottom: 16,
    },
    loadingSubtext: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});

export default ConditionalNavigator;
