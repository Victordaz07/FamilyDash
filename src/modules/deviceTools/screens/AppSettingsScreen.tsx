import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AppSettingsScreenProps {
    navigation: any;
}

const AppSettingsScreen: React.FC<AppSettingsScreenProps> = ({ navigation }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [selectedAccentColor, setSelectedAccentColor] = useState('#3B82F6'); // Blue
    const [parentalPIN, setParentalPIN] = useState(false);
    const [language, setLanguage] = useState('es'); // Spanish
    const [notifications, setNotifications] = useState(true);
    const [soundEffects, setSoundEffects] = useState(true);
    const [hapticFeedback, setHapticFeedback] = useState(true);

    const accentColors = [
        { name: 'Blue', value: '#3B82F6', icon: '🔵' },
        { name: 'Green', value: '#10B981', icon: '🟢' },
        { name: 'Purple', value: '#8B5CF6', icon: '🟣' },
        { name: 'Pink', value: '#EC4899', icon: '🩷' },
        { name: 'Orange', value: '#F59E0B', icon: '🟠' },
    ];

    const languages = [
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
    ];

    const handleBack = () => {
        navigation.goBack();
    };

    const handleAccentColorChange = (color: string) => {
        setSelectedAccentColor(color);
        Alert.alert('🎨 Color Actualizado', 'El color de acento se ha cambiado exitosamente');
    };

    const handleLanguageChange = (langCode: string) => {
        setLanguage(langCode);
        Alert.alert('🌍 Idioma Cambiado', 'El idioma se ha actualizado. Reinicia la app para ver los cambios.');
    };

    const handleParentalPIN = () => {
        Alert.alert(
            '🔒 PIN Parental',
            '¿Quieres configurar un PIN para proteger la configuración?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Configurar',
                    onPress: () => {
                        Alert.prompt(
                            'Configurar PIN',
                            'Ingresa un PIN de 4 dígitos:',
                            [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                    text: 'Guardar',
                                    onPress: (pin?: string) => {
                                        if (pin && pin.length === 4) {
                                            setParentalPIN(true);
                                            Alert.alert('✅ PIN Configurado', 'El PIN parental ha sido configurado exitosamente');
                                        } else {
                                            Alert.alert('❌ Error', 'El PIN debe tener exactamente 4 dígitos');
                                        }
                                    }
                                }
                            ],
                            'plain-text',
                            '',
                            'numeric'
                        );
                    }
                }
            ]
        );
    };

    const handleResetSettings = () => {
        Alert.alert(
            '⚠️ Restablecer Configuración',
            '¿Estás seguro de que quieres restablecer todas las configuraciones a los valores predeterminados?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Restablecer',
                    style: 'destructive',
                    onPress: () => {
                        setDarkMode(false);
                        setSelectedAccentColor('#3B82F6');
                        setParentalPIN(false);
                        setLanguage('es');
                        setNotifications(true);
                        setSoundEffects(true);
                        setHapticFeedback(true);
                        Alert.alert('✅ Restablecido', 'Todas las configuraciones han sido restablecidas');
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, darkMode && styles.darkContainer]}>
            {/* Header */}
            <LinearGradient
                colors={[selectedAccentColor, selectedAccentColor + 'CC']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>Configuración de la App</Text>
                        <Text style={styles.headerSubtitle}>Personaliza tu experiencia</Text>
                    </View>
                    <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
                        <Ionicons name="refresh" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* App Settings Card */}
                <View style={[styles.settingsCard, darkMode && styles.darkCard]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIcon}>
                            <Ionicons name="settings" size={24} color="white" />
                        </View>
                        <View style={styles.cardText}>
                            <Text style={[styles.cardTitle, darkMode && styles.darkText]}>App Settings</Text>
                            <Text style={[styles.cardSubtitle, darkMode && styles.darkSubtext]}>
                                Theme, language, parental PIN
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Dark Mode */}
                <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
                    <View style={styles.settingLeft}>
                        <View style={styles.settingIcon}>
                            <Ionicons name="moon" size={20} color="#8B5CF6" />
                        </View>
                        <Text style={[styles.settingLabel, darkMode && styles.darkText]}>Dark Mode</Text>
                    </View>
                    <Switch
                        value={darkMode}
                        onValueChange={setDarkMode}
                        trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                        thumbColor={darkMode ? '#FFFFFF' : '#F3F4F6'}
                    />
                </View>

                {/* Accent Color */}
                <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
                    <View style={styles.settingLeft}>
                        <Text style={[styles.settingLabel, darkMode && styles.darkText]}>Accent Color</Text>
                    </View>
                    <View style={styles.colorSwatches}>
                        {accentColors.map((color) => (
                            <TouchableOpacity
                                key={color.value}
                                style={[
                                    styles.colorSwatch,
                                    { backgroundColor: color.value },
                                    selectedAccentColor === color.value && styles.selectedColorSwatch,
                                ]}
                                onPress={() => handleAccentColorChange(color.value)}
                            >
                                {selectedAccentColor === color.value && (
                                    <Ionicons name="checkmark" size={16} color="white" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Language */}
                <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
                    <View style={styles.settingLeft}>
                        <View style={styles.settingIcon}>
                            <Ionicons name="language" size={20} color="#3B82F6" />
                        </View>
                        <Text style={[styles.settingLabel, darkMode && styles.darkText]}>Language</Text>
                    </View>
                    <View style={styles.languageOptions}>
                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.languageOption,
                                    language === lang.code && styles.selectedLanguageOption,
                                ]}
                                onPress={() => handleLanguageChange(lang.code)}
                            >
                                <Text style={styles.languageFlag}>{lang.flag}</Text>
                                <Text style={[
                                    styles.languageName,
                                    language === lang.code && styles.selectedLanguageName,
                                    darkMode && styles.darkText
                                ]}>
                                    {lang.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Parental PIN */}
                <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
                    <View style={styles.settingLeft}>
                        <View style={styles.settingIcon}>
                            <Ionicons name="lock-closed" size={20} color="#EF4444" />
                        </View>
                        <Text style={[styles.settingLabel, darkMode && styles.darkText]}>Parental PIN</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.pinButton,
                            parentalPIN && styles.pinButtonActive,
                        ]}
                        onPress={handleParentalPIN}
                    >
                        <Text style={[
                            styles.pinButtonText,
                            parentalPIN && styles.pinButtonTextActive,
                        ]}>
                            {parentalPIN ? 'Configurado' : 'Configurar'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Notifications */}
                <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
                    <View style={styles.settingLeft}>
                        <View style={styles.settingIcon}>
                            <Ionicons name="notifications" size={20} color="#10B981" />
                        </View>
                        <Text style={[styles.settingLabel, darkMode && styles.darkText]}>Notifications</Text>
                    </View>
                    <Switch
                        value={notifications}
                        onValueChange={setNotifications}
                        trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                        thumbColor={notifications ? '#FFFFFF' : '#F3F4F6'}
                    />
                </View>

                {/* Sound Effects */}
                <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
                    <View style={styles.settingLeft}>
                        <View style={styles.settingIcon}>
                            <Ionicons name="volume-high" size={20} color="#F59E0B" />
                        </View>
                        <Text style={[styles.settingLabel, darkMode && styles.darkText]}>Sound Effects</Text>
                    </View>
                    <Switch
                        value={soundEffects}
                        onValueChange={setSoundEffects}
                        trackColor={{ false: '#E5E7EB', true: '#F59E0B' }}
                        thumbColor={soundEffects ? '#FFFFFF' : '#F3F4F6'}
                    />
                </View>

                {/* Haptic Feedback */}
                <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
                    <View style={styles.settingLeft}>
                        <View style={styles.settingIcon}>
                            <Ionicons name="phone-portrait" size={20} color="#EC4899" />
                        </View>
                        <Text style={[styles.settingLabel, darkMode && styles.darkText]}>Haptic Feedback</Text>
                    </View>
                    <Switch
                        value={hapticFeedback}
                        onValueChange={setHapticFeedback}
                        trackColor={{ false: '#E5E7EB', true: '#EC4899' }}
                        thumbColor={hapticFeedback ? '#FFFFFF' : '#F3F4F6'}
                    />
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    darkContainer: {
        backgroundColor: '#1F2937',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    resetButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    settingsCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    darkCard: {
        backgroundColor: '#374151',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#6B7280',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    darkText: {
        color: '#F9FAFB',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    darkSubtext: {
        color: '#9CA3AF',
    },
    settingItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    darkSettingItem: {
        backgroundColor: '#374151',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    colorSwatches: {
        flexDirection: 'row',
        gap: 8,
    },
    colorSwatch: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedColorSwatch: {
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    languageOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    selectedLanguageOption: {
        backgroundColor: '#3B82F6',
    },
    languageFlag: {
        fontSize: 16,
        marginRight: 6,
    },
    languageName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    selectedLanguageName: {
        color: 'white',
    },
    pinButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    pinButtonActive: {
        backgroundColor: '#EF4444',
    },
    pinButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    pinButtonTextActive: {
        color: 'white',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default AppSettingsScreen;




