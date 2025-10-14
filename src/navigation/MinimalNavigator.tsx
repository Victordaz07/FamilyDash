/**
 * Minimal Navigator - Simplest possible navigation setup
 * Use this when debugging navigation issues
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

const MinimalNavigator: React.FC = () => {
    return (
        <LinearGradient
            colors={['#FF8A00', '#FF6B35']}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* FamilyDash Official Icon */}
                <View style={styles.iconContainer}>
                    <Image
                        source={require('../../assets/brand/logo-256.png')}
                        style={styles.logoImage}
                        contentFit="contain"
                    />
                </View>

                <Text style={styles.title}>FamilyDash</Text>
                <Text style={styles.subtitle}>¡Sistema Listo!</Text>
                
                <View style={styles.features}>
                    <Text style={styles.featureText}>✅ Grabación de Voz</Text>
                    <Text style={styles.featureText}>✅ Reproducción de Audio</Text>
                    <Text style={styles.featureText}>✅ Integración Firebase</Text>
                    <Text style={styles.featureText}>✅ Barra de Progreso</Text>
                </View>

                <TouchableOpacity style={styles.button}>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.buttonText}>Sistema Listo</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 140,
        height: 140,
        marginBottom: 40,
        elevation: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 30,
    },
    logoImage: {
        width: '85%',
        height: '85%',
        borderRadius: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 20,
        color: 'rgba(255, 255, 255, 0.95)',
        marginBottom: 40,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    features: {
        marginBottom: 32,
    },
    featureText: {
        fontSize: 16,
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default MinimalNavigator;




