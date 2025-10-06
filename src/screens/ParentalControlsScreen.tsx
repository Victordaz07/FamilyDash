/**
 * Parental Controls Screen
 * Comprehensive family supervision interface
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Switch,
    Modal,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ParentalControlsManager, {
    ParentalControlSettings,
    ParentalDashboard,
    ViolationReport,
    DailyReport
} from '../services/parental/ParentalControlsManager';

interface ParentalControlsScreenProps {
    navigation: any;
}

const ParentalControlsScreen: React.FC<ParentalControlsScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [dashboard, setDashboard] = useState<ParentalDashboard | null>(null);
    const [selectedChild, setSelectedChild] = useState<string | null>(null);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showViolationsModal, setShowViolationsModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [violations, setViolations] = useState<ViolationReport[]>([]);
    const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
    const [settings, setSettings] = useState<ParentalControlSettings | null>(null);
    const [loading, setLoading] = useState(false);

    const parentalManager = ParentalControlsManager.getInstance();

    useEffect(() => {
        initializeParentalControls();
    }, []);

    const initializeParentalControls = async () => {
        try {
            setLoading(true);
            await parentalManager.initialize();
            await loadDashboard();
        } catch (error) {
            console.error('Error initializing parental controls:', error);
            Alert.alert('Error', 'Failed to initialize parental controls');
        } finally {
            setLoading(false);
        }
    };

    const loadDashboard = async () => {
        try {
            const dashboardData = await parentalManager.getParentalDashboard();
            setDashboard(dashboardData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    };

    const loadChildSettings = async (childId: string) => {
        try {
            const childSettings = await parentalManager.getParentalSettings(childId);
            setSettings(childSettings);
            setSelectedChild(childId);
        } catch (error) {
            console.error('Error loading child settings:', error);
        }
    };

    const loadViolations = async (childId: string) => {
        try {
            const childViolations = await parentalManager.getViolations(childId, true);
            setViolations(childViolations);
        } catch (error) {
            console.error('Error loading violations:', error);
        }
    };

    const loadDailyReport = async (childId: string) => {
        try {
            const report = await parentalManager.generateDailyReport(childId);
            setDailyReport(report);
        } catch (error) {
            console.error('Error loading daily report:', error);
        }
    };

    const updateSettings = async (updatedSettings: Partial<ParentalControlSettings>) => {
        if (!selectedChild) return;

        try {
            await parentalManager.setParentalSettings(selectedChild, updatedSettings);
            setSettings({ ...settings!, ...updatedSettings });
            Alert.alert('Success', 'Settings updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update settings');
        }
    };

    const resolveViolation = async (violationId: string) => {
        Alert.prompt(
            'Resolve Violation',
            'Enter resolution notes:',
            async (resolution) => {
                if (resolution) {
                    try {
                        await parentalManager.resolveViolation(violationId, resolution);
                        await loadViolations(selectedChild!);
                        Alert.alert('Success', 'Violation resolved');
                    } catch (error) {
                        Alert.alert('Error', 'Failed to resolve violation');
                    }
                }
            }
        );
    };

    const triggerEmergency = async (childId: string, type: 'panic' | 'location' | 'help') => {
        Alert.alert(
            'Emergency Alert',
            `Are you sure you want to trigger ${type} emergency for this child?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await parentalManager.triggerEmergency(childId, type);
                            Alert.alert('Emergency Sent', 'Emergency alert has been sent to parents');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to send emergency alert');
                        }
                    },
                },
            ]
        );
    };

    const ChildCard = ({ child }: { child: any }) => (
        <TouchableOpacity
            style={styles.childCard}
            onPress={() => {
                loadChildSettings(child.id);
                setShowSettingsModal(true);
            }}
        >
            <View style={styles.childHeader}>
                <View style={styles.childInfo}>
                    <View style={[
                        styles.statusIndicator,
                        { backgroundColor: child.onlineStatus ? '#10B981' : '#EF4444' }
                    ]} />
                    <Text style={styles.childName}>{child.name}</Text>
                </View>
                <View style={styles.childActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            loadViolations(child.id);
                            setShowViolationsModal(true);
                        }}
                    >
                        <Ionicons name="warning" size={16} color="#F59E0B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            loadDailyReport(child.id);
                            setShowReportModal(true);
                        }}
                    >
                        <Ionicons name="document-text" size={16} color="#3B82F6" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.childStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{Math.round(child.screenTimeToday)}m</Text>
                    <Text style={styles.statLabel}>Screen Time</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{child.violationsToday}</Text>
                    <Text style={styles.statLabel}>Violations</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{child.achievementsToday}</Text>
                    <Text style={styles.statLabel}>Achievements</Text>
                </View>
            </View>

            <Text style={styles.currentActivity}>
                Current: {child.currentActivity}
            </Text>
        </TouchableOpacity>
    );

    const SettingsModal = () => (
        <Modal
            visible={showSettingsModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Parental Controls</Text>
                    <TouchableOpacity
                        onPress={() => setShowSettingsModal(false)}
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {settings && (
                    <ScrollView style={styles.modalContent}>
                        {/* Time Limits */}
                        <View style={styles.modalSection}>
                            <Text style={styles.sectionTitle}>Time Limits</Text>

                            <View style={styles.settingRow}>
                                <Text style={styles.settingLabel}>Daily Limit (minutes)</Text>
                                <TextInput
                                    style={styles.numberInput}
                                    value={settings.timeLimits.dailyLimit.toString()}
                                    onChangeText={(text) => updateSettings({
                                        timeLimits: { ...settings.timeLimits, dailyLimit: parseInt(text) || 0 }
                                    })}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.settingRow}>
                                <Text style={styles.settingLabel}>Bedtime Start</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={settings.timeLimits.bedtimeStart}
                                    onChangeText={(text) => updateSettings({
                                        timeLimits: { ...settings.timeLimits, bedtimeStart: text }
                                    })}
                                    placeholder="HH:MM"
                                />
                            </View>

                            <View style={styles.settingRow}>
                                <Text style={styles.settingLabel}>Bedtime End</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={settings.timeLimits.bedtimeEnd}
                                    onChangeText={(text) => updateSettings({
                                        timeLimits: { ...settings.timeLimits, bedtimeEnd: text }
                                    })}
                                    placeholder="HH:MM"
                                />
                            </View>
                        </View>

                        {/* Content Filtering */}
                        <View style={styles.modalSection}>
                            <Text style={styles.sectionTitle}>Content Filtering</Text>

                            {Object.entries(settings.contentFiltering).map(([key, value]) => (
                                <View key={key} style={styles.settingRow}>
                                    <Text style={styles.settingLabel}>
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </Text>
                                    <Switch
                                        value={value}
                                        onValueChange={(newValue) => updateSettings({
                                            contentFiltering: { ...settings.contentFiltering, [key]: newValue }
                                        })}
                                        trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                        thumbColor="#FFFFFF"
                                    />
                                </View>
                            ))}
                        </View>

                        {/* Activity Monitoring */}
                        <View style={styles.modalSection}>
                            <Text style={styles.sectionTitle}>Activity Monitoring</Text>

                            {Object.entries(settings.activityMonitoring).map(([key, value]) => (
                                <View key={key} style={styles.settingRow}>
                                    <Text style={styles.settingLabel}>
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </Text>
                                    <Switch
                                        value={value}
                                        onValueChange={(newValue) => updateSettings({
                                            activityMonitoring: { ...settings.activityMonitoring, [key]: newValue }
                                        })}
                                        trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                        thumbColor="#FFFFFF"
                                    />
                                </View>
                            ))}
                        </View>

                        {/* Emergency Settings */}
                        <View style={styles.modalSection}>
                            <Text style={styles.sectionTitle}>Emergency Settings</Text>

                            <View style={styles.settingRow}>
                                <Text style={styles.settingLabel}>Panic Button</Text>
                                <Switch
                                    value={settings.emergencySettings.panicButtonEnabled}
                                    onValueChange={(value) => updateSettings({
                                        emergencySettings: { ...settings.emergencySettings, panicButtonEnabled: value }
                                    })}
                                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>

                            <View style={styles.settingRow}>
                                <Text style={styles.settingLabel}>Location Sharing</Text>
                                <Switch
                                    value={settings.emergencySettings.locationSharing}
                                    onValueChange={(value) => updateSettings({
                                        emergencySettings: { ...settings.emergencySettings, locationSharing: value }
                                    })}
                                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                        </View>
                    </ScrollView>
                )}

                <View style={styles.modalFooter}>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.emergencyButton]}
                        onPress={() => {
                            setShowSettingsModal(false);
                            triggerEmergency(selectedChild!, 'panic');
                        }}
                    >
                        <Ionicons name="warning" size={20} color="white" />
                        <Text style={styles.modalButtonText}>Emergency Alert</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const ViolationsModal = () => (
        <Modal
            visible={showViolationsModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Violations</Text>
                    <TouchableOpacity
                        onPress={() => setShowViolationsModal(false)}
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    {violations.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                            <Text style={styles.emptyStateTitle}>No Violations</Text>
                            <Text style={styles.emptyStateText}>
                                This child has no unresolved violations.
                            </Text>
                        </View>
                    ) : (
                        violations.map((violation) => (
                            <View key={violation.id} style={styles.violationCard}>
                                <View style={styles.violationHeader}>
                                    <View style={[
                                        styles.severityIndicator,
                                        { backgroundColor: getSeverityColor(violation.severity) }
                                    ]} />
                                    <Text style={styles.violationType}>{violation.violationType}</Text>
                                    <Text style={styles.violationTime}>
                                        {new Date(violation.timestamp).toLocaleDateString()}
                                    </Text>
                                </View>

                                <Text style={styles.violationDescription}>
                                    {violation.description}
                                </Text>

                                <TouchableOpacity
                                    style={styles.resolveButton}
                                    onPress={() => resolveViolation(violation.id)}
                                >
                                    <Ionicons name="checkmark" size={16} color="white" />
                                    <Text style={styles.resolveButtonText}>Resolve</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </Modal>
    );

    const ReportModal = () => (
        <Modal
            visible={showReportModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Daily Report</Text>
                    <TouchableOpacity
                        onPress={() => setShowReportModal(false)}
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {dailyReport && (
                    <ScrollView style={styles.modalContent}>
                        <View style={styles.reportCard}>
                            <Text style={styles.reportDate}>
                                {new Date(dailyReport.date).toLocaleDateString()}
                            </Text>

                            <View style={styles.reportSummary}>
                                <Text style={styles.reportTitle}>Summary</Text>
                                <View style={styles.summaryGrid}>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryValue}>{dailyReport.summary.totalScreenTime}m</Text>
                                        <Text style={styles.summaryLabel}>Screen Time</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryValue}>{dailyReport.summary.tasksCompleted}</Text>
                                        <Text style={styles.summaryLabel}>Tasks Completed</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryValue}>{dailyReport.summary.goalsProgressed}</Text>
                                        <Text style={styles.summaryLabel}>Goals Progressed</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryValue}>{dailyReport.summary.penaltiesComplied}</Text>
                                        <Text style={styles.summaryLabel}>Penalties Complied</Text>
                                    </View>
                                </View>
                            </View>

                            {dailyReport.achievements.length > 0 && (
                                <View style={styles.achievementsSection}>
                                    <Text style={styles.reportTitle}>Achievements</Text>
                                    {dailyReport.achievements.map((achievement, index) => (
                                        <View key={index} style={styles.achievementItem}>
                                            <Ionicons name="trophy" size={16} color="#F59E0B" />
                                            <Text style={styles.achievementText}>{achievement}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {dailyReport.recommendations.length > 0 && (
                                <View style={styles.recommendationsSection}>
                                    <Text style={styles.reportTitle}>Recommendations</Text>
                                    {dailyReport.recommendations.map((recommendation, index) => (
                                        <View key={index} style={styles.recommendationItem}>
                                            <Ionicons name="bulb" size={16} color="#8B5CF6" />
                                            <Text style={styles.recommendationText}>{recommendation}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </ScrollView>
                )}
            </View>
        </Modal>
    );

    const getSeverityColor = (severity: string): string => {
        switch (severity) {
            case 'low': return '#F59E0B';
            case 'medium': return '#EF4444';
            case 'high': return '#DC2626';
            case 'critical': return '#991B1B';
            default: return '#6B7280';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading parental controls...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Parental Controls</Text>
                <View style={styles.headerSpacer} />
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Family Overview */}
                {dashboard && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Family Overview</Text>

                        <View style={styles.familyStatsCard}>
                            <View style={styles.familyStatItem}>
                                <Text style={styles.familyStatValue}>{dashboard.familyStats.totalScreenTime}m</Text>
                                <Text style={styles.familyStatLabel}>Total Screen Time</Text>
                            </View>
                            <View style={styles.familyStatItem}>
                                <Text style={styles.familyStatValue}>{dashboard.familyStats.totalTasksCompleted}</Text>
                                <Text style={styles.familyStatLabel}>Tasks Completed</Text>
                            </View>
                            <View style={styles.familyStatItem}>
                                <Text style={styles.familyStatValue}>{dashboard.familyStats.familyScore}</Text>
                                <Text style={styles.familyStatLabel}>Family Score</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Children */}
                {dashboard && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Children</Text>

                        {dashboard.children.map((child) => (
                            <ChildCard key={child.id} child={child} />
                        ))}
                    </View>
                )}

                {/* Alerts */}
                {dashboard && dashboard.alerts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Alerts</Text>

                        {dashboard.alerts.slice(0, 3).map((alert) => (
                            <View key={alert.id} style={styles.alertCard}>
                                <View style={styles.alertHeader}>
                                    <Ionicons
                                        name={alert.type === 'violation' ? 'warning' : 'information-circle'}
                                        size={20}
                                        color={alert.type === 'violation' ? '#EF4444' : '#3B82F6'}
                                    />
                                    <Text style={styles.alertTitle}>{alert.title}</Text>
                                    <Text style={styles.alertTime}>
                                        {new Date(alert.timestamp).toLocaleTimeString()}
                                    </Text>
                                </View>
                                <Text style={styles.alertMessage}>{alert.message}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <SettingsModal />
            <ViolationsModal />
            <ReportModal />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1F2937',
    },
    familyStatsCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    familyStatItem: {
        alignItems: 'center',
    },
    familyStatValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    familyStatLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    childCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    childHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    childInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    childName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    childActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#F3F4F6',
    },
    childStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statLabel: {
        fontSize: 10,
        color: '#6B7280',
        marginTop: 2,
    },
    currentActivity: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    alertCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 8,
        flex: 1,
    },
    alertTime: {
        fontSize: 10,
        color: '#6B7280',
    },
    alertMessage: {
        fontSize: 12,
        color: '#374151',
        marginLeft: 28,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    closeButton: {
        padding: 8,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    modalSection: {
        marginVertical: 16,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    settingLabel: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    numberInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        width: 80,
        textAlign: 'center',
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        width: 80,
        textAlign: 'center',
    },
    modalFooter: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    emergencyButton: {
        backgroundColor: '#EF4444',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    violationCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
    },
    violationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    severityIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    violationType: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2937',
        textTransform: 'uppercase',
        flex: 1,
    },
    violationTime: {
        fontSize: 10,
        color: '#6B7280',
    },
    violationDescription: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
    },
    resolveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
        gap: 4,
    },
    resolveButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    reportCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reportDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    reportSummary: {
        marginBottom: 16,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    summaryItem: {
        width: '45%',
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    achievementsSection: {
        marginBottom: 16,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    achievementText: {
        fontSize: 14,
        color: '#374151',
        marginLeft: 8,
    },
    recommendationsSection: {
        marginBottom: 16,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    recommendationText: {
        fontSize: 14,
        color: '#374151',
        marginLeft: 8,
        flex: 1,
    },
});

export default ParentalControlsScreen;

