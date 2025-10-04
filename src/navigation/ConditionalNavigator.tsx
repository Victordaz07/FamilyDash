/**
 * Conditional Navigator
 * Shows Login screen when not authenticated, main app when authenticated
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import SimpleAppNavigator from './SimpleAppNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../styles/simpleTheme';

const ConditionalNavigator: React.FC = () => {
    const { user, loading } = useAuth();

    // Show loading screen while checking auth state
    if (loading) {
        return (
            <LinearGradient
                colors={[theme.colors.background, theme.colors.gradientEnd]}
                style={styles.loadingContainer}
            >
                <View style={styles.loadingContent}>
                    {/* FamilyDash Official Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.logoImage}
              contentFit="contain"
            />
          </View>

                    <Text style={styles.loadingText}>FamilyDash</Text>
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                        style={styles.spinner}
                    />
                    <Text style={styles.loadingSubtext}>Loading...</Text>
                </View>
            </LinearGradient>
        );
    }

    // Show Login screen when not authenticated  
    if (!user) {
        return <LoginScreen navigation={undefined} />;
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
        width: 100,
        height: 100,
        marginBottom: 32,
        elevation: 15,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    loadingText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 16,
    },
    spinner: {
        marginBottom: 16,
    },
    loadingSubtext: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    // FAMILYDASH LOGO STYLES
    shieldOuter: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    shieldBody: {
        width: 65,
        height: 50,
        backgroundColor: 'white',
        borderRadius: 8,
        position: 'relative',
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    shieldTop: {
        position: 'absolute',
        top: 0,
        left: 25,
        width: 0,
        height: 0,
        borderLeftWidth: 7,
        borderRightWidth: 7,
        borderBottomWidth: 12,
        borderStyle: 'solid',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'white',
    },
    familyGroup: {
        position: 'relative',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    adult1: {
        position: 'absolute',
        top: 8,
        left: 8,
        alignItems: 'center',
    },
    head1: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
        marginBottom: 2,
    },
    body1: {
        width: 12,
        height: 16,
        backgroundColor: 'white',
        borderRadius: 2,
    },
    adult2: {
        position: 'absolute',
        top: 8,
        right: 8,
        alignItems: 'center',
    },
    head2: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
        marginBottom: 2,
    },
    body2: {
        width: 12,
        height: 16,
        backgroundColor: 'white',
        borderRadius: 2,
    },
    childFigure: {
        position: 'absolute',
        top: 15,
        left: 25,
        alignItems: 'center',
    },
    childHead: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'white',
        marginBottom: 2,
    },
    childBody: {
        width: 10,
        height: 12,
        backgroundColor: 'white',
        borderRadius: 2,
    },
    familyDashText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginTop: 8,
        letterSpacing: 0.5,
    },
});

export default ConditionalNavigator;
