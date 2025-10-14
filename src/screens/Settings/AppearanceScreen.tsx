import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useThemeColors, useThemeFonts, useThemeGradient, colorThemes, fontSizeThemes } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function AppearanceScreen() {
    const navigation = useNavigation();
    const { theme, setThemeMode, setColorTheme, setFontSizeTheme, resetTheme } = useTheme();
    const colors = useThemeColors();
    const fonts = useThemeFonts();
    const themeGradient = useThemeGradient();

    // Ensure gradient has at least 2 colors for LinearGradient
    const gradient = themeGradient.length >= 2
        ? themeGradient as [string, string, ...string[]]
        : ['#667eea', '#764ba2'] as [string, string];

    const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
        await setThemeMode(newTheme);
        Alert.alert(
            'Theme Updated',
            `Theme changed to ${newTheme === 'auto' ? 'Auto (System)' : newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`,
            [{ text: 'OK' }]
        );
    };

    const handleColorChange = async (color: typeof colorThemes[0]) => {
        await setColorTheme(color);
        Alert.alert(
            'Color Updated',
            `Accent color changed to ${color.name}`,
            [{ text: 'OK' }]
        );
    };

    const handleFontSizeChange = async (size: typeof fontSizeThemes[0]) => {
        await setFontSizeTheme(size);
        Alert.alert(
            'Text Size Updated',
            `Font size changed to ${size.label}`,
            [{ text: 'OK' }]
        );
    };

    const handleReset = async () => {
        Alert.alert(
            'Reset Settings',
            'Are you sure you want to reset all appearance settings to default?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        await resetTheme();
                        Alert.alert('Reset Complete', 'All appearance settings have been reset to default.');
                    }
                }
            ]
        );
    };

    const themeOptions = [
        { key: 'light' as const, label: 'Light', icon: 'sunny', description: 'Always light theme' },
        { key: 'dark' as const, label: 'Dark', icon: 'moon', description: 'Always dark theme' },
        { key: 'auto' as const, label: 'Auto', icon: 'phone-portrait', description: 'Follow system' }
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={gradient}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Appearance</Text>
                        <Text style={styles.headerSubtitle}>Customize your experience</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Theme Selection */}
                <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
                    <View style={styles.sectionHeader}>
                        <LinearGradient
                            colors={gradient}
                            style={styles.sectionIconContainer}
                        >
                            <Ionicons name="color-palette" size={24} color="white" />
                        </LinearGradient>
                        <View style={styles.sectionInfo}>
                            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                                Theme
                            </Text>
                            <Text style={[styles.sectionDescription, { color: colors.textSecondary, fontSize: fonts.body }]}>
                                Choose your preferred theme
                            </Text>
                        </View>
                    </View>

                    <View style={styles.themeOptions}>
                        {themeOptions.map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    styles.themeOption,
                                    theme.mode === option.key && styles.themeOptionSelected,
                                    { backgroundColor: colors.border }
                                ]}
                                onPress={() => handleThemeChange(option.key)}
                            >
                                {theme.mode === option.key && (
                                    <LinearGradient
                                        colors={gradient}
                                        style={styles.themeOptionGradient}
                                    />
                                )}
                                <View style={styles.themeOptionContent}>
                                    <Ionicons
                                        name={option.icon as any}
                                        size={24}
                                        color={theme.mode === option.key ? 'white' : colors.text}
                                    />
                                    <Text style={[
                                        styles.themeOptionLabel,
                                        {
                                            color: theme.mode === option.key ? 'white' : colors.text,
                                            fontSize: fonts.body
                                        }
                                    ]}>
                                        {option.label}
                                    </Text>
                                    <Text style={[
                                        styles.themeOptionDescription,
                                        {
                                            color: theme.mode === option.key ? 'rgba(255,255,255,0.8)' : colors.textSecondary,
                                            fontSize: fonts.caption
                                        }
                                    ]}>
                                        {option.description}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Accent Color Selection */}
                <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
                    <View style={styles.sectionHeader}>
                        <LinearGradient
                            colors={gradient}
                            style={styles.sectionIconContainer}
                        >
                            <Ionicons name="brush" size={24} color="white" />
                        </LinearGradient>
                        <View style={styles.sectionInfo}>
                            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                                Accent Color
                            </Text>
                            <Text style={[styles.sectionDescription, { color: colors.textSecondary, fontSize: fonts.body }]}>
                                Choose your favorite color
                            </Text>
                        </View>
                    </View>

                    <View style={styles.colorGrid}>
                        {colorThemes.map((color) => (
                            <TouchableOpacity
                                key={color.value}
                                style={[
                                    styles.colorOption,
                                    theme.color.value === color.value && styles.colorOptionSelected
                                ]}
                                onPress={() => handleColorChange(color)}
                            >
                                <LinearGradient
                                    colors={color.gradient.length >= 2
                                        ? color.gradient as [string, string, ...string[]]
                                        : ['#667eea', '#764ba2'] as [string, string]}
                                    style={styles.colorCircle}
                                />
                                <Text style={[
                                    styles.colorLabel,
                                    { color: colors.text, fontSize: fonts.caption }
                                ]}>
                                    {color.name}
                                </Text>
                                {theme.color.value === color.value && (
                                    <View style={styles.selectedIndicator}>
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Text Size Selection */}
                <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
                    <View style={styles.sectionHeader}>
                        <LinearGradient
                            colors={gradient}
                            style={styles.sectionIconContainer}
                        >
                            <Ionicons name="text" size={24} color="white" />
                        </LinearGradient>
                        <View style={styles.sectionInfo}>
                            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                                Text Size
                            </Text>
                            <Text style={[styles.sectionDescription, { color: colors.textSecondary, fontSize: fonts.body }]}>
                                Adjust text size for better readability
                            </Text>
                        </View>
                    </View>

                    <View style={styles.fontSizeOptions}>
                        {fontSizeThemes.map((option) => (
                            <TouchableOpacity
                                key={option.size}
                                style={[
                                    styles.fontSizeOption,
                                    theme.fontSize.size === option.size && styles.fontSizeOptionSelected,
                                    { backgroundColor: colors.border }
                                ]}
                                onPress={() => handleFontSizeChange(option)}
                            >
                                {theme.fontSize.size === option.size && (
                                    <LinearGradient
                                        colors={gradient}
                                        style={styles.fontSizeOptionGradient}
                                    />
                                )}
                                <View style={styles.fontSizeOptionContent}>
                                    <Text style={[
                                        styles.fontSizePreview,
                                        {
                                            fontSize: option.size,
                                            color: theme.fontSize.size === option.size ? 'white' : colors.text
                                        }
                                    ]}>
                                        Aa
                                    </Text>
                                    <Text style={[
                                        styles.fontSizeLabel,
                                        {
                                            color: theme.fontSize.size === option.size ? 'white' : colors.text,
                                            fontSize: fonts.caption
                                        }
                                    ]}>
                                        {option.label}
                                    </Text>
                                    <Text style={[
                                        styles.fontSizeDescription,
                                        {
                                            color: theme.fontSize.size === option.size ? 'rgba(255,255,255,0.8)' : colors.textSecondary,
                                            fontSize: fonts.caption
                                        }
                                    ]}>
                                        {option.description}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Preview Section */}
                <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
                    <View style={styles.sectionHeader}>
                        <LinearGradient
                            colors={gradient}
                            style={styles.sectionIconContainer}
                        >
                            <Ionicons name="eye" size={24} color="white" />
                        </LinearGradient>
                        <View style={styles.sectionInfo}>
                            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                                Preview
                            </Text>
                            <Text style={[styles.sectionDescription, { color: colors.textSecondary, fontSize: fonts.body }]}>
                                See how your settings look
                            </Text>
                        </View>
                    </View>

                    <View style={styles.previewContainer}>
                        <LinearGradient
                            colors={gradient}
                            style={styles.previewCard}
                        >
                            <Text style={[styles.previewTitle, { fontSize: fonts.h2 }]}>
                                Family Dashboard
                            </Text>
                            <Text style={[styles.previewSubtitle, { fontSize: fonts.body }]}>
                                Your family, connected
                            </Text>
                            <View style={styles.previewButtons}>
                                <View style={styles.previewButton}>
                                    <Text style={[styles.previewButtonText, { fontSize: fonts.button }]}>
                                        Dashboard
                                    </Text>
                                </View>
                                <View style={styles.previewButton}>
                                    <Text style={[styles.previewButtonText, { fontSize: fonts.button }]}>
                                        Tasks
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                </View>

                {/* Reset Button */}
                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleReset}
                >
                    <LinearGradient
                        colors={[colors.error, colors.error]}
                        style={styles.resetButtonGradient}
                    >
                        <Ionicons name="refresh" size={20} color="white" />
                        <Text style={[styles.resetButtonText, { fontSize: fonts.button }]}>Reset to Default</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionContainer: {
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 16,
    },
    sectionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    sectionInfo: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    sectionDescription: {
        fontSize: 14,
    },
    themeOptions: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 12,
    },
    themeOption: {
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    themeOptionSelected: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    themeOptionGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    themeOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    themeOptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
        flex: 1,
    },
    themeOptionDescription: {
        fontSize: 12,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        paddingBottom: 20,
        justifyContent: 'space-between',
    },
    colorOption: {
        width: (width - 80) / 3,
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    colorOptionSelected: {
        transform: [{ scale: 1.1 }],
    },
    colorCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
    },
    colorLabel: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    selectedIndicator: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#22c55e',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    fontSizeOptions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 8,
    },
    fontSizeOption: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    fontSizeOptionSelected: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fontSizeOptionGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    fontSizeOptionContent: {
        alignItems: 'center',
        padding: 16,
    },
    fontSizePreview: {
        fontWeight: '700',
        marginBottom: 8,
    },
    fontSizeLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    fontSizeDescription: {
        fontSize: 10,
        textAlign: 'center',
    },
    previewContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    previewCard: {
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    previewTitle: {
        color: 'white',
        fontWeight: '700',
        marginBottom: 8,
    },
    previewSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
    },
    previewButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    previewButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    previewButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    resetButton: {
        marginTop: 20,
        marginBottom: 30,
    },
    resetButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    resetButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
});




