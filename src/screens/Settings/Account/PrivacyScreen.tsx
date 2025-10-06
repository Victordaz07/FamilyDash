import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Switch,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface PrivacySettings {
    dataSharing: boolean;
    notifications: boolean;
    locationTracking: boolean;
    analytics: boolean;
    parentalControl: boolean;
    biometricAuth: boolean;
    dataExport: boolean;
    accountDeletion: boolean;
}

interface PrivacySection {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    settings: {
        key: keyof PrivacySettings;
        label: string;
        description: string;
        type: 'switch' | 'action';
        action?: () => void;
    }[];
}

export default function PrivacyScreen() {
    const navigation = useNavigation();

    const [settings, setSettings] = useState<PrivacySettings>({
        dataSharing: true,
        notifications: true,
        locationTracking: false,
        analytics: true,
        parentalControl: false,
        biometricAuth: false,
        dataExport: false,
        accountDeletion: false,
    });

    const [lastBackup, setLastBackup] = useState<string>('Never');

    const privacySections: PrivacySection[] = [
        {
            title: 'Data & Privacy',
            description: 'Control how your data is collected and used',
            icon: 'shield-checkmark',
            settings: [
                {
                    key: 'dataSharing',
                    label: 'Allow Data Sync',
                    description: 'Sync your family data across devices',
                    type: 'switch'
                },
                {
                    key: 'analytics',
                    label: 'Analytics & Usage',
                    description: 'Help improve FamilyDash by sharing usage data',
                    type: 'switch'
                },
                {
                    key: 'locationTracking',
                    label: 'Location Tracking',
                    description: 'Allow location-based features',
                    type: 'switch'
                }
            ]
        },
        {
            title: 'Security',
            description: 'Manage your account security settings',
            icon: 'lock-closed',
            settings: [
                {
                    key: 'biometricAuth',
                    label: 'Biometric Authentication',
                    description: 'Use fingerprint or face recognition',
                    type: 'switch'
                },
                {
                    key: 'parentalControl',
                    label: 'Parental Controls',
                    description: 'Restrict access to certain features',
                    type: 'switch'
                }
            ]
        },
        {
            title: 'Notifications',
            description: 'Control when and how you receive notifications',
            icon: 'notifications',
            settings: [
                {
                    key: 'notifications',
                    label: 'Push Notifications',
                    description: 'Receive notifications about family activities',
                    type: 'switch'
                }
            ]
        },
        {
            title: 'Data Management',
            description: 'Manage your personal data and account',
            icon: 'folder-open',
            settings: [
                {
                    key: 'dataExport',
                    label: 'Export Data',
                    description: 'Download a copy of your family data',
                    type: 'action',
                    action: () => handleDataExport()
                }
            ]
        }
    ];

    const handleSettingChange = (key: keyof PrivacySettings, value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));

        // Show confirmation for critical settings
        if (key === 'dataSharing' && !value) {
            Alert.alert(
                'Disable Data Sync',
                'Disabling data sync will prevent your family data from syncing across devices. Are you sure?',
                [
                    { text: 'Cancel', onPress: () => setSettings(prev => ({ ...prev, [key]: true })) },
                    { text: 'Disable', style: 'destructive' }
                ]
            );
        }

        if (key === 'parentalControl' && value) {
            Alert.alert(
                'Enable Parental Controls',
                'Parental controls will restrict access to certain features. You can configure restrictions in the next step.',
                [
                    { text: 'Cancel', onPress: () => setSettings(prev => ({ ...prev, [key]: false })) },
                    { text: 'Continue', onPress: () => { } }
                ]
            );
        }
    };

    const handleDataExport = () => {
        Alert.alert(
            'Export Data',
            'Your family data will be prepared for download. This may take a few minutes.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Export',
                    onPress: () => {
                        // Simulate data export
                        setLastBackup(new Date().toLocaleString());
                        Alert.alert('Success', 'Your data has been exported successfully!');
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. All your family data will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Final Confirmation',
                            'Type "DELETE" to confirm account deletion',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete Account', style: 'destructive' }
                            ]
                        );
                    }
                }
            ]
        );
    };

    const handlePrivacyPolicy = () => {
        const url = 'https://familydash.app/privacy';
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Could not open privacy policy');
        });
    };

    const handleTermsOfService = () => {
        const url = 'https://familydash.app/terms';
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Could not open terms of service');
        });
    };

    const renderSettingItem = (setting: PrivacySection['settings'][0]) => {
        if (setting.type === 'switch') {
            return (
                <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>{setting.label}</Text>
                        <Text style={styles.settingDescription}>{setting.description}</Text>
                    </View>
                    <Switch
                        value={settings[setting.key]}
                        onValueChange={(value) => handleSettingChange(setting.key, value)}
                        trackColor={{ false: '#e2e8f0', true: '#667eea' }}
                        thumbColor={settings[setting.key] ? '#ffffff' : '#f4f3f4'}
                    />
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={styles.settingItem}
                onPress={setting.action}
            >
                <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>{setting.label}</Text>
                    <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
        );
    };

    const renderSection = (section: PrivacySection) => (
        <View key={section.title} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.sectionIconContainer}
                >
                    <Ionicons name={section.icon} size={24} color="white" />
                </LinearGradient>
                <View style={styles.sectionInfo}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionDescription}>{section.description}</Text>
                </View>
            </View>

            <View style={styles.settingsContainer}>
                {section.settings.map((setting, index) => (
                    <View key={setting.key}>
                        {renderSettingItem(setting)}
                        {index < section.settings.length - 1 && <View style={styles.separator} />}
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
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
                        <Text style={styles.headerTitle}>Privacy & Security</Text>
                        <Text style={styles.headerSubtitle}>Manage your privacy settings</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Privacy Overview */}
                <View style={styles.overviewContainer}>
                    <View style={styles.overviewItem}>
                        <Ionicons name="shield-checkmark" size={24} color="#22c55e" />
                        <Text style={styles.overviewText}>Your data is encrypted</Text>
                    </View>
                    <View style={styles.overviewItem}>
                        <Ionicons name="cloud" size={24} color="#3b82f6" />
                        <Text style={styles.overviewText}>Last backup: {lastBackup}</Text>
                    </View>
                </View>

                {/* Privacy Sections */}
                {privacySections.map(renderSection)}

                {/* Legal Links */}
                <View style={styles.legalContainer}>
                    <Text style={styles.legalTitle}>Legal</Text>
                    <TouchableOpacity style={styles.legalItem} onPress={handlePrivacyPolicy}>
                        <View style={styles.legalItemContent}>
                            <Ionicons name="document-text" size={20} color="#667eea" />
                            <Text style={styles.legalItemText}>Privacy Policy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.legalItem} onPress={handleTermsOfService}>
                        <View style={styles.legalItemContent}>
                            <Ionicons name="document" size={20} color="#667eea" />
                            <Text style={styles.legalItemText}>Terms of Service</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {/* Danger Zone */}
                <View style={styles.dangerContainer}>
                    <Text style={styles.dangerTitle}>Danger Zone</Text>
                    <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
                        <LinearGradient
                            colors={['#ef4444', '#dc2626']}
                            style={styles.dangerButtonGradient}
                        >
                            <Ionicons name="trash" size={20} color="white" />
                            <Text style={styles.dangerButtonText}>Delete Account</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
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
    overviewContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    overviewItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    overviewText: {
        fontSize: 12,
        color: '#64748b',
        marginLeft: 8,
        fontWeight: '500',
    },
    sectionContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 20,
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
        color: '#1e293b',
        marginBottom: 4,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#64748b',
    },
    settingsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        color: '#64748b',
    },
    separator: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginLeft: 0,
    },
    legalContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    legalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    legalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    legalItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    legalItemText: {
        fontSize: 16,
        color: '#1e293b',
        marginLeft: 12,
        fontWeight: '500',
    },
    dangerContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dangerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ef4444',
        marginBottom: 16,
    },
    dangerButton: {
        marginBottom: 8,
    },
    dangerButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    dangerButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
});
