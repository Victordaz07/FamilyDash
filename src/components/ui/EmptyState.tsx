import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface EmptyStateProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    motivationalMessage: string;
    buttonText?: string;
    onButtonPress?: () => void;
    gradientColors?: string[];
    iconColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    subtitle,
    motivationalMessage,
    buttonText,
    onButtonPress,
    gradientColors = ['#667eea', '#764ba2'] as const,
    iconColor = '#667eea'
}) => {
    return (
        <View style={styles.container}>
            {/* Icon with gradient background */}
            <View style={styles.iconContainer}>
                <LinearGradient
                    colors={gradientColors}
                    style={styles.gradientCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name={icon} size={48} color="white" />
                </LinearGradient>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>

                {/* Motivational message */}
                <View style={styles.motivationalContainer}>
                    <Text style={styles.motivationalText}>{motivationalMessage}</Text>
                </View>

                {/* Action button */}
                {buttonText && onButtonPress && (
                    <TouchableOpacity style={styles.button} onPress={onButtonPress}>
                        <LinearGradient
                            colors={gradientColors}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>{buttonText}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
    },
    iconContainer: {
        marginBottom: 24,
    },
    gradientCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#667eea',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    contentContainer: {
        alignItems: 'center',
        maxWidth: 280,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 22,
    },
    motivationalContainer: {
        backgroundColor: '#f8f9ff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#667eea',
    },
    motivationalText: {
        fontSize: 14,
        color: '#4a5568',
        textAlign: 'center',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    button: {
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonGradient: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 25,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default EmptyState;
