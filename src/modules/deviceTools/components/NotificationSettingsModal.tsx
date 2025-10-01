import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface NotificationSettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ visible, onClose }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
    const [emergencyBypass, setEmergencyBypass] = useState(true);
    const [taskReminders, setTaskReminders] = useState(true);
    const [penaltyAlerts, setPenaltyAlerts] = useState(true);
    const [activityReminders, setActivityReminders] = useState(true);
    const [goalUpdates, setGoalUpdates] = useState(false);
    const [safeRoomAlerts, setSafeRoomAlerts] = useState(true);

    const handleSaveSettings = () => {
        Alert.alert('Settings Saved', 'Your notification preferences have been updated');
        onClose();
    };

    const handleTestNotification = () => {
        Alert.alert('Test Notification', 'This would send a test notification to verify your settings');
    };

    const handleQuietHoursPress = () => {
        Alert.alert(
            'Quiet Hours',
            'Configure when notifications should be silenced',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Set Hours', onPress: () => Alert.alert('Coming Soon', 'Time picker will be implemented') }
            ]
        );
    };

    const SettingRow: React.FC<{
        title: string;
        subtitle?: string;
        icon: string;
        iconColor: string;
        value: boolean;
        onValueChange: (value: boolean) => void;
        onPress?: () => void;
    }> = ({ title, subtitle, icon, iconColor, value, onValueChange, onPress }) => (
        <TouchableOpacity
            style={styles.settingRow}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.settingRowLeft}>
                <View style={[styles.settingIcon, { backgroundColor: iconColor }]}>
                    <Ionicons name={icon as any} size={20} color="white" />
                </View>
                <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {onPress ? (
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            ) : (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                    thumbColor={value ? 'white' : '#9CA3AF'}
                />
            )}
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <LinearGradient
                    colors={['#F59E0B', '#EA580C']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
                                <Ionicons name="close" size={20} color="white" />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.headerTitle}>Notification Settings</Text>
                                <Text style={styles.headerSubtitle}>Manage your alerts and preferences</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Main Settings */}
                    <View style={styles.section}>
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="notifications" size={24} color="#F59E0B" />
                                <Text style={styles.sectionTitle}>General Notifications</Text>
                            </View>

                            <SettingRow
                                title="Enable Notifications"
                                subtitle="Receive push notifications from FamilyDash"
                                icon="notifications"
                                iconColor="#F59E0B"
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                            />

                            <SettingRow
                                title="Quiet Hours"
                                subtitle="10:00 PM - 07:00 AM"
                                icon="moon"
                                iconColor="#8B5CF6"
                                value={quietHoursEnabled}
                                onValueChange={setQuietHoursEnabled}
                                onPress={handleQuietHoursPress}
                            />

                            <SettingRow
                                title="Emergency Bypass"
                                subtitle="Allow emergency notifications during quiet hours"
                                icon="warning"
                                iconColor="#EF4444"
                                value={emergencyBypass}
                                onValueChange={setEmergencyBypass}
                            />
                        </View>
                    </View>

                    {/* Notification Types */}
                    <View style={styles.section}>
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="list" size={24} color="#3B82F6" />
                                <Text style={styles.sectionTitle}>Notification Types</Text>
                            </View>

                            <SettingRow
                                title="Task Reminders"
                                subtitle="Reminders for pending tasks and deadlines"
                                icon="checkmark-circle"
                                iconColor="#10B981"
                                value={taskReminders}
                                onValueChange={setTaskReminders}
                            />

                            <SettingRow
                                title="Penalty Alerts"
                                subtitle="Notifications about penalties and timeouts"
                                icon="hourglass"
                                iconColor="#EF4444"
                                value={penaltyAlerts}
                                onValueChange={setPenaltyAlerts}
                            />

                            <SettingRow
                                title="Activity Reminders"
                                subtitle="Reminders for family events and activities"
                                icon="calendar"
                                iconColor="#3B82F6"
                                value={activityReminders}
                                onValueChange={setActivityReminders}
                            />

                            <SettingRow
                                title="Goal Updates"
                                subtitle="Progress updates and achievements"
                                icon="trophy"
                                iconColor="#F59E0B"
                                value={goalUpdates}
                                onValueChange={setGoalUpdates}
                            />

                            <SettingRow
                                title="Safe Room Alerts"
                                subtitle="Notifications from family members"
                                icon="heart"
                                iconColor="#EC4899"
                                value={safeRoomAlerts}
                                onValueChange={setSafeRoomAlerts}
                            />
                        </View>
                    </View>

                    {/* Advanced Settings */}
                    <View style={styles.section}>
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="settings" size={24} color="#6B7280" />
                                <Text style={styles.sectionTitle}>Advanced Settings</Text>
                            </View>

                            <TouchableOpacity style={styles.actionButton} onPress={handleTestNotification}>
                                <View style={styles.actionButtonContent}>
                                    <Ionicons name="send" size={20} color="#3B82F6" />
                                    <Text style={styles.actionButtonText}>Send Test Notification</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton}>
                                <View style={styles.actionButtonContent}>
                                    <Ionicons name="volume-high" size={20} color="#10B981" />
                                    <Text style={styles.actionButtonText}>Notification Sounds</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton}>
                                <View style={styles.actionButtonContent}>
                                    <Ionicons name="vibrate" size={20} color="#8B5CF6" />
                                    <Text style={styles.actionButtonText}>Vibration Patterns</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Save Button */}
                    <View style={styles.section}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
                            <LinearGradient colors={['#10B981', '#059669']} style={styles.saveButtonGradient}>
                                <Ionicons name="checkmark" size={20} color="white" />
                                <Text style={styles.saveButtonText}>Save Settings</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom spacing */}
                    <View style={styles.bottomSpacing} />
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
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
    section: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    sectionCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 12,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    settingRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    actionButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        marginLeft: 12,
    },
    saveButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    saveButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default NotificationSettingsModal;
