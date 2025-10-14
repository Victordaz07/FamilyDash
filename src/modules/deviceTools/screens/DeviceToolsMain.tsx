import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import NotificationSettingsModal from '@/components/NotificationSettingsModal';

const { width: screenWidth } = Dimensions.get('window');

interface DeviceToolsMainProps {
    navigation: any;
}

interface FamilyMember {
    id: string;
    name: string;
    role: 'parent' | 'child';
    avatar: string;
    age?: number;
    isOnline: boolean;
    status: string;
}

interface QuickActionButtonProps {
    title: string;
    icon: string;
    onPress: () => void;
    gradient: [string, string];
    rightElement?: React.ReactNode;
}

interface SettingCardProps {
    title: string;
    subtitle: string;
    icon: string;
    onPress: () => void;
    color?: string;
    rightElement?: React.ReactNode;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ title, icon, onPress, gradient, rightElement }) => (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
        <LinearGradient colors={gradient} style={styles.quickActionGradient}>
            <Ionicons name={icon as any} size={24} color="white" />
            <Text style={styles.quickActionText}>{title}</Text>
            {rightElement}
        </LinearGradient>
    </TouchableOpacity>
);

const SettingCard: React.FC<SettingCardProps> = ({ title, subtitle, icon, onPress, color = '#8B5CF6', rightElement }) => (
    <TouchableOpacity style={styles.settingCard} onPress={onPress}>
        <View style={styles.settingCardHeader}>
            <View style={[styles.settingIcon, { backgroundColor: color }]}>
                <Ionicons name={icon as any} size={20} color="white" />
            </View>
            <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingSubtitle}>{subtitle}</Text>
            </View>
            {rightElement}
        </View>
    </TouchableOpacity>
);

