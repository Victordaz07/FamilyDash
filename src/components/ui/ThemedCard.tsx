import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors, useThemeFonts, useThemeGradient } from '../../contexts/ThemeContext';

interface ThemedCardProps {
    title?: string;
    subtitle?: string;
    children?: React.ReactNode;
    style?: ViewStyle;
    titleStyle?: TextStyle;
    subtitleStyle?: TextStyle;
    gradient?: boolean;
    icon?: string;
}

export default function ThemedCard({
    title,
    subtitle,
    children,
    style,
    titleStyle,
    subtitleStyle,
    gradient = false,
    icon
}: ThemedCardProps) {
    const colors = useThemeColors();
    const fonts = useThemeFonts();
    const themeGradient = useThemeGradient();

    const cardStyle = [
        styles.card,
        { backgroundColor: colors.surface },
        style
    ];

    const content = (
        <View style={cardStyle}>
            {title && (
                <Text style={[
                    styles.title,
                    { color: colors.text, fontSize: fonts.h3 },
                    titleStyle
                ]}>
                    {title}
                </Text>
            )}
            {subtitle && (
                <Text style={[
                    styles.subtitle,
                    { color: colors.textSecondary, fontSize: fonts.body },
                    subtitleStyle
                ]}>
                    {subtitle}
                </Text>
            )}
            {children}
        </View>
    );

    if (gradient) {
        // Ensure gradient has at least 2 colors for LinearGradient
        const gradientColors = themeGradient.length >= 2
            ? themeGradient as [string, string, ...string[]]
            : ['#667eea', '#764ba2'] as [string, string];

        return (
            <LinearGradient
                colors={gradientColors}
                style={[styles.gradientCard, style]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {title && (
                    <Text style={[
                        styles.title,
                        { color: 'white', fontSize: fonts.h3 },
                        titleStyle
                    ]}>
                        {title}
                    </Text>
                )}
                {subtitle && (
                    <Text style={[
                        styles.subtitle,
                        { color: 'rgba(255,255,255,0.9)', fontSize: fonts.body },
                        subtitleStyle
                    ]}>
                        {subtitle}
                    </Text>
                )}
                {children}
            </LinearGradient>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gradientCard: {
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontWeight: '400',
        marginBottom: 12,
    },
});
