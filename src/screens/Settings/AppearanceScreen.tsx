import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Dimensions,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const { width } = Dimensions.get('window');

type ThemeMode = 'light' | 'dark' | 'auto';

interface ColorOption {
    name: string;
    value: string;
    gradient: string[];
}

interface FontSizeOption {
    label: string;
    size: number;
    description: string;
}

const colorOptions: ColorOption[] = [
    { name: 'Purple', value: '#667eea', gradient: ['#667eea', '#764ba2'] },
    { name: 'Blue', value: '#3b82f6', gradient: ['#3b82f6', '#1d4ed8'] },
    { name: 'Green', value: '#4ade80', gradient: ['#4ade80', '#22c55e'] },
    { name: 'Orange', value: '#f59e0b', gradient: ['#f59e0b', '#d97706'] },
    { name: 'Pink', value: '#ec4899', gradient: ['#ec4899', '#be185d'] },
    { name: 'Red', value: '#ef4444', gradient: ['#ef4444', '#dc2626'] },
];

const fontSizeOptions: FontSizeOption[] = [
    { label: 'Small', size: 14, description: 'Compact' },
    { label: 'Medium', size: 16, description: 'Default' },
    { label: 'Large', size: 18, description: 'Comfortable' },
    { label: 'Extra Large', size: 20, description: 'Easy to read' },
];