const DeviceToolsMain: React.FC<DeviceToolsMainProps> = ({ navigation }) => {
    const [muteAlerts, setMuteAlerts] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [selectedAccentColor, setSelectedAccentColor] = useState('blue');
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [toggleAnimation] = useState(new Animated.Value(notificationsEnabled ? 1 : 0));
    const [viewMode, setViewMode] = useState('grid'); // grid, list, compact
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const cardsAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Cards animation with delay
        Animated.timing(cardsAnim, {
            toValue: 1,
            duration: 1200,
            delay: 300,
            useNativeDriver: true,
        }).start();

        // Pulse animation for emergency buttons
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseAnimation.start();

        return () => {
            pulseAnimation.stop();
        };
    }, []);

    // Mock family members data
    const familyMembers: FamilyMember[] = [
        { id: '1', name: 'Dad', role: 'parent', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', isOnline: true, status: 'Online' },
        { id: '2', name: 'Mom', role: 'parent', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg', isOnline: true, status: 'Online' },
        { id: '3', name: 'Ariella', role: 'child', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', age: 12, isOnline: true, status: '12 years' },
        { id: '4', name: 'Noah', role: 'child', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', age: 8, isOnline: false, status: '8 years' },
    ];

    const accentColors = [
        { name: 'blue', color: '#3B82F6' },
        { name: 'green', color: '#10B981' },
        { name: 'purple', color: '#8B5CF6' },
        { name: 'pink', color: '#EC4899' },
        { name: 'orange', color: '#F59E0B' },
    ];

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSettings = () => {
        Alert.alert('Settings', 'Advanced settings coming soon!');
    };

    const handleMuteAlerts = () => {
        setMuteAlerts(!muteAlerts);
        Alert.alert('Alerts', muteAlerts ? 'Alerts enabled' : 'Alerts muted');
    };

    const handlePanicAlert = () => {
        Alert.alert('🚨 Panic Alert', 'Emergency notification sent to all family members!');
    };

    const handleRingAll = () => {
        Alert.alert('🔊 Ring All', 'Ringing all family devices...');
    };

    const handleFlashAlert = () => {
        Alert.alert('⚡ Flash Alert', 'Flashing all device torches...');
    };

    const handleRingMember = (memberName: string) => {
        Alert.alert('📱 Ring Device', `Ringing ${memberName}'s device...`);
    };

    const handleFamilyManagement = () => {
        Alert.alert('Family Management', 'Family management screen coming soon!');
    };

    const handleNotificationSettings = () => {
        setShowNotificationModal(true);
    };

    const handleNotificationToggle = () => {
        setNotificationsEnabled(prevState => {
            const newState = !prevState;

            // Animate the toggle
            Animated.timing(toggleAnimation, {
                toValue: newState ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }).start();

            return newState;
        });

        // Show alert
        Alert.alert(
            'Notifications',
            !notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled',
            [
                { text: 'OK', style: 'default' },
                {
                    text: 'Advanced Settings',
                    onPress: () => setShowNotificationModal(true),
                    style: 'default'
                }
            ]
        );
    };

    const handleWidgets = () => {
        navigation.navigate('AndroidWidgets');
    };

    const handleWidgetDemo = () => {
        navigation.navigate('WidgetDemo');
    };

    const handleEmergencyTools = () => {
        Alert.alert('Emergency Tools', 'Emergency tools configuration coming soon!');
    };

    const handleAppSettings = () => {
        navigation.navigate('AppSettings');
    };

    const handleDataBackup = () => {
        Alert.alert('Data & Backup', 'Backup and data management coming soon!');
    };

    const handleBackupToCloud = () => {
        Alert.alert('☁️ Backup', 'Backing up data to cloud...');
    };

    const handleExportData = () => {
        Alert.alert('📄 Export', 'Exporting data as PDF...');
    };

    const getStatusColor = (member: FamilyMember) => {
        if (member.isOnline) return '#10B981';
        return '#6B7280';
    };

    const getMemberCardColor = (index: number) => {
        const colors = ['#F0FDF4', '#FDF2F8', '#FAF5FF', '#EFF6FF'];
        return colors[index % colors.length];
    };

    const getMemberBorderColor = (index: number) => {
        const colors = ['#10B981', '#EC4899', '#8B5CF6', '#3B82F6'];
        return colors[index % colors.length];
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ]
                }
            ]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                                <Ionicons name="arrow-back" size={20} color="white" />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.headerTitle}>Device Tools 📱</Text>
                                <Text style={styles.headerSubtitle}>Family Control Center</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.headerButton} onPress={handleSettings}>
                            <Ionicons name="settings" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Quick Actions */}
                <Animated.View
                    style={[
                        styles.quickActionsSection,
                        {
                            opacity: cardsAnim,
                            transform: [{
                                translateY: cardsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0]
                                })
                            }]
                        }
                    ]}
                >
                    <View style={styles.quickActionsGrid}>
                        <QuickActionButton
                            title="Mute Alerts"
                            icon="notifications-off"
                            onPress={handleMuteAlerts}
                            gradient={['#F59E0B', '#EA580C']}
                            rightElement={
                                <View style={styles.toggleSwitch}>
                                    <View style={[styles.toggleSlider, { transform: [{ translateX: muteAlerts ? 16 : 0 }] }]} />
                                </View>
                            }
                        />
                        <QuickActionButton
                            title="Panic Alert"
                            icon="warning"
                            onPress={handlePanicAlert}
                            gradient={['#EF4444', '#DC2626']}
                            rightElement={<View style={styles.pulseDot} />}
                        />
                        <QuickActionButton
                            title="Ring All"
                            icon="volume-high"
                            onPress={handleRingAll}
                            gradient={['#3B82F6', '#2563EB']}
                            rightElement={
                                <View style={styles.dotsContainer}>
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                </View>
                            }
                        />
                        <QuickActionButton
                            title="Flash Alert"
                            icon="flash"
                            onPress={handleFlashAlert}
                            gradient={['#8B5CF6', '#EC4899']}
                            rightElement={<View style={styles.pingDot} />}
                        />
                    </View>
                </Animated.View>

                {/* Family Management */}
                <Animated.View
                    style={[
                        styles.section,
                        {
                            opacity: cardsAnim,
                            transform: [{
                                translateY: cardsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0]
                                })
                            }]
                        }
                    ]}
                >
                    <SettingCard
                        title="Family Management"
                        subtitle="Manage members, roles, and devices"
                        icon="people"
                        onPress={handleFamilyManagement}
                        color="#3B82F6"
                    />
                    <View style={styles.familyGrid}>
                        {familyMembers.map((member, index) => (
                            <Animated.View
                                key={member.id}
                                style={[
                                    styles.memberCard,
                                    {
                                        backgroundColor: getMemberCardColor(index),
                                        borderColor: getMemberBorderColor(index),
                                        transform: [{
                                            translateY: cardsAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [20, 0]
                                            })
                                        }]
                                    }
                                ]}
                            >
                                <View style={styles.memberHeader}>
                                    <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(member) }]} />
                                </View>
                                <Text style={styles.memberName}>{member.name}</Text>
                                <Text style={styles.memberStatus}>{member.status}</Text>
                                <TouchableOpacity
                                    style={[styles.ringButton, { backgroundColor: member.isOnline ? '#3B82F6' : '#6B7280' }]}
                                    onPress={() => handleRingMember(member.name)}
                                >
                                    <Text style={styles.ringButtonText}>{member.isOnline ? 'Ring' : 'Offline'}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Notification Settings */}
                <Animated.View
                    style={[
                        styles.section,
                        {
                            opacity: cardsAnim,
                            transform: [{
                                translateY: cardsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0]
                                })
                            }]
                        }
                    ]}
                >
                    <SettingCard
                        title="Notification Settings"
                        subtitle="Push alerts, quiet hours, emergency bypass"
                        icon="notifications"
                        onPress={handleNotificationSettings}
                        color="#F59E0B"
                        rightElement={
                            <TouchableOpacity
                                style={[styles.toggleSwitch, { backgroundColor: notificationsEnabled ? '#10B981' : '#6B7280' }]}
                                onPress={handleNotificationToggle}
                                activeOpacity={0.8}
                            >
                                <Animated.View
                                    style={[
                                        styles.toggleSlider,
                                        {
                                            transform: [{
                                                translateX: toggleAnimation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 24]
                                                })
                                            }]
                                        }
                                    ]}
                                />
                            </TouchableOpacity>
                        }
                    />
                    <View style={styles.quietHoursCard}>
                        <View style={styles.quietHoursContent}>
                            <Ionicons name="moon" size={16} color="#8B5CF6" />
                            <Text style={styles.quietHoursText}>Quiet Hours</Text>
                        </View>
                        <Text style={styles.quietHoursTime}>10:00 PM – 07:00 AM</Text>
                    </View>
                </Animated.View>

                {/* Widgets */}
                <Animated.View
                    style={[
                        styles.section,
                        {
                            opacity: cardsAnim,
                            transform: [{
                                translateY: cardsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0]
                                })
                            }]
                        }
                    ]}
                >
                    <SettingCard
                        title="Widgets"
                        subtitle="Home screen widgets"
                        icon="grid"
                        onPress={handleWidgets}
                        color="#10B981"
                    />
                    <View style={styles.widgetPreview}>
                        <View style={styles.widgetHeader}>
                            <Ionicons name="calendar" size={16} color="#10B981" />
                            <Text style={styles.widgetTitle}>Family Calendar</Text>
                            <View style={styles.widgetBadge}>
                                <Text style={styles.widgetBadgeText}>4x2</Text>
                            </View>
                        </View>
                        <View style={styles.widgetContent}>
                            <View style={styles.widgetItem}>
                                <View style={styles.widgetDot} />
                                <Text style={styles.widgetItemText}>Movie Night • Tonight 7PM</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.addWidgetButton} onPress={handleWidgetDemo}>
                            <Text style={styles.addWidgetButtonText}>Try Widget Demo</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Emergency Tools */}
                <Animated.View
                    style={[
                        styles.section,
                        {
                            opacity: cardsAnim,
                            transform: [{
                                translateY: cardsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0]
                                })
                            }]
                        }
                    ]}
                >
                    <SettingCard
                        title="Emergency Tools"
                        subtitle="Alerts and device tools"
                        icon="warning"
                        onPress={handleEmergencyTools}
                        color="#EF4444"
                    />
                    <View style={styles.emergencyGrid}>
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <TouchableOpacity style={styles.emergencyButton} onPress={handlePanicAlert}>
                                <Ionicons name="warning" size={20} color="#EF4444" />
                                <Text style={styles.emergencyButtonText}>Panic</Text>
                            </TouchableOpacity>
                        </Animated.View>
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <TouchableOpacity style={styles.emergencyButton} onPress={handleRingAll}>
                                <Ionicons name="notifications" size={20} color="#3B82F6" />
                                <Text style={styles.emergencyButtonText}>Ring All</Text>
                            </TouchableOpacity>
                        </Animated.View>
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <TouchableOpacity style={styles.emergencyButton}>
                                <Ionicons name="chatbubble" size={20} color="#10B981" />
                                <Text style={styles.emergencyButtonText}>Quick SMS</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                    <View style={styles.quickMessageCard}>
                        <Text style={styles.quickMessageLabel}>Quick Message:</Text>
                        <Text style={styles.quickMessageText}>"Come to living room"</Text>
                    </View>
                </Animated.View>

                {/* App Settings */}
                <Animated.View
                    style={[
                        styles.section,
                        {
                            opacity: cardsAnim,
                            transform: [{
                                translateY: cardsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0]
                                })
                            }]
                        }
                    ]}
                >
                    <SettingCard
                        title="App Settings"
                        subtitle="Theme, language, parental PIN"
                        icon="settings"
                        onPress={handleAppSettings}
                        color="#6B7280"
                    />
                    <View style={styles.settingsContent}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingRowLeft}>
                                <Ionicons name="moon" size={16} color="#8B5CF6" />
                                <Text style={styles.settingRowText}>Dark Mode</Text>
                            </View>
                            <View style={[styles.toggleSwitch, { backgroundColor: darkMode ? '#10B981' : '#6B7280' }]}>
                                <View style={[styles.toggleSlider, { transform: [{ translateX: darkMode ? 16 : 0 }] }]} />
                            </View>
                        </View>
                        <View style={styles.settingRow}>
                            <Text style={styles.settingRowText}>Accent Color</Text>
                            <View style={styles.colorPicker}>
                                {accentColors.map((color) => (
                                    <TouchableOpacity
                                        key={color.name}
                                        style={[
                                            styles.colorSwatch,
                                            { backgroundColor: color.color },
                                            selectedAccentColor === color.name && styles.selectedColorSwatch
                                        ]}
                                        onPress={() => setSelectedAccentColor(color.name)}
                                    />
                                ))}
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Data & Backup */}
                <Animated.View
                    style={[
                        styles.section,
                        {
                            opacity: cardsAnim,
                            transform: [{
                                translateY: cardsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0]
                                })
                            }]
                        }
                    ]}
                >
                    <SettingCard
                        title="Data & Backup"
                        subtitle="Backup, export, restore"
                        icon="cloud"
                        onPress={handleDataBackup}
                        color="#6366F1"
                    />
                    <View style={styles.backupContent}>
                        <TouchableOpacity style={styles.backupButton} onPress={handleBackupToCloud}>
                            <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.backupButtonGradient}>
                                <Ionicons name="cloud-upload" size={20} color="white" />
                                <Text style={styles.backupButtonText}>Backup to Cloud</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.backupButton} onPress={handleExportData}>
                            <LinearGradient colors={['#10B981', '#059669']} style={styles.backupButtonGradient}>
                                <Ionicons name="document-text" size={20} color="white" />
                                <Text style={styles.backupButtonText}>Export Data (PDF)</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <View style={styles.lastBackupCard}>
                            <Text style={styles.lastBackupLabel}>Last backup:</Text>
                            <Text style={styles.lastBackupTime}>2 hours ago</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Bottom spacing for navigation */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Notification Settings Modal */}
            <NotificationSettingsModal
                visible={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 32,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginTop: -16,
        marginBottom: 8,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionButton: {
        width: '48%',
    },
    quickActionGradient: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
    },
    toggleSwitch: {
        width: 48,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        paddingHorizontal: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    toggleSlider: {
        width: 20,
        height: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    pulseDot: {
        width: 12,
        height: 12,
        backgroundColor: 'white',
        borderRadius: 6,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    dot: {
        width: 4,
        height: 4,
        backgroundColor: 'white',
        borderRadius: 2,
    },
    pingDot: {
        width: 12,
        height: 12,
        backgroundColor: 'white',
        borderRadius: 6,
    },
    section: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    settingCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 12,
    },
    settingCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    familyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    memberCard: {
        width: '48%',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
    },
    memberHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    memberAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    memberName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    memberStatus: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 8,
    },
    ringButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
    },
    ringButtonText: {
        fontSize: 10,
        fontWeight: '500',
        color: 'white',
    },
    quietHoursCard: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quietHoursContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quietHoursText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    quietHoursTime: {
        fontSize: 14,
        color: '#6B7280',
    },
    widgetPreview: {
        backgroundColor: '#F0FDF4',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#10B981',
    },
    widgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    widgetTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        flex: 1,
        marginLeft: 8,
    },
    widgetBadge: {
        backgroundColor: 'white',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    widgetBadgeText: {
        fontSize: 10,
        color: '#6B7280',
    },
    widgetContent: {
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    widgetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    widgetDot: {
        width: 8,
        height: 8,
        backgroundColor: '#3B82F6',
        borderRadius: 4,
    },
    widgetItemText: {
        fontSize: 12,
        color: '#374151',
    },
    addWidgetButton: {
        backgroundColor: '#10B981',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    addWidgetButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'white',
    },
    emergencyGrid: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    emergencyButton: {
        flex: 1,
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FECACA',
        alignItems: 'center',
    },
    emergencyButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#374151',
        marginTop: 4,
    },
    quickMessageCard: {
        backgroundColor: '#FFFBEB',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FDE68A',
    },
    quickMessageLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    quickMessageText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    settingsContent: {
        gap: 12,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingRowText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    colorPicker: {
        flexDirection: 'row',
        gap: 8,
    },
    colorSwatch: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedColorSwatch: {
        borderColor: '#374151',
    },
    backupContent: {
        gap: 12,
    },
    backupButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    backupButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        gap: 8,
    },
    backupButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'white',
    },
    lastBackupCard: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastBackupLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    lastBackupTime: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default DeviceToolsMain;




