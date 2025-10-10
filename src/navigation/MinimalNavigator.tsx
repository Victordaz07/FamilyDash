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
            colors={['#EC4899', '#DB2777']}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* FamilyDash Official Icon */}
                <View style={styles.iconContainer}>
                    <Image
                        source={require('../../assets/icon.png')}
                        style={styles.logoImage}
                        contentFit="contain"
                    />
                </View>

                <Text style={styles.title}>FamilyDash</Text>
                <Text style={styles.subtitle}>Voice Module Ready!</Text>
                
                <View style={styles.features}>
                    <Text style={styles.featureText}>✅ Voice Recording</Text>
                    <Text style={styles.featureText}>✅ Audio Playback</Text>
                    <Text style={styles.featureText}>✅ Firebase Integration</Text>
                    <Text style={styles.featureText}>✅ Progress Bar</Text>
                </View>

                <TouchableOpacity style={styles.button}>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.buttonText}>System Ready</Text>
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
        width: 120,
        height: 120,
        marginBottom: 32,
        elevation: 15,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 24,
    },
    logoImage: {
        width: '80%',
        height: '80%',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 32,
        textAlign: 'center',
    },
    features: {
        marginBottom: 32,
    },
    featureText: {
        fontSize: 16,
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
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