export default function AppearanceScreen() {
    const navigation = useNavigation();
    const systemColorScheme = useColorScheme();

    const [theme, setTheme] = useState<ThemeMode>('auto');
    const [accentColor, setAccentColor] = useState(colorOptions[0]);
    const [fontSize, setFontSize] = useState(fontSizeOptions[1]);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Load saved settings
    useEffect(() => {
        loadSettings();
    }, []);

    // Update dark mode when theme changes
    useEffect(() => {
        const darkMode = theme === 'dark' || (theme === 'auto' && systemColorScheme === 'dark');
        setIsDarkMode(darkMode);
    }, [theme, systemColorScheme]);

    const loadSettings = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('appearance_theme');
            const savedColor = await AsyncStorage.getItem('appearance_accent_color');
            const savedFontSize = await AsyncStorage.getItem('appearance_font_size');

            if (savedTheme) {
                setTheme(savedTheme as ThemeMode);
            }
            if (savedColor) {
                const color = colorOptions.find(c => c.value === savedColor);
                if (color) setAccentColor(color);
            }
            if (savedFontSize) {
                const size = fontSizeOptions.find(f => f.size === parseInt(savedFontSize));
                if (size) setFontSize(size);
            }
        } catch (error) {
            console.error('Error loading appearance settings:', error);
        }
    };

    const saveSettings = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error('Error saving appearance settings:', error);
        }
    };

    const handleThemeChange = (newTheme: ThemeMode) => {
        setTheme(newTheme);
        saveSettings('appearance_theme', newTheme);

        // Show feedback
        Alert.alert(
            'Theme Updated',
            `Theme changed to ${newTheme === 'auto' ? 'Auto (System)' : newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`,
            [{ text: 'OK' }]
        );
    };

    const handleColorChange = (color: ColorOption) => {
        setAccentColor(color);
        saveSettings('appearance_accent_color', color.value);

        Alert.alert(
            'Color Updated',
            `Accent color changed to ${color.name}`,
            [{ text: 'OK' }]
        );
    };

    const handleFontSizeChange = (size: FontSizeOption) => {
        setFontSize(size);
        saveSettings('appearance_font_size', size.size.toString());

        Alert.alert(
            'Text Size Updated',
            `Font size changed to ${size.label}`,
            [{ text: 'OK' }]
        );
    };

    const handlePreview = () => {
        Alert.alert(
            'Preview Mode',
            'This is how your text will look with the current settings.',
            [{ text: 'OK' }]
        );
    };

    const themeOptions = [
        { key: 'light' as ThemeMode, label: 'Light', icon: 'sunny', description: 'Always light theme' },
        { key: 'dark' as ThemeMode, label: 'Dark', icon: 'moon', description: 'Always dark theme' },
        { key: 'auto' as ThemeMode, label: 'Auto', icon: 'phone-portrait', description: 'Follow system' }
    ];

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
            {/* Header */}
            <LinearGradient
                colors={accentColor.gradient}
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
                <View style={[styles.sectionContainer, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
                    <View style={styles.sectionHeader}>
                        <LinearGradient
                            colors={accentColor.gradient}
                            style={styles.sectionIconContainer}
                        >
                            <Ionicons name="color-palette" size={24} color="white" />
                        </LinearGradient>
                        <View style={styles.sectionInfo}>
                            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#f1f5f9' : '#1e293b' }]}>
                                Theme
                            </Text>
                            <Text style={[styles.sectionDescription, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
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
                                    theme === option.key && styles.themeOptionSelected,
                                    { backgroundColor: isDarkMode ? '#334155' : '#f1f5f9' }
                                ]}
                                onPress={() => handleThemeChange(option.key)}
                            >
                                {theme === option.key && (
                                    <LinearGradient
                                        colors={accentColor.gradient}
                                        style={styles.themeOptionGradient}
                                    />
                                )}
                                <View style={styles.themeOptionContent}>
                                    <Ionicons
                                        name={option.icon as any}
                                        size={24}
                                        color={theme === option.key ? 'white' : (isDarkMode ? '#f1f5f9' : '#1e293b')}
                                    />
                                    <Text style={[
                                        styles.themeOptionLabel,
                                        { color: theme === option.key ? 'white' : (isDarkMode ? '#f1f5f9' : '#1e293b') }
                                    ]}>
                                        {option.label}
                                    </Text>
                                    <Text style={[
                                        styles.themeOptionDescription,
                                        { color: theme === option.key ? 'rgba(255,255,255,0.8)' : (isDarkMode ? '#94a3b8' : '#64748b') }
                                    ]}>
                                        {option.description}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Accent Color Selection */}
                <View style={[styles.sectionContainer, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
                    <View style={styles.sectionHeader}>
                        <LinearGradient
                            colors={accentColor.gradient}
                            style={styles.sectionIconContainer}
                        >
                            <Ionicons name="brush" size={24} color="white" />
                        </LinearGradient>
                        <View style={styles.sectionInfo}>
                            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#f1f5f9' : '#1e293b' }]}>
                                Accent Color
                            </Text>
                            <Text style={[styles.sectionDescription, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                                Choose your favorite color
                            </Text>
                        </View>
                    </View>

                    <View style={styles.colorGrid}>
                        {colorOptions.map((color) => (
                            <TouchableOpacity
                                key={color.value}
                                style={[
                                    styles.colorOption,
                                    accentColor.value === color.value && styles.colorOptionSelected
                                ]}
                                onPress={() => handleColorChange(color)}
                            >
                                <LinearGradient
                                    colors={color.gradient}
                                    style={styles.colorCircle}
                                />
                                <Text style={[
                                    styles.colorLabel,
                                    { color: isDarkMode ? '#f1f5f9' : '#1e293b' }
                                ]}>
                                    {color.name}
                                </Text>
                                {accentColor.value === color.value && (
                                    <View style={styles.selectedIndicator}>
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Text Size Selection */}
                <View style={[styles.sectionContainer, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
                    <View style={styles.sectionHeader}>
                        <LinearGradient
                            colors={accentColor.gradient}
                            style={styles.sectionIconContainer}
                        >
                            <Ionicons name="text" size={24} color="white" />
                        </LinearGradient>
                        <View style={styles.sectionInfo}>
                            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#f1f5f9' : '#1e293b' }]}>
                                Text Size
                            </Text>
                            <Text style={[styles.sectionDescription, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                                Adjust text size for better readability
                            </Text>
                        </View>
                    </View>

                    <View style={styles.fontSizeOptions}>
                        {fontSizeOptions.map((option) => (
                            <TouchableOpacity
                                key={option.size}
                                style={[
                                    styles.fontSizeOption,
                                    fontSize.size === option.size && styles.fontSizeOptionSelected,
                                    { backgroundColor: isDarkMode ? '#334155' : '#f1f5f9' }
                                ]}
                                onPress={() => handleFontSizeChange(option)}
                            >
                                {fontSize.size === option.size && (
                                    <LinearGradient
                                        colors={accentColor.gradient}
                                        style={styles.fontSizeOptionGradient}
                                    />
                                )}
                                <View style={styles.fontSizeOptionContent}>
                                    <Text style={[
                                        styles.fontSizePreview,
                                        {
                                            fontSize: option.size,
                                            color: fontSize.size === option.size ? 'white' : (isDarkMode ? '#f1f5f9' : '#1e293b')
                                        }
                                    ]}>
                                        Aa
                                    </Text>
                                    <Text style={[
                                        styles.fontSizeLabel,
                                        { color: fontSize.size === option.size ? 'white' : (isDarkMode ? '#f1f5f9' : '#1e293b') }
                                    ]}>
                                        {option.label}
                                    </Text>
                                    <Text style={[
                                        styles.fontSizeDescription,
                                        { color: fontSize.size === option.size ? 'rgba(255,255,255,0.8)' : (isDarkMode ? '#94a3b8' : '#64748b') }
                                    ]}>
                                        {option.description}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Preview Section */}
                <View style={[styles.sectionContainer, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
                    <View style={styles.sectionHeader}>
                        <LinearGradient
                            colors={accentColor.gradient}
                            style={styles.sectionIconContainer}
                        >
                            <Ionicons name="eye" size={24} color="white" />
                        </LinearGradient>
                        <View style={styles.sectionInfo}>
                            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#f1f5f9' : '#1e293b' }]}>
                                Preview
                            </Text>
                            <Text style={[styles.sectionDescription, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
                                See how your settings look
                            </Text>
                        </View>
                    </View>

                    <View style={styles.previewContainer}>
                        <LinearGradient
                            colors={accentColor.gradient}
                            style={styles.previewCard}
                        >
                            <Text style={[styles.previewTitle, { fontSize: fontSize.size + 2 }]}>
                                Family Dashboard
                            </Text>
                            <Text style={[styles.previewSubtitle, { fontSize: fontSize.size }]}>
                                Your family, connected
                            </Text>
                            <View style={styles.previewButtons}>
                                <View style={styles.previewButton}>
                                    <Text style={[styles.previewButtonText, { fontSize: fontSize.size - 2 }]}>
                                        Dashboard
                                    </Text>
                                </View>
                                <View style={styles.previewButton}>
                                    <Text style={[styles.previewButtonText, { fontSize: fontSize.size - 2 }]}>
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
                    onPress={() => {
                        Alert.alert(
                            'Reset Settings',
                            'Are you sure you want to reset all appearance settings to default?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Reset',
                                    style: 'destructive',
                                    onPress: () => {
                                        setTheme('auto');
                                        setAccentColor(colorOptions[0]);
                                        setFontSize(fontSizeOptions[1]);
                                        saveSettings('appearance_theme', 'auto');
                                        saveSettings('appearance_accent_color', colorOptions[0].value);
                                        saveSettings('appearance_font_size', fontSizeOptions[1].size.toString());
                                        Alert.alert('Reset Complete', 'All appearance settings have been reset to default.');
                                    }
                                }
                            ]
                        );
                    }}
                >
                    <LinearGradient
                        colors={['#ef4444', '#dc2626']}
                        style={styles.resetButtonGradient}
                    >
                        <Ionicons name="refresh" size={20} color="white" />
                        <Text style={styles.resetButtonText}>Reset to Default</Text>
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
